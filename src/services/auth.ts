import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  return credential.user;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signInWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function signInWithApple(): Promise<User> {
  const credential = await signInWithPopup(auth, appleProvider);
  return credential.user;
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function sendEmailVerification(): Promise<void> {
  const user = auth.currentUser;
  if (user) await firebaseSendEmailVerification(user);
}

export async function reloadCurrentUser(): Promise<User | null> {
  const user = auth.currentUser;
  if (user) {
    await user.reload();
    return auth.currentUser;
  }
  return null;
}

/**
 * Whether email verification is required in the current environment.
 * Production enforces verification; dev skips it for testing convenience.
 */
export function isVerificationRequired(): boolean {
  return import.meta.env.PROD;
}

/**
 * Whether the given user needs email verification.
 * Google/Apple users are already verified by their provider.
 */
export function needsEmailVerification(user: User): boolean {
  if (!isVerificationRequired()) return false;
  if (user.emailVerified) return false;
  const isOAuth = user.providerData.some(
    (p) => p.providerId === "google.com" || p.providerId === "apple.com"
  );
  return !isOAuth;
}
