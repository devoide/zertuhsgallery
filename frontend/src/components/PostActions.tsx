import { useState } from "react";
import {
  Button,
  Field,
  HStack,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import type { PostEdit } from "../supabase/managePosts";

/** passed to a card only when the logged-in user owns the post */
export type PostManage = {
  /** resolve to an error message, or null on success */
  onSave: (edit: PostEdit) => Promise<string | null>;
  onDelete: () => Promise<string | null>;
};

interface PostOwnerActionsProps {
  onEdit: () => void;
  onDelete: PostManage["onDelete"];
}

/** Edit + Delete (with an inline "are you sure?") for the post's owner */
export const PostOwnerActions = ({ onEdit, onDelete }: PostOwnerActionsProps) => {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = async () => {
    setBusy(true);
    setError(null);
    const err = await onDelete();
    // on success the card is removed from the page, so only handle failure
    if (err) {
      setError(err);
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <VStack align="stretch" w="full" gap={2}>
      <HStack justify="flex-end" w="full">
        {confirming ? (
          <>
            <Text fontSize="sm" color="fg.muted" mr="auto">
              Delete this post for good?
            </Text>
            <Button
              size="sm"
              variant="outline"
              borderColor="gray.600"
              disabled={busy}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              colorPalette="red"
              loading={busy}
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              borderColor="gray.600"
              onClick={onEdit}
            >
              <LuPencil /> Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorPalette="red"
              onClick={() => setConfirming(true)}
            >
              <LuTrash2 /> Delete
            </Button>
          </>
        )}
      </HStack>
      {error && (
        <Text fontSize="sm" color="fg.error">
          {error}
        </Text>
      )}
    </VStack>
  );
};

interface PostEditFormProps {
  initialTitle: string;
  initialText: string;
  /** "Story" for stories, "Description" otherwise */
  textLabel: string;
  rows: number;
  onSave: PostManage["onSave"];
  onDone: () => void;
}

export const PostEditForm = ({
  initialTitle,
  initialText,
  textLabel,
  rows,
  onSave,
  onDone,
}: PostEditFormProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [text, setText] = useState(initialText);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!title.trim()) {
      setError("Title can't be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    const err = await onSave({ title: title.trim(), text });
    setSaving(false);
    if (err) setError(err);
    else onDone();
  };

  return (
    <VStack align="stretch" w="full" gap={4}>
      <Field.Root required>
        <Field.Label>Title</Field.Label>
        <Input
          value={title}
          // default border = gray.800 = modal bg, so it'd be invisible here
          borderColor="gray.600"
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>{textLabel}</Field.Label>
        <Textarea
          value={text}
          rows={rows}
          borderColor="gray.600"
          onChange={(e) => setText(e.target.value)}
        />
      </Field.Root>
      {error && (
        <Text fontSize="sm" color="fg.error">
          {error}
        </Text>
      )}
      <HStack justify="flex-end">
        <Button
          variant="outline"
          size="sm"
          borderColor="gray.600"
          disabled={saving}
          onClick={onDone}
        >
          Cancel
        </Button>
        <Button size="sm" loading={saving} onClick={save}>
          Save
        </Button>
      </HStack>
    </VStack>
  );
};
