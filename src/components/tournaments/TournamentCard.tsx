import { Link } from "react-router-dom";
import type { Tournament } from "../../types";
import {
  tournamentFormat, matchFormat as getMatchFormat, formattedFee,
  FORMAT_SHORT, MATCH_FORMAT_LABELS, isRegistrationClosed, isTournamentPast,
} from "../../types";

function statusLabel(t: Tournament): { text: string; color: string } {
  if (t.statusRaw === "cancelled") return { text: "Cancelled", color: "var(--danger)" };
  if (isTournamentPast(t)) return { text: "Completed", color: "var(--gray-500)" };
  if (isRegistrationClosed(t)) return { text: "Live", color: "var(--success)" };
  return { text: "Upcoming", color: "var(--brand-purple)" };
}

export default function TournamentCard({ tournament }: { tournament: Tournament }) {
  const t = tournament;
  const fmt = tournamentFormat(t);
  const mfmt = getMatchFormat(t);
  const fee = formattedFee(t);
  const status = statusLabel(t);
  const dateStr = t.date?.toDate
    ? t.date.toDate().toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", year: "numeric",
      })
    : "";
  const timeStr = t.date?.toDate
    ? t.date.toDate().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : "";
  const deadlineStr = t.registrationDeadline?.toDate
    ? t.registrationDeadline.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

  return (
    <Link to={`/tournaments/${t.id}`} className="tourn-card">
      <div className="tourn-card-header">
        <div className="tourn-card-badges">
          <span className="tourn-badge format">{FORMAT_SHORT[fmt]}</span>
          <span className="tourn-badge match-fmt">{MATCH_FORMAT_LABELS[mfmt]}</span>
        </div>
        <span className="tourn-status" style={{ color: status.color }}>{status.text}</span>
      </div>
      <h3 className="tourn-card-title">{t.title}</h3>
      <div className="tourn-card-meta">
        <span>{dateStr} at {timeStr}</span>
        <span>{t.location}</span>
      </div>
      {t.locationAddress && (
        <div className="tourn-card-address">{t.locationAddress}</div>
      )}
      <div className="tourn-card-footer">
        <span className="tourn-fee">{fee}</span>
        <span className="tourn-participants">{t.participantsCount} registered</span>
        {deadlineStr && !isTournamentPast(t) && (
          <span className="tourn-deadline">Register by {deadlineStr}</span>
        )}
      </div>
      {t.prizeInfo && <div className="tourn-prize">{t.prizeInfo}</div>}
    </Link>
  );
}
