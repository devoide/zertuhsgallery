import {
  Avatar,
  Button,
  Heading,
  HStack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../auth";

export const Navigation = () => {
  const { userId, profile } = useCurrentUser();
  const navigate = useNavigate();
  const paddingX = useBreakpointValue({
    base: 4,
    md: 10,
  });

  return (
    <HStack
      shadow={"sm"}
      paddingY={4}
      paddingX={paddingX}
      position={"sticky"}
      top={0}
      bg={"gray.900"}
      zIndex={"banner"}
      justify={"space-between"}
    >
      <Heading
        size={{ base: "3xl", md: "4xl" }}
        fontWeight={"bold"}
        onClick={() => navigate("/")}
        _hover={{ cursor: "pointer" }}
      >
        Zertuh's Gallery
      </Heading>
      {userId && (
        <HStack gap={3}>
          <Button
            variant={"outline"}
            onClick={() => {
              navigate("/upload");
            }}
          >
            Upload
          </Button>
          <Button
            variant={"ghost"}
            px={2}
            gap={2}
            onClick={() => navigate("/profile")}
            aria-label="Profile"
          >
            <Avatar.Root size={"sm"} colorPalette={profile?.color ?? "gray"}>
              <Avatar.Fallback name={profile?.username} />
              {profile?.avatar_url && <Avatar.Image src={profile.avatar_url} />}
            </Avatar.Root>
            {/* name hidden on small screens to keep the header on one line */}
            <Text display={{ base: "none", md: "block" }}>
              {profile?.username}
            </Text>
          </Button>
        </HStack>
      )}
    </HStack>
  );
};
