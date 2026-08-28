import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../hooks/useAuth";
import { getTournament } from "../services/tournaments";
import { listRegistrations, unregisterPlayer } from "../services/registrations";
import { listMatches } from "../services/matches";
import InfoTab from "../components/tournaments/InfoTab";
import TeamsTab from "../components/tournaments/TeamsTab";
import MatchesTab from "../components/tournaments/MatchesTab";
import ManageTab from "../components/tournaments/ManageTab";
import RegisterModal from "../components/tournaments/RegisterModal";
import ScoreEntryModal from "../components/tournaments/ScoreEntryModal";
import type { Tournament, Registration, Match as MatchType } from "../types";
import { isRegistrationClosed, isTournamentPast, formattedFee, FORMAT_SHORT, tournamentFormat } from "../types";

type Tab = "info" | "teams" | "matches" | "manage";

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, player } = useAuth();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [matches, setMatches] = useState<MatchType[]>([]);
  const [myReg, setMyReg] = useState<Registration | null>(null);
  const [organizerName, setOrganizerName] = useState("");
  const [tab, setTab] = useState<Tab>("info");
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [scoreMatch, setScoreMatch] = useState<MatchType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isCreator = tournament?.createdBy === user?.uid;

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [t, regs, m] = await Promise.all([
        getTournament(id),
        listRegistrations(id),
        listMatches(id),
      ]);
      setTournament(t);
      setRegistrations(regs);
      setMatches(m);

      if (player && t) {
        const myR = regs.find((r) => r.playerId === player.id) ?? null;
        setMyReg(myR);
      }

      if (t?.createdBy) {
        try {
          const q = query(collection(db, "players"), where("firebaseUid", "==", t.createdBy), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty) setOrganizerName(snap.docs[0].data().name);
        } catch { /* ignore */ }
      }
    } catch {
      setTournament(null);
    } finally {
      setLoading(false);
    }
  }, [id, player]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleWithdraw() {
    if (!myReg || !tournament) return;
    if (!confirm("Withdraw from this tournament?")) return;
    setActionLoading(true);
    try {
      await unregisterPlayer(myReg.id, tournament.id, !!myReg.partnerId);
      setMyReg(null);
      await loadData();
    } catch { /* ignore */ }
    setActionLoading(false);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="tourn-page">
        <div className="tourn-page-inner" style={{ textAlign: "center", paddingTop: 120 }}>
          <h2>Tournament not found</h2>
          <button className="btn-text" onClick={() => navigate("/tournaments")}>Back to tournaments</button>
        </div>
      </div>
    );
  }

  const closed = isRegistrationClosed(tournament);
  const past = isTournamentPast(tournament);
  const cancelled = tournament.statusRaw === "cancelled";
  const canRegister = user && player && !myReg && !closed && !past && !cancelled;
  const canWithdraw = myReg && !past && matches.length === 0;

  return (
    <div className="tourn-page">
      <div className="tourn-page-inner">
        {/* Header */}
        <div className="tourn-detail-header">
          <button className="btn-text" onClick={() => navigate("/tournaments")}>&larr; Back</button>
          <div>
            <span className="tourn-badge format" style={{ marginRight: 8 }}>
              {FORMAT_SHORT[tournamentFormat(tournament)]}
            </span>
            {cancelled && <span className="tourn-badge" style={{ background: "var(--danger)", color: "white" }}>Cancelled</span>}
          </div>
        </div>
        <h1 className="tourn-detail-title">{tournament.title}</h1>

        {/* Tabs */}
        <div className="auth-tabs" style={{ marginBottom: 24 }}>
          <button className={`auth-tab${tab === "info" ? " active" : ""}`} onClick={() => setTab("info")}>Info</button>
          <button className={`auth-tab${tab === "teams" ? " active" : ""}`} onClick={() => setTab("teams")}>Teams</button>
          <button className={`auth-tab${tab === "matches" ? " active" : ""}`} onClick={() => setTab("matches")}>Matches</button>
          {isCreator && (
            <button className={`auth-tab${tab === "manage" ? " active" : ""}`} onClick={() => setTab("manage")}>Manage</button>
          )}
        </div>

        {/* Tab Content */}
        {tab === "info" && <InfoTab tournament={tournament} organizerName={organizerName} />}
        {tab === "teams" && <TeamsTab tournament={tournament} registrations={registrations} />}
        {tab === "matches" && (
          <MatchesTab
            tournament={tournament}
            matches={matches}
            registrations={registrations}
            onScore={user ? (m) => setScoreMatch(m) : undefined}
          />
        )}
        {tab === "manage" && isCreator && (
          <ManageTab
            tournament={tournament}
            registrations={registrations}
            matches={matches}
            onRefresh={loadData}
          />
        )}

        {/* Sticky Footer */}
        {!cancelled && (
          <div className="tourn-footer">
            <span className="tourn-footer-fee">{formattedFee(tournament)}</span>
            {canRegister && (
              <button className="btn-primary" style={{ width: "auto", padding: "12px 32px" }} onClick={() => setShowRegister(true)}>
                Register
              </button>
            )}
            {myReg && !canWithdraw && (
              <span style={{ fontWeight: 600, color: "var(--success)" }}>Registered</span>
            )}
            {canWithdraw && (
              <button className="btn-outline danger-btn" onClick={handleWithdraw} disabled={actionLoading} style={{ width: "auto" }}>
                {actionLoading ? "Withdrawing..." : "Withdraw"}
              </button>
            )}
            {!user && (
              <button className="btn-primary" style={{ width: "auto", padding: "12px 32px" }} onClick={() => navigate("/login")}>
                Sign In to Register
              </button>
            )}
            {closed && !myReg && user && !past && (
              <span style={{ fontWeight: 500, color: "var(--danger)" }}>Registration Closed</span>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showRegister && (
        <RegisterModal
          tournament={tournament}
          registrations={registrations}
          onClose={() => setShowRegister(false)}
          onDone={() => { setShowRegister(false); loadData(); }}
        />
      )}
      {scoreMatch && user && (
        <ScoreEntryModal
          match={scoreMatch}
          registrations={registrations}
          uid={user.uid}
          isCreator={isCreator}
          onClose={() => setScoreMatch(null)}
          onDone={() => { setScoreMatch(null); loadData(); }}
        />
      )}
    </div>
  );
}
