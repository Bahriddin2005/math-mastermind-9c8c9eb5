import { Upload } from "tus-js-client";
import { supabase } from "@/integrations/supabase/client";

type ResumableUploadOptions = {
  bucket: string;
  objectName: string;
  file: File;
  onProgress?: (percent: number) => void;
  upsert?: boolean;
};

export async function uploadResumableToPublicBucket({
  bucket,
  objectName,
  file,
  onProgress,
  upsert = true,
}: ResumableUploadOptions): Promise<string> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session?.access_token) throw new Error("Avval tizimga kiring");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (!supabaseUrl || !apikey) throw new Error("Backend sozlamalari topilmadi");

  const directStorageHost = supabaseUrl.replace(".supabase.co", ".storage.supabase.co");
  const endpoint = `${directStorageHost}/storage/v1/upload/resumable`;

  await new Promise<void>((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      headers: {
        authorization: `Bearer ${session.access_token}`,
        apikey,
        "x-upsert": upsert ? "true" : "false",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: bucket,
        objectName,
        contentType: file.type,
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024,
      onError: (error) => reject(error),
      onProgress: (bytesUploaded, bytesTotal) => {
        const pct = Math.round((bytesUploaded / bytesTotal) * 100);
        onProgress?.(pct);
      },
      onSuccess: () => resolve(),
    });

    upload.findPreviousUploads().then((previous) => {
      if (previous.length > 0) {
        upload.resumeFromPreviousUpload(previous[0]!);
      }
      upload.start();
    });
  });

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectName);
  return data.publicUrl;
}
