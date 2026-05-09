import {
  collection, query, where, orderBy, getDocs, getDoc, doc,
  setDoc, updateDoc, Timestamp, deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Tournament } from "../types";

const col = collection(db, "tournaments");

export async function listUpcomingTournaments(): Promise<Tournament[]> {
  const now = Timestamp.now();
  const q = query(col, where("date", ">=", now), orderBy("date", "asc"));
  const snap = await getDocs(q);
  return snap.docs
    .filter((d) => d.data().statusRaw !== "cancelled")
    .map((d) => ({ id: d.id, ...d.data() }) as Tournament);
}

export async function listPastTournaments(): Promise<Tournament[]> {
  const now = Timestamp.now();
  const q = query(col, where("date", "<", now), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Tournament);
}

export async function getTournament(id: string): Promise<Tournament | null> {
  const snap = await getDoc(doc(db, "tournaments", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Tournament;
}

export interface CreateTournamentData {
  title: string;
  date: Date;
  location: string;
  locationAddress: string;
  locationLatitude?: number;
  locationLongitude?: number;
  formatRaw: string;
  matchFormatRaw: string;
  randomPairing: boolean;
  registrationDeadline: Date;
  entryFee?: number;
  currency?: string;
  paymentInfo?: string;
  prizeInfo?: string;
  durationMinutes?: number;
  ageGroupRaw?: string;
  formatConfigData?: string;
}

export async function createTournament(
  createdBy: string,
  data: CreateTournamentData
): Promise<Tournament> {
  const id = crypto.randomUUID();
  const tournDoc = {
    title: data.title.trim(),
    date: Timestamp.fromDate(data.date),
    location: data.location.trim(),
    locationAddress: data.locationAddress.trim(),
    locationLatitude: data.locationLatitude ?? null,
    locationLongitude: data.locationLongitude ?? null,
    participantsCount: 0,
    statusRaw: "scheduled",
    formatRaw: data.formatRaw,
    matchFormatRaw: data.matchFormatRaw,
    randomPairing: data.randomPairing,
    registrationDeadline: Timestamp.fromDate(data.registrationDeadline),
    createdBy,
    entryFee: data.entryFee ?? 0,
    currency: data.currency ?? "USD",
    paymentInfo: data.paymentInfo ?? null,
    prizeInfo: data.prizeInfo ?? null,
    durationMinutes: data.durationMinutes ?? null,
    ageGroupRaw: data.ageGroupRaw ?? "open",
    formatConfigData: data.formatConfigData ?? null,
    createdAt: Timestamp.now(),
  };
  await setDoc(doc(db, "tournaments", id), tournDoc);
  return { id, ...tournDoc } as unknown as Tournament;
}

export async function cancelTournament(tournamentId: string): Promise<void> {
  await updateDoc(doc(db, "tournaments", tournamentId), { statusRaw: "cancelled" });
}

export async function deleteTournament(tournamentId: string): Promise<void> {
  await deleteDoc(doc(db, "tournaments", tournamentId));
}
