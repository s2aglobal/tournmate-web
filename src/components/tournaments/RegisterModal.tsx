import { useState } from "react";
import type { Registration, Tournament } from "../../types";
import {
  tournamentFormat, isSinglesFormat, ageGroup,
  isAgeEligible, AGE_GROUP_LABELS,
} from "../../types";
import { registerPlayer } from "../../services/registrations";
import { useAuth } from "../../hooks/useAuth";
import { Timestamp } from "firebase/firestore";

function avatarUrl(seed: string, style: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

export default function RegisterModal({ tournament, registrations, onClose, onDone }: {
  tournament: Tournament;
  registrations: Registration[];
  onClose: () => void;
  onDone: () => void;
}) {
  const { player } = useAuth();
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!player) return null;

  const fmt = tournamentFormat(tournament);
  const singles = isSinglesFormat(fmt);
  const ag = ageGroup(tournament);

  const soloRegs = singles ? [] : registrations.filter(
    (r) => !r.partnerId && r.playerId !== player.id
  );

  function ageCheck(): string | null {
    if (ag === "open") return null;
    const dob = player!.dateOfBirth;
    if (!dob || !(dob instanceof Timestamp)) return "Date of birth required for age-restricted tournaments.";
    const birth = dob.toDate();
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (!isAgeEligible(age, ag)) {
      return `You are not eligible for the ${AGE_GROUP_LABELS[ag]} age group.`;
    }
    return null;
  }

  async function handleRegister() {
    setError("");
    const ageErr = ageCheck();
    if (ageErr) { setError(ageErr); return; }

    setLoading(true);
    try {
      await registerPlayer(
        tournament.id,
        player!.id,
        selectedPartner ?? undefined
      );
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Register for Tournament</h2>
        <p style={{ color: "var(--gray-500)", marginBottom: 24 }}>{tournament.title}</p>

        {error && <div className="alert error">{error}</div>}

        {!singles && !tournament.randomPairing && soloRegs.length > 0 && (
          <>
            <h3 className="tab-section-title">Select a Partner (optional)</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--gray-400)", marginBottom: 12 }}>
              Choose from players awaiting a partner, or register solo.
            </p>
            <div className="partner-list">
              {soloRegs.map((r) => (
                <button
                  key={r.id}
                  className={`partner-option${selectedPartner === r.playerId ? " selected" : ""}`}
                  onClick={() => setSelectedPartner(
                    selectedPartner === r.playerId ? null : r.playerId
                  )}
                >
                  {r.player && (
                    <img src={avatarUrl(r.player.name, r.player.avatarId ?? "adventurer")} alt="" className="team-avatar" />
                  )}
                  <span>{r.player?.name ?? "Unknown"}</span>
                  <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--gray-400)" }}>
                    {r.player?.elo ?? 1200} Elo
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {!singles && tournament.randomPairing && (
          <p style={{ fontSize: "0.9rem", color: "var(--gray-500)", marginBottom: 16 }}>
            This tournament uses random pairing. You&apos;ll be assigned a partner automatically.
          </p>
        )}

        <button className="btn-primary" onClick={handleRegister} disabled={loading} style={{ marginTop: 16 }}>
          {loading ? "Registering..." : selectedPartner ? "Register with Partner" : singles ? "Register" : "Register Solo"}
        </button>
        <button className="btn-text" onClick={onClose} style={{ marginTop: 12, display: "block", width: "100%", textAlign: "center" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
