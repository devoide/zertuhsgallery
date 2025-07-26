import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { Field, Formik } from "formik";

export const StoryForm = () => {
  return (
    <Formik
      initialValues={{
        title: "",
        description: "",
        file: null,
      }}
      onSubmit={(values) => {
        console.log(values.file);
      }}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="flex-start">
            <FormControl isRequired>
              <FormLabel htmlFor="title">Title</FormLabel>
              <Field as={Input} id="title" name="title" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="story">Story</FormLabel>
              <Field as={Textarea} id="story" name="story" />
            </FormControl>
            <Button type="submit" colorScheme="purple">
              Upload
            </Button>
          </VStack>
        </form>
      )}
    </Formik>
  );
};
