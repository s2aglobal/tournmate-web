import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createTournament } from "../services/tournaments";
import {
  FORMAT_LABELS, MATCH_FORMAT_LABELS, AGE_GROUP_LABELS,
  isSinglesFormat, type TournamentFormat, type MatchFormat, type AgeGroup,
} from "../types";

type Step = 1 | 2 | 3 | 4;

const ALL_FORMATS: TournamentFormat[] = [
  "mensSingles", "womensSingles", "openSingles",
  "mensDoubles", "womensDoubles", "mixedDoubles", "openDoubles",
];
const ALL_MATCH_FORMATS: MatchFormat[] = [
  "singleElimination", "doubleElimination", "roundRobin", "groupKnockout", "swiss",
];
const ALL_AGE_GROUPS: AgeGroup[] = [
  "open", "u13", "u15", "u17", "u19", "u24",
  "senior", "veterans35", "masters40", "masters50", "grandMasters55",
];

export default function CreateTournamentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState<TournamentFormat>("openSingles");
  const [randomPairing, setRandomPairing] = useState(false);
  const [location, setLocation] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");

  // Step 2
  const [matchFmt, setMatchFmt] = useState<MatchFormat>("singleElimination");
  const [ageGroupVal, setAgeGroupVal] = useState<AgeGroup>("open");

  // Step 3
  const [currency, setCurrency] = useState("USD");
  const [entryFee, setEntryFee] = useState("");
  const [paymentInfo, setPaymentInfo] = useState("");
  const [prizeInfo, setPrizeInfo] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");

  const isDoubles = !isSinglesFormat(format);
  const feeNum = parseFloat(entryFee) || 0;

  function validateStep1(): string | null {
    if (!title.trim() || title.trim().length < 3) return "Title must be at least 3 characters.";
    if (title.trim().length > 100) return "Title cannot exceed 100 characters.";
    if (!location.trim()) return "Venue name is required.";
    if (!date || !time) return "Date and time are required.";
    const dt = new Date(`${date}T${time}`);
    const minTime = new Date(Date.now() + 3 * 60 * 60 * 1000);
    if (dt < minTime) return "Tournament must be at least 3 hours from now.";
    return null;
  }

  function validateStep3(): string | null {
    if (feeNum > 0) {
      if (!paymentInfo.trim()) return "Payment info is required when entry fee is set.";
      if (!prizeInfo.trim()) return "Prize info is required when entry fee is set.";
    }
    if (deadlineDate) {
      const dl = new Date(deadlineDate);
      if (dl < new Date()) return "Registration deadline must be in the future.";
    }
    return null;
  }

  function handleNext(e?: FormEvent) {
    e?.preventDefault();
    setError("");
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      const err = validateStep3();
      if (err) { setError(err); return; }
      setStep(4);
    }
  }

  async function handlePublish() {
    if (!user) return;
    setError("");
    setLoading(true);
    try {
      const dt = new Date(`${date}T${time}`);
      const dl = deadlineDate
        ? new Date(deadlineDate)
        : new Date(dt.getTime() - 24 * 60 * 60 * 1000);

      const t = await createTournament(user.uid, {
        title: title.trim(),
        date: dt,
        location: location.trim(),
        locationAddress: locationAddress.trim(),
        formatRaw: format,
        matchFormatRaw: matchFmt,
        randomPairing: isDoubles ? randomPairing : false,
        registrationDeadline: dl,
        entryFee: feeNum > 0 ? feeNum : undefined,
        currency: currency || "USD",
        paymentInfo: paymentInfo.trim() || undefined,
        prizeInfo: prizeInfo.trim() || undefined,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
        ageGroupRaw: ageGroupVal,
      });
      navigate(`/tournaments/${t.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tournament.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-card" style={{ maxWidth: 600 }}>
        <div className="step-indicator">Step {step} of 4</div>

        {step === 1 && (
          <>
            <h1>Basic Info</h1>
            <p className="auth-subtitle">What's your tournament about?</p>
            {error && <div className="alert error">{error}</div>}
            <form onSubmit={handleNext}>
              <div className="form-group">
                <label>Tournament Title</label>
                <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekend Badminton Open" />
              </div>
              <div className="form-group">
                <label>Event Type</label>
                <select className="form-select" value={format} onChange={(e) => setFormat(e.target.value as TournamentFormat)}>
                  {ALL_FORMATS.map((f) => <option key={f} value={f}>{FORMAT_LABELS[f]}</option>)}
                </select>
              </div>
              {isDoubles && (
                <div className="form-group">
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={randomPairing} onChange={(e) => setRandomPairing(e.target.checked)} />
                    Random pairing (assign partners automatically)
                  </label>
                </div>
              )}
              <div className="form-group">
                <label>Venue Name</label>
                <input className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. City Sports Center" />
              </div>
              <div className="form-group">
                <label>Venue Address (optional)</label>
                <input className="form-input" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} placeholder="e.g. 123 Main St, Austin TX" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" className="form-input" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Duration (minutes, optional)</label>
                <input type="number" className="form-input" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} placeholder="e.g. 120" />
              </div>
              <button type="submit" className="btn-primary">Next</button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Format Rules</h1>
            <p className="auth-subtitle">How will matches be played?</p>
            {error && <div className="alert error">{error}</div>}
            <div className="form-group">
              <label>Match Format</label>
              <select className="form-select" value={matchFmt} onChange={(e) => setMatchFmt(e.target.value as MatchFormat)}>
                {ALL_MATCH_FORMATS.map((f) => <option key={f} value={f}>{MATCH_FORMAT_LABELS[f]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Age Group</label>
              <select className="form-select" value={ageGroupVal} onChange={(e) => setAgeGroupVal(e.target.value as AgeGroup)}>
                {ALL_AGE_GROUPS.map((g) => <option key={g} value={g}>{AGE_GROUP_LABELS[g]}</option>)}
              </select>
            </div>
            <div className="wizard-buttons">
              <button className="btn-outline" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary" onClick={() => handleNext()}>Next</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1>Rules & Logistics</h1>
            <p className="auth-subtitle">Entry fees, prizes, and deadlines</p>
            {error && <div className="alert error">{error}</div>}
            <form onSubmit={handleNext}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                <div className="form-group">
                  <label>Currency</label>
                  <select className="form-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                    <option value="MYR">MYR</option>
                    <option value="SGD">SGD</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Entry Fee (0 = Free)</label>
                  <input type="number" min={0} className="form-input" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} placeholder="0" />
                </div>
              </div>
              {feeNum > 0 && (
                <>
                  <div className="form-group">
                    <label>Payment Info</label>
                    <textarea className="form-input" rows={2} value={paymentInfo} onChange={(e) => setPaymentInfo(e.target.value)} placeholder="e.g. Venmo @organizer or pay at the venue" />
                  </div>
                  <div className="form-group">
                    <label>Prize Info</label>
                    <textarea className="form-input" rows={2} value={prizeInfo} onChange={(e) => setPrizeInfo(e.target.value)} placeholder="e.g. Winner gets $100, Runner-up $50" />
                  </div>
                </>
              )}
              <div className="form-group">
                <label>Registration Deadline (optional)</label>
                <input type="date" className="form-input" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} />
                <p style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginTop: 4 }}>
                  Defaults to 1 day before the tournament if not set.
                </p>
              </div>
              <div className="wizard-buttons">
                <button type="button" className="btn-outline" onClick={() => setStep(2)}>Back</button>
                <button type="submit" className="btn-primary">Next</button>
              </div>
            </form>
          </>
        )}

        {step === 4 && (
          <>
            <h1>Review & Post</h1>
            <p className="auth-subtitle">Confirm your tournament details</p>
            {error && <div className="alert error">{error}</div>}
            <div className="review-card">
              <div className="review-row"><span>Title</span><strong>{title}</strong></div>
              <div className="review-row"><span>Event Type</span><strong>{FORMAT_LABELS[format]}</strong></div>
              <div className="review-row"><span>Match Format</span><strong>{MATCH_FORMAT_LABELS[matchFmt]}</strong></div>
              <div className="review-row"><span>Date</span><strong>{date} at {time}</strong></div>
              <div className="review-row"><span>Venue</span><strong>{location}</strong></div>
              {locationAddress && <div className="review-row"><span>Address</span><strong>{locationAddress}</strong></div>}
              <div className="review-row"><span>Age Group</span><strong>{AGE_GROUP_LABELS[ageGroupVal]}</strong></div>
              <div className="review-row"><span>Entry Fee</span><strong>{feeNum > 0 ? `${currency} ${feeNum}` : "Free"}</strong></div>
              {prizeInfo && <div className="review-row"><span>Prize</span><strong>{prizeInfo}</strong></div>}
              {isDoubles && <div className="review-row"><span>Random Pairing</span><strong>{randomPairing ? "Yes" : "No"}</strong></div>}
              {deadlineDate && <div className="review-row"><span>Deadline</span><strong>{deadlineDate}</strong></div>}
              {durationMinutes && <div className="review-row"><span>Duration</span><strong>{durationMinutes} min</strong></div>}
            </div>
            <div className="wizard-buttons" style={{ marginTop: 24 }}>
              <button className="btn-outline" onClick={() => setStep(3)}>Back</button>
              <button className="btn-primary" onClick={handlePublish} disabled={loading}>
                {loading ? "Publishing..." : "Publish Tournament"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
