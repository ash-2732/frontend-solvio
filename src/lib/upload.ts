import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadToFirebase(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const filePath = `waste-reports/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });

      console.log(`[upload] starting: ${file.name} -> ${filePath}`);
      let lastPercent = -1;

      uploadTask.on(
        "state_changed",
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          const rounded = Math.round(progress);
          // Only log on whole percent increments
          if (rounded !== lastPercent) {
            lastPercent = rounded;
            console.log(`[upload] progress: ${rounded}%`);
          }
          onProgress?.(rounded);
        },
        (err: unknown) => {
          console.error("[upload] error:", err);
          reject(err);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("[upload] complete, url:", url);
            resolve(url);
          } catch (e) {
            console.error("[upload] error getting download URL:", e);
            reject(e);
          }
        }
      );
    } catch (err) {
      console.error("[upload] unexpected error:", err);
      reject(err);
    }
  });
}
