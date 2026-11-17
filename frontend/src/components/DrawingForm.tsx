import {
  Button,
  Field,
  FileUpload,
  HStack,
  Input,
  VStack,
} from "@chakra-ui/react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { HiUpload } from "react-icons/hi";
import { uploadImage } from "../supabase/storage/uploadImage";
import { supabase } from "../supabase/client";

interface FormValues {
  title: string;
  description?: string;
  file: File | null;
}

export const DrawingForm = () => {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, setValue, reset } = useForm<FormValues>();

  const onSubmit = handleSubmit((data: FormValues) => {
    startTransition(async () => {
      if (!data.file) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("no zertuh user");
        return;
      }

      const { imageUrl, error } = await uploadImage({
        file: data.file,
        bucket: "images",
        folder: "drawings",
      });

      if (error) {
        console.error("Upload failed:", error);
        return;
      }

      const { error: dbError } = await supabase.from("images").insert({
        title: data.title,
        description: data.description,
        image_url: imageUrl,
        author: user.id,
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
            Upload Drawing <Field.RequiredIndicator />
          </Field.Label>
          <FileUpload.Root
            accept={["image/*"]}
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
            <FileUpload.ItemGroup w="auto">
              <FileUpload.Context>
                {({ acceptedFiles }) =>
                  acceptedFiles.map((file) => (
                    <FileUpload.Item key={file.name} file={file}>
                      <VStack align={"start"}>
                        <HStack width={"full"} justify={"space-between"}>
                          <FileUpload.ItemName />
                          <FileUpload.ItemDeleteTrigger />
                        </HStack>
                        <FileUpload.ItemSizeText />
                        <FileUpload.ItemPreviewImage maxH={"sm"} />
                      </VStack>
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
          variant={"outline"}
        >
          Upload
        </Button>
      </VStack>
    </form>
  );
};
