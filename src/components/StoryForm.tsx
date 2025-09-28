import {
  Button,
  Field,
  FileUpload,
  Input,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { uploadStory } from "../supabase/uploadStory";

interface FormValues {
  title: string;
  story: string;
}

export const StoryForm = () => {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, setValue } = useForm<FormValues>();

  const onSubmit = handleSubmit((data: FormValues) => {
    startTransition(async () => {
      const { success, error } = await uploadStory({
        title: data.title,
        story: data.story,
      });

      if (!success) {
        console.error(error);
        return;
      }
    });
  });
  return (
    <form onSubmit={onSubmit}>
      <VStack gap={4} align={"flex-start"}>
        <Field.Root required>
          <Field.Label>
            Title
            <Field.RequiredIndicator />
          </Field.Label>
          <Input disabled={isPending} {...register("title")} />
        </Field.Root>
        <Field.Root required>
          <Field.Label>
            Story
            <Field.RequiredIndicator />
          </Field.Label>
          <Textarea disabled={isPending} {...register("story")} rows={10} />
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
