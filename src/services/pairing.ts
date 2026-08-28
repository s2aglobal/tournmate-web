import type { Registration, Match } from "../types";

function avgElo(reg: Registration): number {
  const elo1 = reg.player?.elo ?? 1200;
  if (reg.partner) return (elo1 + (reg.partner.elo ?? 1200)) / 2;
  return elo1;
}

function nextPowerOf2(n: number): number {
  let v = 1;
  while (v < n) v *= 2;
  return v;
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateMixedDoublesPairs(
  registrations: Registration[]
): Array<{ male: Registration; female: Registration }> {
  const solo = registrations.filter((r) => !r.partnerId);
  let males = shuffle(solo.filter((r) => r.player?.genderRaw === "male"));
  let females = shuffle(solo.filter((r) => r.player?.genderRaw === "female"));
  const count = Math.min(males.length, females.length);
  const pairs: Array<{ male: Registration; female: Registration }> = [];
  for (let i = 0; i < count; i++) {
    pairs.push({ male: males[i], female: females[i] });
  }
  return pairs;
}

export function generateRandomDoublesPairs(
  registrations: Registration[]
): Array<{ playerA: Registration; playerB: Registration }> {
  const solo = shuffle(registrations.filter((r) => !r.partnerId));
  const pairs: Array<{ playerA: Registration; playerB: Registration }> = [];
  let i = 0;
  while (i + 1 < solo.length) {
    pairs.push({ playerA: solo[i], playerB: solo[i + 1] });
    i += 2;
  }
  return pairs;
}

export function generateRoundRobinSchedule(
  teams: Registration[]
): Array<{ teamA: Registration; teamB: Registration; round: number }> {
  if (teams.length < 2) return [];
  const n = teams.length;
  const allPairings: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      allPairings.push([i, j]);
    }
  }

  const matchesPerRound = Math.max(1, Math.floor(n / 2));
  let round = 1;
  let remaining = [...allPairings];
  const schedule: Array<{ teamA: Registration; teamB: Registration; round: number }> = [];

  while (remaining.length > 0) {
    const used = new Set<number>();
    const nextRemaining: Array<[number, number]> = [];

    for (const pair of remaining) {
      if (!used.has(pair[0]) && !used.has(pair[1]) && used.size / 2 < matchesPerRound) {
        schedule.push({ teamA: teams[pair[0]], teamB: teams[pair[1]], round });
        used.add(pair[0]);
        used.add(pair[1]);
      } else {
        nextRemaining.push(pair);
      }
    }
    remaining = nextRemaining;
    round++;
  }
  return schedule;
}

export function generateBracketFirstRound(teams: Registration[]): {
  matches: Array<{ teamA: Registration; teamB: Registration; bracketPosition: number }>;
  byeTeams: Registration[];
  totalRounds: number;
} {
  if (teams.length < 2) return { matches: [], byeTeams: [], totalRounds: 0 };

  const seeded = [...teams].sort((a, b) => avgElo(b) - avgElo(a));
  const bracketSize = nextPowerOf2(seeded.length);
  const totalRounds = Math.round(Math.log2(bracketSize));
  const byeCount = bracketSize - seeded.length;

  const byeTeams = seeded.slice(0, byeCount);
  const playingTeams = seeded.slice(byeCount);

  const matches: Array<{ teamA: Registration; teamB: Registration; bracketPosition: number }> = [];
  const half = Math.floor(playingTeams.length / 2);

  for (let i = 0; i < half; i++) {
    matches.push({
      teamA: playingTeams[i],
      teamB: playingTeams[playingTeams.length - 1 - i],
      bracketPosition: i,
    });
  }

  return { matches, byeTeams, totalRounds };
}

export function generateGroupStageSchedule(
  teams: Registration[],
  groupCount: number
): Array<{ teamA: Registration; teamB: Registration; round: number; group: string }> {
  if (teams.length < 2 || groupCount < 1) return [];
  const clampedGroupCount = Math.min(groupCount, Math.floor(teams.length / 2));

  const seeded = [...teams].sort((a, b) => avgElo(b) - avgElo(a));
  const groups: Registration[][] = Array.from({ length: clampedGroupCount }, () => []);

  for (let index = 0; index < seeded.length; index++) {
    const row = Math.floor(index / clampedGroupCount);
    const col = index % clampedGroupCount;
    const groupIndex = row % 2 === 0 ? col : clampedGroupCount - 1 - col;
    groups[groupIndex].push(seeded[index]);
  }

  const schedule: Array<{ teamA: Registration; teamB: Registration; round: number; group: string }> = [];

  groups.forEach((group, gi) => {
    const label = String.fromCharCode(65 + gi);
    const rr = generateRoundRobinSchedule(group);
    rr.forEach((entry) => {
      schedule.push({ ...entry, group: label });
    });
  });

  return schedule;
}

export function generateSwissPairings(
  teams: Registration[],
  finishedMatches: Match[],
  _swissRound: number
): Array<{ teamA: Registration; teamB: Registration }> {
  if (teams.length < 2) return [];

  const wins: Record<string, number> = {};
  teams.forEach((t) => { wins[t.id] = 0; });
  finishedMatches
    .filter((m) => m.statusRaw === "finished")
    .forEach((m) => {
      if (m.winnerRegistrationId) {
        wins[m.winnerRegistrationId] = (wins[m.winnerRegistrationId] ?? 0) + 1;
      }
    });

  const playedPairs = new Set<string>();
  finishedMatches.forEach((m) => {
    playedPairs.add(pairKey(m.teamAId, m.teamBId));
  });

  const sorted = [...teams].sort((a, b) => {
    const wA = wins[a.id] ?? 0;
    const wB = wins[b.id] ?? 0;
    if (wA !== wB) return wB - wA;
    return avgElo(b) - avgElo(a);
  });

  const used = new Set<string>();
  const pairs: Array<{ teamA: Registration; teamB: Registration }> = [];

  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i];
    if (used.has(a.id)) continue;
    for (let j = i + 1; j < sorted.length; j++) {
      const b = sorted[j];
      if (used.has(b.id)) continue;
      if (playedPairs.has(pairKey(a.id, b.id))) continue;
      pairs.push({ teamA: a, teamB: b });
      used.add(a.id);
      used.add(b.id);
      break;
    }
  }

  return pairs;
}
