import { useState } from "react";
import type { Match, Registration, SetScore } from "../../types";
import { submitScore, confirmScore, disputeScore, resolveDispute } from "../../services/matches";

function teamName(regId: string, regs: Registration[]): string {
  const r = regs.find((reg) => reg.id === regId);
  if (!r?.player) return "TBD";
  return r.partner ? `${r.player.name} & ${r.partner.name}` : r.player.name;
}

export default function ScoreEntryModal({ match, registrations, uid, isCreator, onClose, onDone }: {
  match: Match;
  registrations: Registration[];
  uid: string;
  isCreator: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [sets, setSets] = useState<SetScore[]>(
    match.setScores && match.setScores.length > 0
      ? match.setScores
      : [{ teamAPoints: 0, teamBPoints: 0 }]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nameA = teamName(match.teamAId, registrations);
  const nameB = teamName(match.teamBId, registrations);
  const canSubmit = match.statusRaw === "scheduled" || match.statusRaw === "disputed";
  const canConfirm = match.statusRaw === "scoreSubmitted" && match.submittedBy !== uid;
  const canDispute = match.statusRaw === "scoreSubmitted" && match.submittedBy !== uid;

  function updateSet(index: number, field: "teamAPoints" | "teamBPoints", value: number) {
    const updated = [...sets];
    updated[index] = { ...updated[index], [field]: Math.max(0, value) };
    setSets(updated);
  }

  function addSet() {
    setSets([...sets, { teamAPoints: 0, teamBPoints: 0 }]);
  }

  function removeSet(index: number) {
    if (sets.length <= 1) return;
    setSets(sets.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      if (isCreator && match.statusRaw === "disputed") {
        const totalA = sets.reduce((s, ss) => s + ss.teamAPoints, 0);
        const totalB = sets.reduce((s, ss) => s + ss.teamBPoints, 0);
        const winner = totalA > totalB ? match.teamAId : match.teamBId;
        await resolveDispute(match.id, sets, winner, uid);
      } else {
        await submitScore(match.id, sets, uid);
        if (isCreator) {
          const totalA = sets.reduce((s, ss) => s + ss.teamAPoints, 0);
          const totalB = sets.reduce((s, ss) => s + ss.teamBPoints, 0);
          const winner = totalA > totalB ? match.teamAId : match.teamBId;
          await confirmScore(match.id, uid, winner);
        }
      }
      onDone();
    } catch {
      setError("Failed to submit score. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      const totalA = (match.setScores ?? []).reduce((s, ss) => s + ss.teamAPoints, 0);
      const totalB = (match.setScores ?? []).reduce((s, ss) => s + ss.teamBPoints, 0);
      const winner = totalA > totalB ? match.teamAId : match.teamBId;
      await confirmScore(match.id, uid, winner);
      onDone();
    } catch {
      setError("Failed to confirm score.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDispute() {
    setLoading(true);
    try {
      await disputeScore(match.id);
      onDone();
    } catch {
      setError("Failed to dispute score.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Match Score</h2>
        <p style={{ color: "var(--gray-500)", marginBottom: 24 }}>
          {nameA} vs {nameB}
        </p>

        {error && <div className="alert error">{error}</div>}

        {match.statusRaw === "scoreSubmitted" && !isCreator && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Submitted Score:</p>
            {(match.setScores ?? []).map((s, i) => (
              <p key={i} style={{ color: "var(--gray-600)" }}>
                Set {i + 1}: {s.teamAPoints} - {s.teamBPoints}
              </p>
            ))}
          </div>
        )}

        {canSubmit && (
          <>
            <div className="score-sets">
              {sets.map((s, i) => (
                <div key={i} className="score-set-row">
                  <span className="score-set-label">Set {i + 1}</span>
                  <div className="score-inputs">
                    <input
                      type="number" min={0} value={s.teamAPoints}
                      onChange={(e) => updateSet(i, "teamAPoints", parseInt(e.target.value) || 0)}
                      className="form-input score-input"
                    />
                    <span className="score-dash">-</span>
                    <input
                      type="number" min={0} value={s.teamBPoints}
                      onChange={(e) => updateSet(i, "teamBPoints", parseInt(e.target.value) || 0)}
                      className="form-input score-input"
                    />
                  </div>
                  {sets.length > 1 && (
                    <button className="btn-text" onClick={() => removeSet(i)} style={{ color: "var(--danger)" }}>Remove</button>
                  )}
                </div>
              ))}
            </div>
            <button className="btn-text" onClick={addSet} style={{ marginBottom: 24 }}>+ Add Set</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Score"}
            </button>
          </>
        )}

        {canConfirm && (
          <div className="wizard-buttons">
            <button className="btn-outline danger-btn" onClick={handleDispute} disabled={loading}>
              Dispute
            </button>
            <button className="btn-primary" onClick={handleConfirm} disabled={loading}>
              {loading ? "Confirming..." : "Confirm Score"}
            </button>
          </div>
        )}

        {match.statusRaw === "finished" && (
          <p style={{ textAlign: "center", color: "var(--success)", fontWeight: 600 }}>Match finalized</p>
        )}

        <button className="btn-text" onClick={onClose} style={{ marginTop: 16, display: "block", width: "100%", textAlign: "center" }}>
          Close
        </button>
      </div>
    </div>
  );
}
