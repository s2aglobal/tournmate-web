import { getFunctions, httpsCallable, FunctionsError } from "firebase/functions";
import app from "./firebase";

/** Callables live in us-central1, same as the apps' CloudFunctions wrappers. */
const functions = getFunctions(app, "us-central1");

/**
 * Validates and moderates an uploaded photo at `path`
 * (`profilePhotos/{uid}/{photoId}.jpg`), then sets it on the caller's player.
 */
export async function setProfilePhoto(path: string): Promise<{ photoURL: string }> {
  const fn = httpsCallable<{ path: string }, { photoURL: string }>(functions, "setProfilePhoto");
  return (await fn({ path })).data;
}

/** Clears the caller's photo and deletes their files. Idempotent. */
export async function removeProfilePhoto(): Promise<{ status: string }> {
  const fn = httpsCallable<Record<string, never>, { status: string }>(functions, "removeProfilePhoto");
  return (await fn({})).data;
}

/** The server's user-facing HttpsError message, or `fallback`. */
export function callableErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof FunctionsError && err.message && err.code !== "functions/internal") {
    return err.message;
  }
  return fallback;
}
