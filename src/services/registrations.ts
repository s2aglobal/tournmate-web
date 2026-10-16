import {
  collection, query, where, getDocs, doc, setDoc, deleteDoc,
  updateDoc, increment, Timestamp, getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Registration } from "../types";

const col = collection(db, "registrations");

export async function listRegistrations(tournamentId: string): Promise<Registration[]> {
  const q = query(col, where("tournamentId", "==", tournamentId));
  const snap = await getDocs(q);
  const regs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Registration);

  const playerIds = new Set<string>();
  regs.forEach((r) => {
    playerIds.add(r.playerId);
    if (r.partnerId) playerIds.add(r.partnerId);
  });

  const playerMap: Record<string, { name: string; elo: number; genderRaw: string; avatarId?: string }> = {};
  const ids = Array.from(playerIds);
  const batchSize = 10;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const promises = batch.map((pid) => getDoc(doc(db, "players", pid)));
    const docs = await Promise.all(promises);
    docs.forEach((d) => {
      if (d.exists()) {
        const data = d.data();
        playerMap[d.id] = {
          name: data.name, elo: data.elo,
          genderRaw: data.genderRaw, avatarId: data.avatarId,
        };
      }
    });
  }

  return regs.map((r) => ({
    ...r,
    player: playerMap[r.playerId],
    partner: r.partnerId ? playerMap[r.partnerId] : undefined,
  }));
}

export async function registerPlayer(
  tournamentId: string,
  playerId: string,
  partnerId?: string
): Promise<string> {
  const id = crypto.randomUUID();
  const regDoc = {
    tournamentId,
    playerId,
    partnerId: partnerId ?? null,
    createdAt: Timestamp.now(),
  };
  await setDoc(doc(db, "registrations", id), regDoc);
  const incBy = partnerId ? 2 : 1;
  await updateDoc(doc(db, "tournaments", tournamentId), {
    participantsCount: increment(incBy),
  });
  return id;
}

export async function unregisterPlayer(
  registrationId: string,
  tournamentId: string,
  hadPartner: boolean
): Promise<void> {
  await deleteDoc(doc(db, "registrations", registrationId));
  const decBy = hadPartner ? -2 : -1;
  await updateDoc(doc(db, "tournaments", tournamentId), {
    participantsCount: increment(decBy),
  });
}

export async function setPartner(registrationId: string, partnerId: string): Promise<void> {
  await updateDoc(doc(db, "registrations", registrationId), { partnerId });
}

export async function clearPartner(registrationId: string): Promise<void> {
  await updateDoc(doc(db, "registrations", registrationId), { partnerId: null });
}

export async function getMyRegistration(
  tournamentId: string,
  playerId: string
): Promise<Registration | null> {
  const q = query(
    col,
    where("tournamentId", "==", tournamentId),
    where("playerId", "==", playerId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Registration;
}

export async function getMyTournamentIds(playerId: string): Promise<string[]> {
  const q = query(col, where("playerId", "==", playerId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().tournamentId);
}
