import { useState } from "react";
import type { Tournament, Registration, Match } from "../../types";
import { matchFormat as getMatchFormat, tournamentFormat, isSinglesFormat } from "../../types";
import {
  generateBracketFirstRound, generateRoundRobinSchedule,
  generateGroupStageSchedule, generateSwissPairings,
  generateRandomDoublesPairs, generateMixedDoublesPairs,
} from "../../services/pairing";
import { createMatchesBatch, deleteMatchesForTournament } from "../../services/matches";
import { setPartner } from "../../services/registrations";
import { cancelTournament } from "../../services/tournaments";

export default function ManageTab({ tournament, registrations, matches, onRefresh }: {
  tournament: Tournament;
  registrations: Registration[];
  matches: Match[];
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const mfmt = getMatchFormat(tournament);
  const fmt = tournamentFormat(tournament);
  const singles = isSinglesFormat(fmt);
  const hasMatches = matches.length > 0;

  const formedTeams = registrations.filter((r) => singles || r.partnerId);
  const soloRegs = singles ? [] : registrations.filter((r) => !r.partnerId);
  const needsRandomPairing = tournament.randomPairing && !singles && soloRegs.length >= 2;

  async function handleRandomPair() {
    setLoading(true);
    setMessage("");
    try {
      const pairs = fmt === "mixedDoubles"
        ? generateMixedDoublesPairs(registrations).map((p) => ({ playerA: p.male, playerB: p.female }))
        : generateRandomDoublesPairs(registrations);

      for (const pair of pairs) {
        await setPartner(pair.playerA.id, pair.playerB.playerId);
      }
      setMessage(`Paired ${pairs.length} teams.`);
      onRefresh();
    } catch {
      setMessage("Failed to pair teams.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateBracket() {
    setLoading(true);
    setMessage("");
    try {
      const teams = formedTeams;
      if (teams.length < 2) {
        setMessage("Need at least 2 teams to generate matches.");
        setLoading(false);
        return;
      }

      let matchData: Array<{
        tournamentId: string; teamAId: string; teamBId: string;
        round: number; bracketPosition?: number; group?: string;
      }> = [];

      if (mfmt === "singleElimination" || mfmt === "doubleElimination") {
        const { matches: bracketMatches } = generateBracketFirstRound(teams);
        matchData = bracketMatches.map((m) => ({
          tournamentId: tournament.id,
          teamAId: m.teamA.id,
          teamBId: m.teamB.id,
          round: 1,
          bracketPosition: m.bracketPosition,
        }));
      } else if (mfmt === "roundRobin") {
        const schedule = generateRoundRobinSchedule(teams);
        matchData = schedule.map((m) => ({
          tournamentId: tournament.id,
          teamAId: m.teamA.id,
          teamBId: m.teamB.id,
          round: m.round,
        }));
      } else if (mfmt === "groupKnockout") {
        const groupCount = Math.max(2, Math.floor(teams.length / 4));
        const schedule = generateGroupStageSchedule(teams, groupCount);
        matchData = schedule.map((m) => ({
          tournamentId: tournament.id,
          teamAId: m.teamA.id,
          teamBId: m.teamB.id,
          round: m.round,
          group: m.group,
        }));
      } else if (mfmt === "swiss") {
        const pairs = generateSwissPairings(teams, matches, 1);
        matchData = pairs.map((m) => ({
          tournamentId: tournament.id,
          teamAId: m.teamA.id,
          teamBId: m.teamB.id,
          round: 1,
        }));
      }

      if (matchData.length > 0) {
        await createMatchesBatch(matchData);
        setMessage(`Generated ${matchData.length} matches.`);
      } else {
        setMessage("No matches could be generated.");
      }
      onRefresh();
    } catch {
      setMessage("Failed to generate matches.");
    } finally {
      setLoading(false);
    }
  }

  async function handleNextSwissRound() {
    setLoading(true);
    setMessage("");
    try {
      const currentRounds = [...new Set(matches.map((m) => m.round ?? 1))];
      const nextRound = Math.max(...currentRounds) + 1;
      const pairs = generateSwissPairings(formedTeams, matches, nextRound);
      const matchData = pairs.map((m) => ({
        tournamentId: tournament.id,
        teamAId: m.teamA.id,
        teamBId: m.teamB.id,
        round: nextRound,
      }));
      if (matchData.length > 0) {
        await createMatchesBatch(matchData);
        setMessage(`Generated Swiss round ${nextRound} with ${matchData.length} matches.`);
      } else {
        setMessage("No more pairings available.");
      }
      onRefresh();
    } catch {
      setMessage("Failed to generate next round.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetMatches() {
    if (!confirm("Are you sure? This will delete all matches for this tournament.")) return;
    setLoading(true);
    try {
      await deleteMatchesForTournament(tournament.id);
      setMessage("All matches reset.");
      onRefresh();
    } catch {
      setMessage("Failed to reset matches.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel this tournament? This cannot be undone.")) return;
    setLoading(true);
    try {
      await cancelTournament(tournament.id);
      setMessage("Tournament cancelled.");
      onRefresh();
    } catch {
      setMessage("Failed to cancel tournament.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="manage-tab">
      {message && (
        <div className={`alert ${message.includes("Failed") ? "error" : "success"}`} style={{ marginBottom: 16 }}>
          {message}
        </div>
      )}

      <div className="manage-section">
        <h3 className="tab-section-title">Teams</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--gray-500)", marginBottom: 12 }}>
          {formedTeams.length} formed team{formedTeams.length !== 1 ? "s" : ""}
          {soloRegs.length > 0 && `, ${soloRegs.length} awaiting partner`}
        </p>
        {needsRandomPairing && !hasMatches && (
          <button className="btn-primary" onClick={handleRandomPair} disabled={loading} style={{ marginBottom: 12 }}>
            {loading ? "Pairing..." : "Random Pair Solo Players"}
          </button>
        )}
      </div>

      <div className="manage-section">
        <h3 className="tab-section-title">Generate Matches</h3>
        {!hasMatches ? (
          <button className="btn-primary" onClick={handleGenerateBracket} disabled={loading || formedTeams.length < 2}>
            {loading ? "Generating..." : `Generate ${mfmt === "swiss" ? "Swiss Round 1" : "Bracket"}`}
          </button>
        ) : (
          <p style={{ fontSize: "0.9rem", color: "var(--gray-500)" }}>
            {matches.length} matches generated.
          </p>
        )}
        {hasMatches && mfmt === "swiss" && (
          <button className="btn-outline" onClick={handleNextSwissRound} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Generating..." : "Generate Next Swiss Round"}
          </button>
        )}
      </div>

      {hasMatches && (
        <div className="manage-section">
          <h3 className="tab-section-title danger-text">Reset</h3>
          <button className="btn-outline danger-btn" onClick={handleResetMatches} disabled={loading}>
            Reset All Matches
          </button>
        </div>
      )}

      {tournament.statusRaw !== "cancelled" && (
        <div className="manage-section">
          <h3 className="tab-section-title danger-text">Danger Zone</h3>
          <button className="btn-outline danger-btn" onClick={handleCancel} disabled={loading}>
            Cancel Tournament
          </button>
        </div>
      )}
    </div>
  );
}
