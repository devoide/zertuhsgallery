import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Image,
} from "@chakra-ui/react";
import { Field, Formik } from "formik";
import { useRef, useTransition } from "react";
import { supabase } from "../supabase/client";
import { uploadImage } from "../supabase/storage/uploadImage";

export const DrawingForm = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Formik
      initialValues={{
        title: "",
        description: "",
        file: null,
      }}
      onSubmit={(values, actions) => {
        startTransition(async () => {
          if (!values.file) return;

          const { imageUrl, error } = await uploadImage({
            file: values.file,
            bucket: "images",
            folder: "drawings",
          });

          if (error) {
            console.error("Upload failed:", error);
            return;
          }

          const { error: dbError } = await supabase.from("images").insert({
            title: values.title,
            description: values.description,
            image_url: imageUrl,
          });

          if (dbError) {
            console.error("DB insert failed:", dbError);
            return;
          }

          actions.resetForm();
        });
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
                disabled={isPending}
              />
              <Button
                onClick={() => inputRef.current?.click()}
                colorScheme="purple"
              >
                Choose File
              </Button>
              {values.file && (
                <VStack spacing={0} align="flex-start">
                  <Text fontSize="sm" mt={2}>
                    Selected: {(values.file as File).name}
                  </Text>
                  <Image
                    src={URL.createObjectURL(values.file as File)}
                    maxH="200px"
                  />
                </VStack>
              )}
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="title">Title</FormLabel>
              <Field as={Input} id="title" name="title" disabled={isPending} />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="description">Description</FormLabel>
              <Field
                as={Input}
                id="description"
                name="description"
                disabled={isPending}
              />
            </FormControl>
            <Button type="submit" colorScheme="purple" disabled={isPending}>
              {isPending ? "Uploading..." : "Upload"}
            </Button>
          </VStack>
        </form>
      )}
    </Formik>
  );
};
