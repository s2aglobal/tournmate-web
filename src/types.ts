import { Timestamp } from "firebase/firestore";

export type TournamentFormat =
  | "mensSingles"
  | "womensSingles"
  | "openSingles"
  | "mensDoubles"
  | "womensDoubles"
  | "mixedDoubles"
  | "openDoubles"
  | "fixedDoubles";

export type MatchFormat =
  | "singleElimination"
  | "doubleElimination"
  | "roundRobin"
  | "groupKnockout"
  | "swiss"
  | "manualDraw";

export type MatchStatus = "scheduled" | "scoreSubmitted" | "finished" | "disputed";

export type AgeGroup =
  | "open" | "u13" | "u15" | "u17" | "u19" | "u24"
  | "senior" | "veterans35" | "masters40" | "masters50" | "grandMasters55";

export const SINGLES_FORMATS: TournamentFormat[] = ["mensSingles", "womensSingles", "openSingles"];
export function isSinglesFormat(f: TournamentFormat): boolean { return SINGLES_FORMATS.includes(f); }

export const FORMAT_LABELS: Record<TournamentFormat, string> = {
  mensSingles: "Men's Singles", womensSingles: "Women's Singles", openSingles: "Open Singles",
  mensDoubles: "Men's Doubles", womensDoubles: "Women's Doubles", mixedDoubles: "Mixed Doubles",
  openDoubles: "Open Doubles", fixedDoubles: "Fixed Doubles",
};

export const FORMAT_SHORT: Record<TournamentFormat, string> = {
  mensSingles: "MS", womensSingles: "WS", openSingles: "OS",
  mensDoubles: "MD", womensDoubles: "WD", mixedDoubles: "XD",
  openDoubles: "OD", fixedDoubles: "FD",
};

export const MATCH_FORMAT_LABELS: Record<MatchFormat, string> = {
  singleElimination: "Single Elimination", doubleElimination: "Double Elimination",
  roundRobin: "Round Robin", groupKnockout: "Group + Knockout",
  swiss: "Swiss", manualDraw: "Manual Draw",
};

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  open: "Open", u13: "Under 13", u15: "Under 15", u17: "Under 17",
  u19: "Under 19", u24: "Under 24", senior: "Senior (19+)",
  veterans35: "Veterans (35+)", masters40: "Masters (40+)",
  masters50: "Masters (50+)", grandMasters55: "Grand Masters (55+)",
};

export const AGE_GROUP_RULES: Record<AgeGroup, { min?: number; max?: number }> = {
  open: {}, u13: { max: 13 }, u15: { max: 15 }, u17: { max: 17 },
  u19: { max: 19 }, u24: { max: 24 }, senior: { min: 19 },
  veterans35: { min: 35 }, masters40: { min: 40 }, masters50: { min: 50 },
  grandMasters55: { min: 55 },
};

export function isAgeEligible(age: number, ageGroup: AgeGroup): boolean {
  const r = AGE_GROUP_RULES[ageGroup];
  if (r.min !== undefined && age < r.min) return false;
  if (r.max !== undefined && age >= r.max) return false;
  return true;
}

export interface Tournament {
  id: string;
  title: string;
  date: Timestamp;
  location: string;
  locationAddress: string;
  locationLatitude?: number;
  locationLongitude?: number;
  participantsCount: number;
  statusRaw: string;
  formatRaw: string;
  matchFormatRaw: string;
  sportType?: string;
  randomPairing: boolean;
  registrationDeadline: Timestamp;
  createdBy?: string;
  entryFee?: number;
  currency: string;
  paymentInfo?: string;
  prizeInfo?: string;
  durationMinutes?: number;
  countryCode?: string;
  postalCode?: string;
  formatConfigData?: string;
  ageGroupRaw?: string;
  createdAt: Timestamp;
}

export interface Registration {
  id: string;
  tournamentId: string;
  playerId: string;
  partnerId?: string;
  createdAt: Timestamp;
  player?: { name: string; elo: number; genderRaw: string; avatarId?: string };
  partner?: { name: string; elo: number; genderRaw: string; avatarId?: string };
}

export interface SetScore {
  teamAPoints: number;
  teamBPoints: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  teamAId: string;
  teamBId: string;
  round?: number;
  bracketPosition?: number;
  scoreA?: number;
  scoreB?: number;
  statusRaw: string;
  winnerRegistrationId?: string;
  submittedBy?: string;
  confirmedBy?: string;
  setScores?: SetScore[];
  group?: string;
  createdAt: Timestamp;
}

export function tournamentFormat(t: Tournament): TournamentFormat {
  return (t.formatRaw || "openSingles") as TournamentFormat;
}

export function matchFormat(t: Tournament): MatchFormat {
  return (t.matchFormatRaw || "singleElimination") as MatchFormat;
}

export function ageGroup(t: Tournament): AgeGroup {
  return (t.ageGroupRaw || "open") as AgeGroup;
}

export function isRegistrationClosed(t: Tournament): boolean {
  if (!t.registrationDeadline) return false;
  return t.registrationDeadline.toDate() < new Date();
}

export function isTournamentPast(t: Tournament): boolean {
  return t.date.toDate() < new Date();
}

export function formattedFee(t: Tournament): string {
  if (!t.entryFee || t.entryFee === 0) return "Free";
  return `${t.currency || "$"}${t.entryFee}`;
}
