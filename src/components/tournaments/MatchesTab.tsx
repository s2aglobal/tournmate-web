import { useState } from "react";
import type { Match, Registration, Tournament } from "../../types";
import { matchFormat as getMatchFormat } from "../../types";

function teamName(regId: string, regs: Registration[]): string {
  const r = regs.find((reg) => reg.id === regId);
  if (!r?.player) return "TBD";
  return r.partner ? `${r.player.name} & ${r.partner.name}` : r.player.name;
}

function scoreDisplay(m: Match): string {
  if (m.setScores && m.setScores.length > 0) {
    return m.setScores.map((s) => `${s.teamAPoints}-${s.teamBPoints}`).join(", ");
  }
  if (m.scoreA !== undefined && m.scoreB !== undefined) {
    return `${m.scoreA} - ${m.scoreB}`;
  }
  return "vs";
}

function statusBadge(status: string): { text: string; color: string } {
  switch (status) {
    case "finished": return { text: "Final", color: "var(--success)" };
    case "scoreSubmitted": return { text: "Score Submitted", color: "var(--brand-purple)" };
    case "disputed": return { text: "Disputed", color: "var(--danger)" };
    default: return { text: "Scheduled", color: "var(--gray-400)" };
  }
}

function MatchCard({ match, registrations, onScore }: {
  match: Match;
  registrations: Registration[];
  onScore?: (m: Match) => void;
}) {
  const nameA = teamName(match.teamAId, registrations);
  const nameB = teamName(match.teamBId, registrations);
  const score = scoreDisplay(match);
  const badge = statusBadge(match.statusRaw);
  const isWinnerA = match.winnerRegistrationId === match.teamAId;
  const isWinnerB = match.winnerRegistrationId === match.teamBId;

  return (
    <div className="match-card" onClick={() => onScore?.(match)} style={{ cursor: onScore ? "pointer" : "default" }}>
      <div className="match-teams">
        <span className={`match-team${isWinnerA ? " winner" : ""}`}>{nameA}</span>
        <span className="match-score">{score}</span>
        <span className={`match-team${isWinnerB ? " winner" : ""}`}>{nameB}</span>
      </div>
      <span className="match-status-badge" style={{ color: badge.color }}>{badge.text}</span>
      {match.group && <span className="match-group-badge">Group {match.group}</span>}
    </div>
  );
}

function StandingsTable({ matches, registrations }: {
  matches: Match[];
  registrations: Registration[];
}) {
  const stats: Record<string, { w: number; l: number; pts: number }> = {};
  const finished = matches.filter((m) => m.statusRaw === "finished");

  finished.forEach((m) => {
    if (!stats[m.teamAId]) stats[m.teamAId] = { w: 0, l: 0, pts: 0 };
    if (!stats[m.teamBId]) stats[m.teamBId] = { w: 0, l: 0, pts: 0 };
    if (m.winnerRegistrationId === m.teamAId) {
      stats[m.teamAId].w++;
      stats[m.teamBId].l++;
    } else if (m.winnerRegistrationId === m.teamBId) {
      stats[m.teamBId].w++;
      stats[m.teamAId].l++;
    }
  });

  const rows = Object.entries(stats)
    .map(([id, s]) => ({ id, ...s, pts: s.w * 2 }))
    .sort((a, b) => b.pts - a.pts || b.w - a.w);

  if (rows.length === 0) return <p className="tab-empty">No standings yet.</p>;

  return (
    <table className="standings-table">
      <thead>
        <tr><th>#</th><th>Team</th><th>W</th><th>L</th><th>Pts</th></tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.id}>
            <td>{i + 1}</td>
            <td>{teamName(r.id, registrations)}</td>
            <td>{r.w}</td>
            <td>{r.l}</td>
            <td><strong>{r.pts}</strong></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function MatchesTab({ tournament, matches, registrations, onScore }: {
  tournament: Tournament;
  matches: Match[];
  registrations: Registration[];
  onScore?: (m: Match) => void;
}) {
  const mfmt = getMatchFormat(tournament);
  const isElim = mfmt === "singleElimination" || mfmt === "doubleElimination";
  const isRR = mfmt === "roundRobin" || mfmt === "swiss";
  const isGroup = mfmt === "groupKnockout";
  const [view, setView] = useState<"matches" | "standings">("matches");

  if (matches.length === 0) {
    return <p className="tab-empty">No matches generated yet. The organizer will generate brackets once registration closes.</p>;
  }

  const rounds = [...new Set(matches.map((m) => m.round ?? 1))].sort((a, b) => a - b);
  const groups = [...new Set(matches.filter((m) => m.group).map((m) => m.group!))].sort();
  const [selectedRound, setSelectedRound] = useState(rounds[0]);

  const filtered = matches.filter((m) => (m.round ?? 1) === selectedRound);

  return (
    <div className="matches-tab">
      {(isRR || isGroup) && (
        <div className="auth-tabs" style={{ marginBottom: 16 }}>
          <button className={`auth-tab${view === "matches" ? " active" : ""}`} onClick={() => setView("matches")}>Matches</button>
          <button className={`auth-tab${view === "standings" ? " active" : ""}`} onClick={() => setView("standings")}>Standings</button>
        </div>
      )}

      {view === "standings" ? (
        isGroup ? (
          groups.map((g) => (
            <div key={g} style={{ marginBottom: 24 }}>
              <h4 className="tab-section-title">Group {g}</h4>
              <StandingsTable matches={matches.filter((m) => m.group === g)} registrations={registrations} />
            </div>
          ))
        ) : (
          <StandingsTable matches={matches} registrations={registrations} />
        )
      ) : (
        <>
          <div className="round-chips">
            {rounds.map((r) => (
              <button key={r} className={`round-chip${selectedRound === r ? " active" : ""}`} onClick={() => setSelectedRound(r)}>
                {isElim ? `Round ${r}` : mfmt === "swiss" ? `Swiss R${r}` : `Round ${r}`}
              </button>
            ))}
          </div>
          <div className="match-list">
            {isGroup && groups.length > 0
              ? groups.map((g) => {
                  const groupMatches = filtered.filter((m) => m.group === g);
                  if (groupMatches.length === 0) return null;
                  return (
                    <div key={g}>
                      <h4 className="tab-section-title">Group {g}</h4>
                      {groupMatches.map((m) => (
                        <MatchCard key={m.id} match={m} registrations={registrations} onScore={onScore} />
                      ))}
                    </div>
                  );
                })
              : filtered.map((m) => (
                  <MatchCard key={m.id} match={m} registrations={registrations} onScore={onScore} />
                ))}
          </div>
        </>
      )}
    </div>
  );
}
