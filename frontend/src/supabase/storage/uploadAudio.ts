import { v4 as uuidv4 } from "uuid";
import { supabase } from "../client";

type UploadProps = {
  file: File;
  cover?: File;
  bucket: string;
  folder?: string;
};

export async function uploadAudio({
  file,
  cover,
  bucket,
  folder,
}: UploadProps) {
  const fileName = file.name;
  const fileExtension = fileName.slice(fileName.lastIndexOf(".") + 1);
  const audioPath = `${folder ? folder + "/" : ""}${uuidv4()}.${fileExtension}`;

  const coverName = cover?.name;
  const coverExtension = cover
    ? coverName?.slice(coverName.lastIndexOf(".") + 1)
    : "";
  const coverPath = cover
    ? `COVER-${folder ? folder + "/" : ""}${uuidv4()}.${coverExtension}`
    : "";

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(audioPath, file, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error(uploadError);
      return { audioUrl: "", coverUrl: "", error: "Audio upload failed" };
    }

    let coverUrl = "";

    if (cover && coverPath) {
      const { error: coverError } = await supabase.storage
        .from(bucket)
        .upload(coverPath, cover, {
          contentType: cover.type,
        });

      if (coverError) {
        console.error(coverError);
      } else {
        const { data: publicCoverUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(coverPath);

        coverUrl = publicCoverUrlData.publicUrl;
      }
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(audioPath);

    return { audioUrl: publicUrlData.publicUrl, coverUrl, error: null };
  } catch (error) {
    console.error(error);
    return { audioUrl: "", coverUrl: "", error: "Upload failed" };
  }
}
