import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { listUpcomingTournaments, listPastTournaments } from "../services/tournaments";
import { getMyTournamentIds } from "../services/registrations";
import TournamentCard from "../components/tournaments/TournamentCard";
import type { Tournament } from "../types";

type Filter = "all" | "mine" | "completed";

export default function TournamentsPage() {
  const { user, player } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");
  const [upcoming, setUpcoming] = useState<Tournament[]>([]);
  const [past, setPast] = useState<Tournament[]>([]);
  const [myIds, setMyIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [up, pa] = await Promise.all([
        listUpcomingTournaments(),
        listPastTournaments(),
      ]);
      setUpcoming(up);
      setPast(pa);
      if (player) {
        const ids = await getMyTournamentIds(player.id);
        const createdIds = [...up, ...pa]
          .filter((t) => t.createdBy === user?.uid)
          .map((t) => t.id);
        setMyIds(new Set([...ids, ...createdIds]));
      }
      setLoading(false);
    }
    load();
  }, [player, user]);

  let tournaments: Tournament[] = [];
  if (filter === "all") tournaments = upcoming;
  else if (filter === "completed") tournaments = past;
  else tournaments = [...upcoming, ...past].filter((t) => myIds.has(t.id));

  return (
    <div className="tourn-page">
      <div className="tourn-page-inner">
        <div className="tourn-page-header">
          <h1>Tournaments</h1>
          {user && player && (
            <Link to="/tournaments/create" className="btn-primary" style={{ width: "auto", padding: "12px 28px" }}>
              Create Tournament
            </Link>
          )}
        </div>

        <div className="auth-tabs" style={{ marginBottom: 24 }}>
          <button className={`auth-tab${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>
            All
          </button>
          {user && (
            <button className={`auth-tab${filter === "mine" ? " active" : ""}`} onClick={() => setFilter("mine")}>
              My Tournaments
            </button>
          )}
          <button className={`auth-tab${filter === "completed" ? " active" : ""}`} onClick={() => setFilter("completed")}>
            Completed
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div className="spinner" style={{ margin: "0 auto" }} />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="tourn-empty">
            <p>
              {filter === "all"
                ? "No upcoming tournaments yet."
                : filter === "mine"
                  ? "You haven't joined or created any tournaments."
                  : "No completed tournaments yet."}
            </p>
          </div>
        ) : (
          <div className="tourn-grid">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
