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

/**
 * Private profile fields the web sends. The web no longer collects a phone
 * number, and the email is never sent: the server always takes it from
 * Firebase Auth.
 */
export interface PrivateProfileInput {
  /** Epoch milliseconds (the server also accepts an ISO date). */
  dateOfBirth?: number;
  homePostalCode?: string;
  weightKg?: number;
}

/**
 * Writes the caller's owner-only `playerPrivate/{myId}` doc. The server
 * validates every field and refreshes the email from Auth.
 */
export async function updatePrivateProfile(input: PrivateProfileInput): Promise<void> {
  const fn = httpsCallable<PrivateProfileInput, unknown>(functions, "updatePrivateProfile");
  await fn(input);
}

/**
 * The server's user-facing HttpsError message, a PhotoUploadError's message
 * (see profilePhotos.ts), or `fallback`.
 */
export function callableErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.name === "PhotoUploadError") return err.message;
  if (err instanceof FunctionsError && err.message && err.code !== "functions/internal") {
    return err.message;
  }
  return fallback;
}
