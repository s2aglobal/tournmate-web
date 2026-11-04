import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
import app from "./firebase";
import { setProfilePhoto } from "./functions";

const storage = getStorage(app);

const PHOTO_SIZE = 512;
const JPEG_QUALITY = 0.8;

/** Center-crops `file` to a square and resizes it to 512x512 JPEG. */
export async function squareJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("This file can't be read as an image. Please choose a different one.");
  });
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = PHOTO_SIZE;
    canvas.height = PHOTO_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't process this photo.");
    ctx.drawImage(
      bitmap,
      (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side,
      0, 0, PHOTO_SIZE, PHOTO_SIZE,
    );
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Couldn't process this photo."))),
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
 * Throws the callable's HttpsError on rejection.
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
      reject,
      () => resolve(),
    );
  });
  return (await setProfilePhoto(path)).photoURL;
}
