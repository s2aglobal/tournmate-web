import type { Tournament } from "../../types";
import {
  tournamentFormat, matchFormat as getMatchFormat, ageGroup,
  FORMAT_LABELS, MATCH_FORMAT_LABELS, AGE_GROUP_LABELS,
  formattedFee, isRegistrationClosed,
} from "../../types";

export default function InfoTab({ tournament, organizerName }: {
  tournament: Tournament;
  organizerName: string;
}) {
  const t = tournament;
  const dateObj = t.date?.toDate ? t.date.toDate() : new Date();
  const deadlineObj = t.registrationDeadline?.toDate ? t.registrationDeadline.toDate() : null;
  const fmt = tournamentFormat(t);
  const mfmt = getMatchFormat(t);
  const ag = ageGroup(t);

  const dateStr = dateObj.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const mapsUrl = t.locationLatitude && t.locationLongitude
    ? `https://www.google.com/maps?q=${t.locationLatitude},${t.locationLongitude}`
    : t.locationAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.locationAddress)}`
      : null;

  return (
    <div className="info-tab">
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Date</span>
          <span className="info-value">{dateStr}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Start Time</span>
          <span className="info-value">{timeStr}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Event Type</span>
          <span className="info-value">{FORMAT_LABELS[fmt]}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Format</span>
          <span className="info-value">{MATCH_FORMAT_LABELS[mfmt]}</span>
        </div>
        {ag !== "open" && (
          <div className="info-item">
            <span className="info-label">Age Group</span>
            <span className="info-value">{AGE_GROUP_LABELS[ag]}</span>
          </div>
        )}
        {t.durationMinutes && (
          <div className="info-item">
            <span className="info-label">Duration</span>
            <span className="info-value">{t.durationMinutes} min</span>
          </div>
        )}
      </div>

      {t.prizeInfo && (
        <div className="info-card prize">
          <span className="info-label">Prize</span>
          <p>{t.prizeInfo}</p>
        </div>
      )}

      <div className="info-card">
        <span className="info-label">Entry Fee</span>
        <p className="info-value-lg">{formattedFee(t)}</p>
        {t.paymentInfo && <p className="info-hint">{t.paymentInfo}</p>}
      </div>

      <div className="info-card">
        <span className="info-label">Venue</span>
        <p className="info-value-lg">{t.location}</p>
        {t.locationAddress && <p className="info-hint">{t.locationAddress}</p>}
        {mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-text" style={{ marginTop: 8 }}>
            Open in Google Maps
          </a>
        )}
      </div>

      <div className="info-card">
        <span className="info-label">Registration Deadline</span>
        <p className="info-value-lg">
          {deadlineObj
            ? deadlineObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : "Not set"}
        </p>
        <p className="info-hint" style={{ color: isRegistrationClosed(t) ? "var(--danger)" : "var(--success)" }}>
          {isRegistrationClosed(t) ? "Registration closed" : "Registration open"}
        </p>
      </div>

      <div className="info-card">
        <span className="info-label">Organizer</span>
        <p className="info-value-lg">{organizerName || "Unknown"}</p>
      </div>
    </div>
  );
}
