import { Button, Field, FileUpload, Input, VStack } from "@chakra-ui/react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { HiUpload } from "react-icons/hi";
import { supabase } from "../supabase/client";
import { uploadAudio } from "../supabase/storage/uploadAudio";

interface FormValues {
  title: string;
  description?: string;
  file: File | null;
}

export const MusicForm = () => {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, setValue, reset } = useForm<FormValues>();

  const onSubmit = handleSubmit((data: FormValues) => {
    startTransition(async () => {
      if (!data.file) return;

      const { audioUrl, error } = await uploadAudio({
        file: data.file,
        bucket: "images", //ignore ts too lazy to add new bucket lol
        folder: "audio",
      });

      if (error) {
        console.error("Upload failed:", error);
        return;
      }

      const { error: dbError } = await supabase.from("compositions").insert({
        title: data.title,
        description: data.description,
        audio_url: audioUrl,
      });

      if (dbError) {
        console.error("DB insert failed:", dbError);
        return;
      }

      reset();
    });
  });
  return (
    <form onSubmit={onSubmit}>
      <VStack gap={4} align={"flex-start"}>
        <Field.Root required>
          <Field.Label>
            Upload Music <Field.RequiredIndicator />
          </Field.Label>
          <FileUpload.Root
            accept={["audio/*"]}
            onFileAccept={(details) => {
              const file = details.files[0];
              setValue("file", file, { shouldValidate: true });
            }}
            maxFiles={1}
            key={Math.random()}
          >
            <FileUpload.HiddenInput />
            <FileUpload.Trigger asChild>
              <Button variant={"outline"}>
                <HiUpload /> Upload File
              </Button>
            </FileUpload.Trigger>
            <FileUpload.ItemGroup w={"auto"}>
              <FileUpload.Context>
                {({ acceptedFiles }) =>
                  acceptedFiles.map((file) => (
                    <FileUpload.Item key={file.name} file={file}>
                      <FileUpload.ItemPreview />
                      <FileUpload.ItemName />
                      <FileUpload.ItemSizeText />
                      <FileUpload.ItemDeleteTrigger />
                    </FileUpload.Item>
                  ))
                }
              </FileUpload.Context>
            </FileUpload.ItemGroup>
          </FileUpload.Root>
        </Field.Root>
        <Field.Root required>
          <Field.Label>
            Title
            <Field.RequiredIndicator />
          </Field.Label>
          <Input disabled={isPending} {...register("title")} />
        </Field.Root>
        <Field.Root>
          <Field.Label>Description</Field.Label>
          <Input disabled={isPending} {...register("description")} />
        </Field.Root>
        <Button
          loading={isPending}
          loadingText={"Uploading"}
          type="submit"
          variant={"solid"}
        >
          Upload
        </Button>
      </VStack>
    </form>
  );
};
