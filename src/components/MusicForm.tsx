import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
} from "@chakra-ui/react";
import { Field, Formik } from "formik";
import { useRef, useTransition } from "react";
import { uploadAudio } from "../supabase/storage/uploadAudio";
import { supabase } from "../supabase/client";

export const MusicForm = () => {
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

          const { audioUrl, error } = await uploadAudio({
            file: values.file,
            bucket: "images", //ignore ts too lazy to add new bucket lol
            folder: "audio",
          });

          if (error) {
            console.error("Upload failed:", error);
            return;
          }

          const { error: dbError } = await supabase
            .from("compositions")
            .insert({
              title: values.title,
              description: values.description,
              audio_url: audioUrl,
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
              <FormLabel>Upload Music</FormLabel>
              <input
                type="file"
                accept="audio/*"
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
                <Text fontSize="sm" mt={2}>
                  Selected: {(values.file as File).name}
                </Text>
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
