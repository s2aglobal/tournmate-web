import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createPlayer } from "../services/api";
import { useSiteConfig } from "../services/siteConfig";
import StoreButtons from "../components/shared/StoreButtons";
import SportPicker from "../components/shared/SportPicker";
import { APP_AVATARS, DEFAULT_AVATAR_ID, avatarImageUrl } from "../services/avatars";


type Step = "profile" | "success";

const MINIMUM_AGE = 13;


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
  const { iosStoreURL, androidStoreURL, live, categories } = useSiteConfig();

  const [step, setStep] = useState<Step>("profile");

  // Step 1 — profile fields
  const [name, setName] = useState(user?.displayName ?? "");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATAR_ID);
  const [homeCountryCode, setHomeCountryCode] = useState("US");
  const [homePostalCode, setHomePostalCode] = useState("");
  // Same choice as the apps' "Your sport" (live sports from config/sports).
  const [preferredSport, setPreferredSport] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;
  const isUnderAge = age !== null && age < MINIMUM_AGE;
  // Same as the apps: the button stays disabled until every required field is filled.
  const canSubmit =
    name.trim().length >= 2 && !!dateOfBirth && !isUnderAge && !!preferredSport && homePostalCode.trim() !== "";

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
    if (!preferredSport) {
      setError("Choose your sport.");
      return;
    }
    if (!homePostalCode.trim()) {
      setError("Zip / Postal code is required.");
      return;
    }

    void createProfile();
  }

  async function createProfile() {
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
        preferredSport,
      });
      await refreshPlayer();
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

  function goToDashboard() {
    navigate("/dashboard");
  }

  // ── Step 1: Profile Info ────────────────────────────
  if (step === "profile") {
    return (
      <div className="profile-page">
        <div className="profile-card">
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
              <label>Your Sport</label>
              <SportPicker categories={categories} live={live} value={preferredSport} onChange={setPreferredSport} />
              <p style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginTop: 4 }}>
                The app opens on this sport. You can change it any time.
              </p>
            </div>

            <div className="form-group">
              <label>Choose Your Avatar</label>
              <div className="avatar-grid">
                {APP_AVATARS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`avatar-option${selectedAvatar === a.id ? " selected" : ""}`}
                    onClick={() => setSelectedAvatar(a.id)}
                    title={a.name}
                    aria-label={a.name}
                  >
                    <img src={avatarImageUrl(a.id)} alt="" loading="lazy" />
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

            <button type="submit" className="btn-primary" disabled={loading || !canSubmit}>
              {loading ? "Creating Profile..." : "Complete Setup"}
            </button>
          </form>
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
          src={avatarImageUrl(selectedAvatar)}
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
        <p className="auth-subtitle" style={{ marginTop: 24, marginBottom: 16 }}>
          Get the app to join tournaments and open play.
        </p>
        <StoreButtons ios={iosStoreURL} android={androidStoreURL} />
        <button
          type="button"
          className="btn-primary"
          style={{ marginTop: 24 }}
          onClick={goToDashboard}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
