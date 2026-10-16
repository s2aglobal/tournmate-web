import {
  collection, query, where, getDocs, doc, setDoc,
  updateDoc, deleteDoc, Timestamp, writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Match, SetScore } from "../types";

const col = collection(db, "matches");

export async function listMatches(tournamentId: string): Promise<Match[]> {
  const q = query(col, where("tournamentId", "==", tournamentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Match);
}

export async function createMatch(data: {
  tournamentId: string;
  teamAId: string;
  teamBId: string;
  round: number;
  bracketPosition?: number;
  group?: string;
}): Promise<string> {
  const id = crypto.randomUUID();
  await setDoc(doc(db, "matches", id), {
    ...data,
    statusRaw: "scheduled",
    createdAt: Timestamp.now(),
  });
  return id;
}

export async function createMatchesBatch(
  matches: Array<{
    tournamentId: string;
    teamAId: string;
    teamBId: string;
    round: number;
    bracketPosition?: number;
    group?: string;
  }>
): Promise<void> {
  const batch = writeBatch(db);
  for (const m of matches) {
    const id = crypto.randomUUID();
    batch.set(doc(db, "matches", id), {
      ...m,
      statusRaw: "scheduled",
      createdAt: Timestamp.now(),
    });
  }
  await batch.commit();
}

export async function submitScore(
  matchId: string,
  setScores: SetScore[],
  submittedBy: string
): Promise<void> {
  const totalA = setScores.reduce((s, ss) => s + ss.teamAPoints, 0);
  const totalB = setScores.reduce((s, ss) => s + ss.teamBPoints, 0);
  await updateDoc(doc(db, "matches", matchId), {
    setScores,
    scoreA: totalA,
    scoreB: totalB,
    statusRaw: "scoreSubmitted",
    submittedBy,
  });
}

export async function confirmScore(
  matchId: string,
  confirmedBy: string,
  winnerRegistrationId: string
): Promise<void> {
  await updateDoc(doc(db, "matches", matchId), {
    statusRaw: "finished",
    confirmedBy,
    winnerRegistrationId,
  });
}

export async function disputeScore(matchId: string): Promise<void> {
  await updateDoc(doc(db, "matches", matchId), { statusRaw: "disputed" });
}

export async function resolveDispute(
  matchId: string,
  setScores: SetScore[],
  winnerRegistrationId: string,
  resolvedBy: string
): Promise<void> {
  const totalA = setScores.reduce((s, ss) => s + ss.teamAPoints, 0);
  const totalB = setScores.reduce((s, ss) => s + ss.teamBPoints, 0);
  await updateDoc(doc(db, "matches", matchId), {
    setScores,
    scoreA: totalA,
    scoreB: totalB,
    statusRaw: "finished",
    winnerRegistrationId,
    confirmedBy: resolvedBy,
  });
}

export async function deleteMatchesForTournament(tournamentId: string): Promise<void> {
  const q = query(col, where("tournamentId", "==", tournamentId));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
