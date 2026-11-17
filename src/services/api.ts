import {
  collection,
  query,
  where,
  limit,
  getDocs,
  getDoc,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteField,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import { updatePrivateProfile, type PrivateProfileInput } from "./functions";

const playersRef = collection(db, "players");

/**
 * The signed-in player's own profile: the public `players/{id}` doc merged
 * with the owner-only `playerPrivate/{id}` doc. Show the email from Firebase
 * Auth (`user.email`), not from here.
 */
export interface PlayerProfile {
  id: string;
  name: string;
  genderRaw: string;
  elo: number;
  streak: number;
  avatarId: string;
  /** Uploaded profile photo (server-written only). Missing/null/empty = none. */
  photoURL?: string | null;
  homeCountryCode?: string;
  // Private (from playerPrivate/{id}; older accounts may still have a public copy).
  phone?: string;
  homePostalCode?: string;
  dateOfBirth?: Timestamp;
  weightKg?: number;
}

/** Fields that live in `playerPrivate/{id}` and are never written to `players/{id}`. */
const PRIVATE_FIELDS = ["phone", "homePostalCode", "dateOfBirth", "weightKg"] as const;

export interface MatchStats {
  matchesPlayed: number;
  wins: number;
  winRate: number;
}

export interface SportsmanshipData {
  average: number;
  count: number;
}

export interface FitnessData {
  totalCalories: number;
  sessions: number;
  avgPerSession: number;
}

export interface CreatePlayerPayload {
  name: string;
  gender: "male" | "female";
  avatarId?: string;
  homeCountryCode?: string;
  homePostalCode?: string;
  /** "YYYY-MM-DD" from the date input. */
  dateOfBirth?: string;
  /** Sport id (e.g. "pickleball"); the apps open on this sport. */
  preferredSport?: string;
  /** "left" | "right", as the apps store it. */
  playingHand?: string;
  /** "beginner" | "intermediate" | "advanced" | "pro", as the apps store it. */
  skillLevel?: string;
}

function isSet(v: unknown): boolean {
  return v !== undefined && v !== null && v !== "";
}

/**
 * Public doc + private doc. A private value wins; until every account is
 * backfilled, a value still on the public doc is the fallback. The public
 * `email`/`phone` placeholders are never used for display.
 */
function mergeProfile(
  id: string,
  pub: DocumentData,
  priv: DocumentData | null
): PlayerProfile {
  const merged: Record<string, unknown> = { ...pub, id };
  delete merged.email;
  delete merged.fcmToken;
  for (const key of PRIVATE_FIELDS) {
    const value = priv && isSet(priv[key]) ? priv[key] : pub[key];
    if (isSet(value)) merged[key] = value;
    else delete merged[key];
  }
  return merged as unknown as PlayerProfile;
}

/**
 * The owner's private doc, or null when it doesn't exist yet or can't be read
 * (for example before the server's playerPrivate rules are deployed).
 */
async function getMyPrivate(playerId: string): Promise<DocumentData | null> {
  try {
    const snap = await getDoc(doc(db, "playerPrivate", playerId));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
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
    return mergeProfile(docSnap.id, docSnap.data(), await getMyPrivate(docSnap.id));
  } catch {
    return null;
  }
}

/**
 * Follows the player's public and private docs so changes made elsewhere (a
 * photo set in the app, the server clearing it, a postal code changed in the
 * app) show up without a reload. Returns the unsubscribe.
 */
export function watchPlayer(
  id: string,
  onChange: (player: PlayerProfile | null) => void
): () => void {
  let pub: DocumentData | null | undefined; // undefined = not loaded yet
  let priv: DocumentData | null = null;
  const emit = () => {
    if (pub === undefined) return;
    onChange(pub ? mergeProfile(id, pub, priv) : null);
  };
  const stopPublic = onSnapshot(
    doc(db, "players", id),
    (snap) => { pub = snap.exists() ? snap.data() : null; emit(); },
    () => { /* keep the last known profile */ }
  );
  const stopPrivate = onSnapshot(
    doc(db, "playerPrivate", id),
    (snap) => { priv = snap.exists() ? snap.data() : null; emit(); },
    () => { /* not readable yet: keep the public fallback */ }
  );
  return () => { stopPublic(); stopPrivate(); };
}

export async function createPlayer(
  firebaseUid: string,
  data: CreatePlayerPayload
): Promise<PlayerProfile> {
  const privateInput: PrivateProfileInput = {};
  if (data.dateOfBirth) privateInput.dateOfBirth = Date.parse(data.dateOfBirth);
  if (data.homePostalCode?.trim()) privateInput.homePostalCode = data.homePostalCode.trim();

  // A profile already exists for this UID (for example a retry after the
  // private details failed to save): save the private details again.
  // Firebase Auth already allows only one account per email, so there is no
  // separate email check (that query exposed who has an account).
  const existingByUid = query(
    playersRef,
    where("firebaseUid", "==", firebaseUid),
    limit(1)
  );
  const uidSnap = await getDocs(existingByUid);
  if (!uidSnap.empty) {
    const existing = uidSnap.docs[0];
    if (Object.keys(privateInput).length > 0) await savePrivate(privateInput);
    return mergeProfile(existing.id, existing.data(), await getMyPrivate(existing.id));
  }

  const id = crypto.randomUUID();
  const playerDoc: Record<string, unknown> = {
    name: data.name.trim(),
    // Placeholders only: older iOS versions drop a player whose doc lacks
    // these keys. The real email is kept privately (from Auth, by the server).
    email: "",
    phone: "",
    genderRaw: data.gender,
    elo: 1200,
    streak: 0,
    firebaseUid,
    avatarId: data.avatarId ?? "shuttlecock",
    homeCountryCode: data.homeCountryCode ?? null,
    createdAt: Timestamp.now(),
  };

  if (data.playingHand) playerDoc.playingHand = data.playingHand;
  if (data.skillLevel) playerDoc.skillLevel = data.skillLevel;

  if (data.preferredSport) {
    playerDoc.preferredSport = data.preferredSport;
  }

  await setDoc(doc(db, "players", id), playerDoc);

  // DOB and postal code go only to the owner-only private doc.
  if (Object.keys(privateInput).length > 0) await savePrivate(privateInput);

  return mergeProfile(id, playerDoc, await getMyPrivate(id));
}

async function savePrivate(input: PrivateProfileInput): Promise<void> {
  try {
    await updatePrivateProfile(input);
  } catch (err) {
    console.error("updatePrivateProfile failed", err);
    throw new Error(
      "Your profile was created, but we couldn't save your date of birth and zip code. Please try again."
    );
  }
}

/**
 * Profile basics only. Photo fields (`photoURL`, `photoPath`,
 * `photoUpdatedAt`) are server-written via `setProfilePhoto` /
 * `removeProfilePhoto` and must never be added here. `homePostalCode` and
 * `weightKg` are private and go through the `updatePrivateProfile` callable.
 */
export interface UpdatePlayerPayload {
  name?: string;
  avatarId?: string;
  homeCountryCode?: string;
  homePostalCode?: string;
  weightKg?: number;
}

export async function updatePlayer(
  playerId: string,
  firebaseUid: string,
  data: UpdatePlayerPayload
): Promise<void> {
  const docRef = doc(db, "players", playerId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    throw new Error("Player not found.");
  }

  const existing = snapshot.data();
  if (existing.firebaseUid !== firebaseUid) {
    throw new Error("You can only update your own profile.");
  }

  const privateInput: PrivateProfileInput = {};
  if (data.homePostalCode !== undefined) privateInput.homePostalCode = data.homePostalCode.trim();
  if (data.weightKg !== undefined) privateInput.weightKg = data.weightKg;

  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name.trim();
  if (data.avatarId !== undefined) updates.avatarId = data.avatarId;
  if (data.homeCountryCode !== undefined) updates.homeCountryCode = data.homeCountryCode;

  if (Object.keys(privateInput).length > 0) {
    await updatePrivateProfile(privateInput);
    // Remove an older public copy of what was just saved privately, so it
    // stops being public and can't be copied back over the new value.
    for (const key of Object.keys(privateInput)) {
      if (key in existing) updates[key] = deleteField();
    }
  }

  if (Object.keys(updates).length > 0) await updateDoc(docRef, updates);
}

export async function getMatchStats(playerId: string): Promise<MatchStats> {
  try {
    const regsQuery = query(
      collection(db, "registrations"),
      where("playerId", "==", playerId)
    );
    const regsSnap = await getDocs(regsQuery);
    const regIds = regsSnap.docs.map((d) => d.id);

    if (regIds.length === 0) {
      return { matchesPlayed: 0, wins: 0, winRate: 0 };
    }

    const matchesQuery = query(
      collection(db, "matches"),
      where("statusRaw", "==", "finished")
    );
    const matchesSnap = await getDocs(matchesQuery);

    let played = 0;
    let wins = 0;
    for (const m of matchesSnap.docs) {
      const data = m.data();
      const isTeamA = regIds.includes(data.teamAId);
      const isTeamB = regIds.includes(data.teamBId);
      if (isTeamA || isTeamB) {
        played++;
        if (data.winnerRegistrationId && regIds.includes(data.winnerRegistrationId)) {
          wins++;
        }
      }
    }

    return {
      matchesPlayed: played,
      wins,
      winRate: played > 0 ? Math.round((wins / played) * 100) : 0,
    };
  } catch {
    return { matchesPlayed: 0, wins: 0, winRate: 0 };
  }
}

export async function getSportsmanship(playerId: string): Promise<SportsmanshipData> {
  try {
    const q = query(
      collection(db, "ratings"),
      where("playerId", "==", playerId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return { average: 0, count: 0 };

    let total = 0;
    snap.docs.forEach((d) => { total += d.data().stars ?? 0; });
    return {
      average: Math.round((total / snap.size) * 10) / 10,
      count: snap.size,
    };
  } catch {
    return { average: 0, count: 0 };
  }
}

export async function getFitnessData(playerId: string): Promise<FitnessData> {
  try {
    const q = query(
      collection(db, "calorieRecords"),
      where("playerId", "==", playerId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return { totalCalories: 0, sessions: 0, avgPerSession: 0 };

    let total = 0;
    snap.docs.forEach((d) => { total += d.data().calories ?? 0; });
    return {
      totalCalories: Math.round(total),
      sessions: snap.size,
      avgPerSession: Math.round(total / snap.size),
    };
  } catch {
    return { totalCalories: 0, sessions: 0, avgPerSession: 0 };
  }
}
