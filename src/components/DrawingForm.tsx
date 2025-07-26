import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
} from "@chakra-ui/react";
import { Field, Formik } from "formik";
import { useRef } from "react";

export const DrawingForm = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
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
      {({ handleSubmit, setFieldValue, values }) => (
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="flex-start">
            <FormControl isRequired>
              <FormLabel>Upload Drawing</FormLabel>
              <input
                type="file"
                accept="image/*"
                ref={inputRef}
                style={{ display: "none" }}
                onChange={(event) => {
                  setFieldValue("file", event.currentTarget.files?.[0] ?? null);
                }}
              />
              <Button
                onClick={() => inputRef.current?.click()}
                colorScheme="purple"
              >
                Choose File
              </Button>
              {values.file && (
                <Text fontSize="sm" mt={2}>
                  Selected: {(values.file as File).name}
                </Text>
              )}
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="title">Title</FormLabel>
              <Field as={Input} id="title" name="title" />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="description">Description</FormLabel>
              <Field as={Input} id="description" name="description" />
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
