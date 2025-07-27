import imageCompression from "browser-image-compression";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../client";

type UploadProps = {
  file: File;
  bucket: string;
  folder?: string;
};

export async function uploadImage({ file, bucket, folder }: UploadProps) {
  const fileName = file.name;
  const fileExtension = fileName.slice(fileName.lastIndexOf(".") + 1);
  const path = `${folder ? folder + "/" : ""}${uuidv4()}.${fileExtension}`;

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 2,
    });
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, compressedFile);

    if (uploadError) {
      console.error(uploadError);
      return { imageUrl: "", error: "Upload failed" };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return { imageUrl: publicUrlData.publicUrl, error: null };
  } catch (error) {
    console.error(error);
    return { imageUrl: "", error: "Image compression failed" };
  }
}
