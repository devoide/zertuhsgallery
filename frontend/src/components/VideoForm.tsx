import {
  AspectRatio,
  Box,
  Button,
  Field,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../supabase/client";
import { uploadVideo } from "../supabase/uploadVideo";
import { parseYouTubeId, youTubeEmbedUrl } from "../supabase/youtube";

interface FormValues {
  url: string;
  title: string;
  description: string;
}

export const VideoForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, watch } = useForm<FormValues>();

  const url = watch("url") ?? "";
  const videoId = parseYouTubeId(url);
  const invalidUrl = url.trim() !== "" && !videoId;

  const onSubmit = handleSubmit((data: FormValues) => {
    const youtubeId = parseYouTubeId(data.url);
    if (!youtubeId) {
      setError("That doesn't look like a YouTube link.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You need to be logged in.");
        return;
      }

      const { success, error } = await uploadVideo({
        title: data.title,
        description: data.description,
        source: "youtube",
        videoRef: youtubeId,
        author: user.id,
      });

      if (!success) {
        setError(error ?? "Upload failed.");
        return;
      }
      reset();
    });
  });

  return (
    <form onSubmit={onSubmit}>
      <VStack gap={4} align={"flex-start"}>
        <Field.Root required invalid={invalidUrl}>
          <Field.Label>
            YouTube link
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            disabled={isPending}
            placeholder="https://www.youtube.com/watch?v=…"
            {...register("url")}
          />
          <Field.ErrorText>That doesn't look like a YouTube link.</Field.ErrorText>
        </Field.Root>

        {/* preview of what will be posted */}
        {videoId && (
          <Box w={"full"} maxW={"xl"} rounded={"md"} overflow={"hidden"}>
            <AspectRatio ratio={16 / 9}>
              <iframe
                src={youTubeEmbedUrl(videoId)}
                title="Preview"
                style={{ border: 0 }}
                allow="encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </AspectRatio>
          </Box>
        )}

        <Field.Root required>
          <Field.Label>
            Title
            <Field.RequiredIndicator />
          </Field.Label>
          <Input disabled={isPending} {...register("title")} />
        </Field.Root>
        <Field.Root>
          <Field.Label>Description</Field.Label>
          <Textarea disabled={isPending} {...register("description")} rows={4} />
        </Field.Root>

        {error && (
          <Text fontSize={"sm"} color={"fg.error"}>
            {error}
          </Text>
        )}
        <Button
          loading={isPending}
          loadingText={"Uploading"}
          type="submit"
          variant={"outline"}
          disabled={invalidUrl}
        >
          Upload
        </Button>
      </VStack>
    </form>
  );
};
