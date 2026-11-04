import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { FirebaseError } from "firebase/app";
import app from "./firebase";
import { setProfilePhoto } from "./functions";

const storage = getStorage(app);

const PHOTO_SIZE = 512;
const JPEG_QUALITY = 0.8;

/**
 * A client-side failure (bad file, failed upload) whose message is safe to
 * show as is. Callers show it via `callableErrorMessage`.
 */
export class PhotoUploadError extends Error {
  name = "PhotoUploadError";
}

const UNREADABLE = "This file can't be read as an image. Please choose a different one.";
const PROCESS_FAILED = "Couldn't process this photo. Please choose a different one.";

function uploadFailedMessage(err: unknown): string {
  const code = err instanceof FirebaseError ? err.code : "";
  if (code === "storage/unauthorized") return "You can't upload this photo. Please sign in again and retry.";
  if (code === "storage/canceled") return "Upload cancelled.";
  if (code === "storage/retry-limit-exceeded") return "Upload timed out. Check your connection and try again.";
  return "Couldn't upload your photo. Check your connection and try again.";
}

/** Center-crops `file` to a square and resizes it to 512x512 JPEG. */
export async function squareJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new PhotoUploadError(UNREADABLE);
  });
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = PHOTO_SIZE;
    canvas.height = PHOTO_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new PhotoUploadError(PROCESS_FAILED);
    // JPEG has no alpha: transparent areas would otherwise come out black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, PHOTO_SIZE, PHOTO_SIZE);
    ctx.drawImage(
      bitmap,
      (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side,
      0, 0, PHOTO_SIZE, PHOTO_SIZE,
    );
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new PhotoUploadError(PROCESS_FAILED))),
        "image/jpeg",
        JPEG_QUALITY,
      );
    });
  } finally {
    bitmap.close();
  }
}

/**
 * Crops, uploads to `profilePhotos/{uid}/{photoId}.jpg` and asks the server to
 * set it (moderation happens there). `onProgress` gets 0–1 for the upload.
 * Throws PhotoUploadError for local/upload failures, or the callable's
 * HttpsError on rejection; show either with `callableErrorMessage`.
 */
export async function uploadProfilePhoto(
  uid: string,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const blob = await squareJpeg(file);
  const path = `profilePhotos/${uid}/${crypto.randomUUID()}.jpg`;
  const task = uploadBytesResumable(ref(storage, path), blob, { contentType: "image/jpeg" });
  await new Promise<void>((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => onProgress?.(snap.totalBytes ? snap.bytesTransferred / snap.totalBytes : 0),
      (err) => reject(new PhotoUploadError(uploadFailedMessage(err))),
      () => resolve(),
    );
  });
  return (await setProfilePhoto(path)).photoURL;
}
