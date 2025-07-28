import { v4 as uuidv4 } from "uuid";
import { supabase } from "../client";

type UploadProps = {
  file: File;
  bucket: string;
  folder?: string;
};

export async function uploadAudio({ file, bucket, folder }: UploadProps) {
  const fileName = file.name;
  const fileExtension = fileName.slice(fileName.lastIndexOf(".") + 1);
  const path = `${folder ? folder + "/" : ""}${uuidv4()}.${fileExtension}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error(uploadError);
      return { audioUrl: "", error: "Upload failed" };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return { audioUrl: publicUrlData.publicUrl, error: null };
  } catch (error) {
    console.error(error);
    return { audioUrl: "", error: "Upload failed" };
  }
}
