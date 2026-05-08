import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const playersRef = collection(db, "players");

export interface PlayerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  genderRaw: string;
  elo: number;
  streak: number;
  avatarId: string;
  homeCountryCode?: string;
  homePostalCode?: string;
}

export interface CreatePlayerPayload {
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female";
  avatarId?: string;
  homeCountryCode?: string;
  homePostalCode?: string;
  dateOfBirth?: string;
}

export async function getMyPlayer(
  firebaseUid: string
): Promise<PlayerProfile | null> {
  try {
    const q = query(
      playersRef,
      where("firebaseUid", "==", firebaseUid),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as PlayerProfile;
  } catch {
    return null;
  }
}

export async function createPlayer(
  firebaseUid: string,
  data: CreatePlayerPayload
): Promise<PlayerProfile> {
  // Check if profile already exists for this UID
  const existingByUid = query(
    playersRef,
    where("firebaseUid", "==", firebaseUid),
    limit(1)
  );
  const uidSnap = await getDocs(existingByUid);
  if (!uidSnap.empty) {
    const existing = uidSnap.docs[0];
    return { id: existing.id, ...existing.data() } as PlayerProfile;
  }

  // Check for duplicate email
  const existingByEmail = query(
    playersRef,
    where("email", "==", data.email.toLowerCase()),
    limit(1)
  );
  const emailSnap = await getDocs(existingByEmail);
  if (!emailSnap.empty) {
    throw new Error("An account with this email already exists.");
  }

  const id = crypto.randomUUID();
  const playerDoc: Record<string, unknown> = {
    name: data.name.trim(),
    phone: data.phone?.trim() ?? "",
    email: data.email.toLowerCase().trim(),
    genderRaw: data.gender,
    elo: 1200,
    streak: 0,
    firebaseUid,
    avatarId: data.avatarId ?? "adventurer",
    homeCountryCode: data.homeCountryCode ?? null,
    homePostalCode: data.homePostalCode ?? null,
    createdAt: Timestamp.now(),
  };

  if (data.dateOfBirth) {
    playerDoc.dateOfBirth = Timestamp.fromDate(new Date(data.dateOfBirth));
  }

  await setDoc(doc(db, "players", id), playerDoc);

  return { id, ...playerDoc } as unknown as PlayerProfile;
}
