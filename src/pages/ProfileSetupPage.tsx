import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createPlayer } from "../services/api";

const AVATAR_STYLES = [
  "adventurer",
  "avataaars",
  "bottts",
  "fun-emoji",
  "lorelei",
  "micah",
  "miniavs",
  "notionists",
  "open-peeps",
  "personas",
];

type Step = "profile" | "hand" | "skill" | "success";
type PlayingHand = "right" | "left";
type SkillLevel = "beginner" | "intermediate" | "advanced" | "pro";

const SKILL_OPTIONS: { value: SkillLevel; label: string; desc: string }[] = [
  { value: "beginner", label: "Beginner", desc: "Just getting started" },
  { value: "intermediate", label: "Intermediate", desc: "Play regularly, know the basics" },
  { value: "advanced", label: "Advanced", desc: "Competitive player with solid skills" },
  { value: "pro", label: "Pro", desc: "Tournament-level or professional" },
];

const MINIMUM_AGE = 13;

function avatarUrl(seed: string, style: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function maxDateForPicker(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 5);
  return d.toISOString().split("T")[0];
}

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { user, refreshPlayer } = useAuth();

  const [step, setStep] = useState<Step>("profile");

  // Step 1 — profile fields
  const [name, setName] = useState(user?.displayName ?? "");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_STYLES[0]);
  const [homeCountryCode, setHomeCountryCode] = useState("US");
  const [homePostalCode, setHomePostalCode] = useState("");

  // Step 2 — playing hand (UI-only, matches iOS)
  const [playingHand, setPlayingHand] = useState<PlayingHand>("right");

  // Step 3 — skill level (UI-only, matches iOS)
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("intermediate");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const avatarSeed = name || user?.email || "player";
  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;
  const isUnderAge = age !== null && age < MINIMUM_AGE;

  function handleProfileNext(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (!dateOfBirth) {
      setError("Date of birth is required.");
      return;
    }
    if (isUnderAge) {
      setError(`You must be at least ${MINIMUM_AGE} years old to use TournMate.`);
      return;
    }
    if (!homePostalCode.trim()) {
      setError("Zip / Postal code is required.");
      return;
    }

    setStep("hand");
  }

  function handleHandNext() {
    setStep("skill");
  }

  async function handleSkillDone() {
    setError("");

    if (!user?.email) {
      setError("No email found on your account. Please sign out and try again.");
      return;
    }

    setLoading(true);
    try {
      await createPlayer(user.uid, {
        name: name.trim(),
        email: user.email,
        phone: phone.trim(),
        gender,
        avatarId: selectedAvatar,
        homeCountryCode: homeCountryCode || undefined,
        homePostalCode: homePostalCode.trim() || undefined,
        dateOfBirth,
      });
      setStep("success");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong while creating your profile. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function goToDashboard() {
    await refreshPlayer();
    navigate("/dashboard");
  }

  // ── Step 1: Profile Info ────────────────────────────
  if (step === "profile") {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <div className="step-indicator">Step 1 of 3</div>
          <h1>Set Up Your Profile</h1>
          <p className="auth-subtitle">Tell us about yourself to get started</p>

          {error && <div className="alert error">{error}</div>}

          <form onSubmit={handleProfileNext}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <input
                id="dob"
                type="date"
                className="form-input"
                value={dateOfBirth}
                max={maxDateForPicker()}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
              {isUnderAge && (
                <p className="form-error">
                  You must be at least {MINIMUM_AGE} years old to use TournMate.
                </p>
              )}
              {dateOfBirth && !isUnderAge && (
                <p style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginTop: 4 }}>
                  Used for age verification and tournament eligibility
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone (optional)</label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                className="form-select"
                value={gender}
                onChange={(e) => setGender(e.target.value as "male" | "female")}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label>Choose Your Avatar</label>
              <div className="avatar-grid">
                {AVATAR_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    className={`avatar-option${selectedAvatar === style ? " selected" : ""}`}
                    onClick={() => setSelectedAvatar(style)}
                    title={style}
                  >
                    <img
                      src={avatarUrl(avatarSeed, style)}
                      alt={style}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <select
                  id="country"
                  className="form-select"
                  value={homeCountryCode}
                  onChange={(e) => setHomeCountryCode(e.target.value)}
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="IN">India</option>
                  <option value="MY">Malaysia</option>
                  <option value="ID">Indonesia</option>
                  <option value="JP">Japan</option>
                  <option value="KR">South Korea</option>
                  <option value="CN">China</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="postalCode">Zip / Postal Code</label>
                <input
                  id="postalCode"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 75001"
                  value={homePostalCode}
                  onChange={(e) => setHomePostalCode(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Next
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Step 2: Playing Hand ────────────────────────────
  if (step === "hand") {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <div className="step-indicator">Step 2 of 3</div>
          <h1>Playing Hand</h1>
          <p className="auth-subtitle">Which hand do you play with?</p>

          <div className="choice-grid">
            <button
              type="button"
              className={`choice-card${playingHand === "right" ? " selected" : ""}`}
              onClick={() => setPlayingHand("right")}
            >
              <span className="choice-icon">&#x1F91A;</span>
              <span className="choice-label">Right Handed</span>
            </button>
            <button
              type="button"
              className={`choice-card${playingHand === "left" ? " selected" : ""}`}
              onClick={() => setPlayingHand("left")}
            >
              <span className="choice-icon">&#x270B;</span>
              <span className="choice-label">Left Handed</span>
            </button>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <button
              type="button"
              className="btn-outline"
              style={{ flex: 1 }}
              onClick={() => setStep("profile")}
            >
              Back
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ flex: 2 }}
              onClick={handleHandNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 3: Skill Level ─────────────────────────────
  if (step === "skill") {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <div className="step-indicator">Step 3 of 3</div>
          <h1>Skill Level</h1>
          <p className="auth-subtitle">How would you rate your ability?</p>

          {error && <div className="alert error">{error}</div>}

          <div className="skill-grid">
            {SKILL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`skill-card${skillLevel === opt.value ? " selected" : ""}`}
                onClick={() => setSkillLevel(opt.value)}
              >
                <span className="skill-label">{opt.label}</span>
                <span className="skill-desc">{opt.desc}</span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <button
              type="button"
              className="btn-outline"
              style={{ flex: 1 }}
              onClick={() => setStep("hand")}
            >
              Back
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ flex: 2 }}
              onClick={handleSkillDone}
              disabled={loading}
            >
              {loading ? "Creating Profile..." : "Complete Setup"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Success Screen ──────────────────────────────────
  return (
    <div className="profile-page">
      <div className="profile-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>&#x1F389;</div>
        <h1>You're All Set!</h1>
        <p className="auth-subtitle">
          Your profile has been created. Welcome to TournMate!
        </p>
        <img
          src={avatarUrl(avatarSeed, selectedAvatar)}
          alt="Your avatar"
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            margin: "24px auto",
            border: "3px solid var(--brand-purple)",
          }}
        />
        <p style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--dark-navy)" }}>
          {name}
        </p>
        <button
          type="button"
          className="btn-primary"
          style={{ marginTop: 32 }}
          onClick={goToDashboard}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
