import {
  collection,
  query,
  where,
  limit,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
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
  dateOfBirth?: Timestamp;
  weightKg?: number;
}

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

export interface UpdatePlayerPayload {
  name?: string;
  phone?: string;
  avatarId?: string;
  genderRaw?: string;
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

  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name.trim();
  if (data.phone !== undefined) updates.phone = data.phone.trim();
  if (data.avatarId !== undefined) updates.avatarId = data.avatarId;
  if (data.genderRaw !== undefined) updates.genderRaw = data.genderRaw;
  if (data.homeCountryCode !== undefined) updates.homeCountryCode = data.homeCountryCode;
  if (data.homePostalCode !== undefined) updates.homePostalCode = data.homePostalCode;
  if (data.weightKg !== undefined) updates.weightKg = data.weightKg;

  await updateDoc(docRef, updates);
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
