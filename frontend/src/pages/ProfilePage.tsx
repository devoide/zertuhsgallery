import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Center,
  Container,
  Field,
  Heading,
  HStack,
  Input,
  Separator,
  Spinner,
  Text,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { LuImagePlus, LuLogOut, LuTrash2 } from "react-icons/lu";
import { Navigate, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../auth";
import { AuthorBadge } from "../components/AuthorBadge";
import { AvatarCropDialog } from "../components/AvatarCropDialog";
import {
  PROFILE_COLORS,
  deleteAvatar,
  updateProfile,
  uploadAvatar,
} from "../supabase/profile";

export const ProfilePage = () => {
  const { userId, profile, loading, refreshProfile, signOut } =
    useCurrentUser();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [color, setColor] = useState("gray");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  // picked but not yet cropped; the crop dialog is open while set
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // fill the form once the profile has loaded
  useEffect(() => {
    if (!profile) return;
    setUsername(profile.username ?? "");
    setColor(profile.color ?? "gray");
  }, [profile]);

  // local preview of a picked file; free it when replaced/unmounted
  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  if (loading) {
    return (
      <Center h="60vh">
        <Spinner size="xl" />
      </Center>
    );
  }
  if (!userId) return <Navigate to="/zertuh" replace />;

  const shownAvatar = removeAvatar
    ? null
    : (avatarPreview ?? profile?.avatar_url ?? null);

  const save = async () => {
    const name = username.trim();
    if (name.length < 3) {
      setError("Name must be at least 3 characters.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);

    const oldAvatar = profile?.avatar_url ?? null;
    let avatarUrl = removeAvatar ? null : oldAvatar;
    let uploaded: string | null = null;

    if (avatarFile) {
      const res = await uploadAvatar(userId, avatarFile);
      if (res.error || !res.url) {
        setError(res.error ?? "Avatar upload failed.");
        setSaving(false);
        return;
      }
      avatarUrl = uploaded = res.url;
    }

    const err = await updateProfile(userId, {
      username: name,
      color,
      avatar_url: avatarUrl,
    });

    if (err) {
      // profile wasn't saved, so the new upload would be an orphan
      if (uploaded) await deleteAvatar(uploaded);
      setError(err);
    } else {
      if (oldAvatar && oldAvatar !== avatarUrl) await deleteAvatar(oldAvatar);
      setAvatarFile(null);
      setRemoveAvatar(false);
      await refreshProfile();
      setSaved(true);
    }
    setSaving(false);
  };

  return (
    <Container maxW={"md"} py={10}>
      <VStack align={"stretch"} gap={6}>
        <Heading size={"2xl"}>Profile</Heading>

        {/* avatar */}
        <HStack gap={5}>
          <Avatar.Root size={"2xl"} colorPalette={color}>
            <Avatar.Fallback name={username} />
            {shownAvatar && <Avatar.Image src={shownAvatar} />}
          </Avatar.Root>
          <VStack align={"flex-start"} gap={2}>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPendingFile(file); // → crop dialog
                e.target.value = ""; // allow picking the same file again
              }}
            />
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => fileInput.current?.click()}
            >
              <LuImagePlus /> Change picture
            </Button>
            {shownAvatar && (
              <Button
                size={"sm"}
                variant={"outline"}
                colorPalette={"red"}
                onClick={() => {
                  setAvatarFile(null);
                  setRemoveAvatar(true);
                  setSaved(false);
                }}
              >
                <LuTrash2 /> Remove
              </Button>
            )}
          </VStack>
        </HStack>

        <AvatarCropDialog
          file={pendingFile}
          onCancel={() => setPendingFile(null)}
          onCropped={(cropped) => {
            setPendingFile(null);
            setAvatarFile(cropped);
            setRemoveAvatar(false);
            setSaved(false);
          }}
        />

        <Field.Root required>
          <Field.Label>Name</Field.Label>
          <Input
            value={username}
            maxLength={32}
            onChange={(e) => {
              setUsername(e.target.value);
              setSaved(false);
            }}
          />
          <Field.HelperText>At least 3 characters.</Field.HelperText>
        </Field.Root>

        <Field.Root>
          <Field.Label>Color</Field.Label>
          <Wrap gap={2}>
            {PROFILE_COLORS.map((c) => (
              <Box
                key={c}
                as="button"
                aria-label={c}
                aria-pressed={c === color}
                boxSize={"8"}
                rounded={"full"}
                bg={`${c}.500`}
                cursor={"pointer"}
                outline={c === color ? "2px solid" : "none"}
                outlineColor={"white"}
                outlineOffset={"2px"}
                onClick={() => {
                  setColor(c);
                  setSaved(false);
                }}
              />
            ))}
          </Wrap>
        </Field.Root>

        {/* how it'll look on posts */}
        <HStack gap={2}>
          <Text fontSize={"sm"} color={"gray.400"}>
            On your posts:
          </Text>
          <AuthorBadge
            author={{
              id: userId,
              username: username || "…",
              color,
              avatar_url: shownAvatar,
            }}
          />
        </HStack>

        {error && (
          <Text fontSize={"sm"} color={"fg.error"}>
            {error}
          </Text>
        )}
        {saved && (
          <Text fontSize={"sm"} color={"fg.success"}>
            Saved.
          </Text>
        )}

        <Button loading={saving} onClick={save}>
          Save
        </Button>

        <Separator />

        <Button
          variant={"outline"}
          colorPalette={"red"}
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
        >
          <LuLogOut /> Log out
        </Button>
      </VStack>
    </Container>
  );
};
