import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { Field, Formik } from "formik";
import { uploadStory } from "../supabase/uploadStory";
import { useTransition } from "react";

export const StoryForm = () => {
  const [isPending, startTransition] = useTransition();
  return (
    <Formik
      initialValues={{
        title: "",
        story: "",
      }}
      onSubmit={(values, actions) => {
        startTransition(async () => {
          const { success, error } = await uploadStory({
            title: values.title,
            story: values.story,
          });

          if (!success) {
            console.error(error);
            return;
          }

          actions.resetForm();
        });
      }}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="flex-start">
            <FormControl isRequired>
              <FormLabel htmlFor="title">Title</FormLabel>
              <Field as={Input} id="title" name="title" disabled={isPending} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="story">Story</FormLabel>
              <Field
                as={Textarea}
                id="story"
                name="story"
                rows={10}
                disabled={isPending}
              />
            </FormControl>
            <Button type="submit" colorScheme="purple">
              {isPending ? "Uploading..." : "Upload"}
            </Button>
          </VStack>
        </form>
      )}
    </Formik>
  );
};
