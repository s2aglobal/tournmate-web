import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createPlayer } from "../services/api";
import { useSiteConfig } from "../services/siteConfig";
import StoreButtons from "../components/shared/StoreButtons";
import SportPicker from "../components/shared/SportPicker";
import { APP_AVATARS, DEFAULT_AVATAR_ID, avatarImageUrl } from "../services/avatars";
import { callableErrorMessage } from "../services/functions";
import { uploadProfilePhoto } from "../services/profilePhotos";
import PlayerAvatar from "../components/shared/PlayerAvatar";
import { PhotoIcon } from "../components/shared/icons";


type Step = "profile" | "hand" | "skill" | "success";
type PlayingHand = "right" | "left";
type SkillLevel = "beginner" | "intermediate" | "advanced" | "pro";

const SKILL_OPTIONS: { value: SkillLevel; label: string; desc: string }[] = [
  { value: "beginner", label: "Beginner", desc: "Just starting out, learning the basics." },
  { value: "intermediate", label: "Intermediate", desc: "Can rally and understand basic tactics." },
  { value: "advanced", label: "Advanced", desc: "Tournament regular, consistent shots." },
  { value: "pro", label: "Pro", desc: "National level player or high-rank." },
];

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
  // None picked in the UI; DEFAULT_AVATAR_ID is saved if the user skips it.
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [choosingAvatar, setChoosingAvatar] = useState(false);
  // Photo is uploaded only after the player doc is created. A photo or an
  // avatar is required (same as the apps).
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoStatus, setPhotoStatus] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [homeCountryCode, setHomeCountryCode] = useState("US");
  const [homePostalCode, setHomePostalCode] = useState("");
  // Same choice as the apps' "Your sport" (live sports from config/sports).
  const [preferredSport, setPreferredSport] = useState("");

  // Step 2 — playing hand (saved as playingHand, like the apps)
  const [playingHand, setPlayingHand] = useState<PlayingHand>("right");

  // Step 3 — skill level (saved as skillLevel, like the apps)
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("intermediate");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!photoFile) { setPhotoPreview(null); return; }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  function handlePhotoPicked(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) setPhotoFile(file);
  }

  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;
  const isUnderAge = age !== null && age < MINIMUM_AGE;
  // Same as the apps: Next stays disabled until every required field is filled.
  const hasPicture = !!photoFile || !!selectedAvatar;
  const canContinue =
    name.trim().length >= 2 && !!dateOfBirth && !isUnderAge && !!preferredSport && homePostalCode.trim() !== "" &&
    hasPicture;

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
    if (!hasPicture) {
      setError("Add a photo or choose an avatar to continue.");
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
        avatarId: selectedAvatar ?? DEFAULT_AVATAR_ID,
        homeCountryCode: homeCountryCode || undefined,
        homePostalCode: homePostalCode.trim() || undefined,
        dateOfBirth,
        preferredSport,
        playingHand,
        skillLevel,
      });
      if (photoFile) {
        // The profile exists now; a failed photo doesn't undo it.
        setPhotoStatus("Uploading photo... 0%");
        try {
          setPhotoURL(await uploadProfilePhoto(user.uid, photoFile, (f) => {
            setPhotoStatus(f < 1 ? `Uploading photo... ${Math.round(f * 100)}%` : "Checking photo...");
          }));
        } catch (err) {
          const reason = callableErrorMessage(err, "Couldn't upload your photo.");
          // Photo only: the default avatar was saved in its place.
          setPhotoError(selectedAvatar
            ? `${reason} You can add one later on your Profile page.`
            : `${reason} We've given you a default avatar; you can change it on your Profile page.`);
        } finally {
          setPhotoStatus("");
        }
      }
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
              <label>Your Sport</label>
              <SportPicker categories={categories} live={live} value={preferredSport} onChange={setPreferredSport} />
              <p style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginTop: 4 }}>
                The app opens on this sport. You can change it any time.
              </p>
            </div>

            <div className="form-group">
              <label>Profile Picture</label>
              <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhotoPicked} />
              <div className="picture-card">
                <div className="picture-row clickable" onClick={() => photoInputRef.current?.click()}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Your photo" className="picture-circle" />
                  ) : (
                    <div className="picture-circle upload"><PhotoIcon size={22} /></div>
                  )}
                  <div className="picture-text">
                    <div className="picture-title">Upload photo</div>
                    {photoFile ? (
                      <button type="button" className="picture-action picture-remove" onClick={(e) => { e.stopPropagation(); setPhotoFile(null); }}>Remove</button>
                    ) : (
                      <div className="picture-sub">Add a photo</div>
                    )}
                  </div>
                  <button type="button" className="picture-action">
                    {photoFile ? "Change" : "Upload"}
                  </button>
                </div>
                <div className="picture-row">
                  {selectedAvatar ? (
                    <img src={avatarImageUrl(selectedAvatar)} alt="" className="picture-circle" />
                  ) : (
                    <div className="picture-circle" />
                  )}
                  <div className="picture-text">
                    <div className="picture-title">Choose an avatar</div>
                    <div className="picture-sub">{APP_AVATARS.find((a) => a.id === selectedAvatar)?.name ?? "Pick one"}</div>
                  </div>
                  <button type="button" className="picture-action" aria-expanded={choosingAvatar} onClick={() => setChoosingAvatar((v) => !v)}>
                    {choosingAvatar ? "Done" : <>Change &#x203A;</>}
                  </button>
                </div>
                {choosingAvatar && (
                  <div className="picture-avatar-grid avatar-editor-grid">
                    {APP_AVATARS.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        className={`avatar-editor-option${selectedAvatar === a.id ? " selected" : ""}`}
                        aria-label={a.name}
                        aria-pressed={selectedAvatar === a.id}
                        onClick={() => setSelectedAvatar(a.id)}
                      >
                        <span className="avatar-editor-circle">
                          <img src={avatarImageUrl(a.id)} alt="" loading="lazy" />
                          {selectedAvatar === a.id && <span className="avatar-editor-badge" aria-hidden="true">&#x2713;</span>}
                        </span>
                        <span className="avatar-editor-label">{a.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {!hasPicture && (
                <p style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginTop: 6 }}>
                  Add a photo or choose an avatar to continue.
                </p>
              )}
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

            <button type="submit" className="btn-primary" disabled={!canContinue}>
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
          <h1>Which is your playing hand?</h1>
          <p className="auth-subtitle">This helps us match you for doubles.</p>

          <div className="choice-grid">
            <button
              type="button"
              className={`choice-card${playingHand === "left" ? " selected" : ""}`}
              onClick={() => setPlayingHand("left")}
            >
              <span className="choice-icon">&#x270B;</span>
              <span className="choice-label">Left Handed</span>
            </button>
            <button
              type="button"
              className={`choice-card${playingHand === "right" ? " selected" : ""}`}
              onClick={() => setPlayingHand("right")}
            >
              <span className="choice-icon">&#x1F91A;</span>
              <span className="choice-label">Right Handed</span>
            </button>
          </div>

          <div className="wizard-buttons">
            <button
              type="button"
              className="btn-outline"
              onClick={() => setStep("profile")}
            >
              Back
            </button>
            <button
              type="button"
              className="btn-primary"
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
          <h1>What's your skill level?</h1>
          <p className="auth-subtitle">Be honest! It ensures fair matches.</p>

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

          <div className="wizard-buttons">
            <button
              type="button"
              className="btn-outline"
              onClick={() => setStep("hand")}
            >
              Back
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSkillDone}
              disabled={loading}
            >
              {loading ? photoStatus || "Creating Profile..." : "Create Profile"}
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
        {photoError && <div className="alert error" style={{ marginTop: 16 }}>{photoError}</div>}
        <PlayerAvatar
          photoURL={photoURL}
          avatarId={selectedAvatar ?? DEFAULT_AVATAR_ID}
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
