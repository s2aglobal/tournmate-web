import { useEffect, useState, type FormEvent } from "react";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import {
  updatePlayer,
  getMatchStats,
  getSportsmanship,
  getFitnessData,
  type MatchStats,
  type SportsmanshipData,
  type FitnessData,
} from "../services/api";
import { removeProfilePhoto, callableErrorMessage } from "../services/functions";
import { uploadProfilePhoto } from "../services/profilePhotos";
import PlayerAvatar from "../components/shared/PlayerAvatar";
import ConfirmDialog from "../components/shared/ConfirmDialog";
import AvatarEditor from "../components/shared/AvatarEditor";


function tierForElo(elo: number): { name: string; color: string; next: number | null } {
  if (elo >= 2200) return { name: "Grandmaster", color: "#EF4444", next: null };
  if (elo >= 2000) return { name: "Master", color: "#F59E0B", next: 2200 };
  if (elo >= 1800) return { name: "Expert", color: "#8B5CF6", next: 2000 };
  if (elo >= 1600) return { name: "Advanced", color: "#3B82F6", next: 1800 };
  if (elo >= 1400) return { name: "Intermediate", color: "#22C55E", next: 1600 };
  return { name: "Beginner", color: "#94A3B8", next: 1400 };
}

function seedFromElo(elo: number): number {
  if (elo >= 2200) return 1;
  if (elo >= 2000) return 2;
  if (elo >= 1800) return 3;
  if (elo >= 1600) return 4;
  if (elo >= 1400) return 5;
  return 6;
}

function ageFromTimestamp(ts: Timestamp): number | null {
  if (!ts || !ts.toDate) return null;
  const birth = ts.toDate();
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function StarRow({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: i <= Math.round(rating) ? "#F59E0B" : "var(--gray-200)", fontSize: "1.2rem" }}>
        &#x2605;
      </span>
    );
  }
  return <div style={{ display: "flex", gap: 2 }}>{stars}</div>;
}

export default function ProfilePage() {
  const { player, user, refreshPlayer } = useAuth();

  const [editingAvatar, setEditingAvatar] = useState(false);
  // Avatar picked in the editor, waiting on the "remove your photo?" confirm.
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [editingRegion, setEditingRegion] = useState(false);
  const [homeCountryCode, setHomeCountryCode] = useState(player?.homeCountryCode ?? "US");
  const [homePostalCode, setHomePostalCode] = useState(player?.homePostalCode ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  // Photo upload / removal: status text while busy, error from the server.
  const [photoStatus, setPhotoStatus] = useState("");
  const [photoError, setPhotoError] = useState("");

  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [sportsmanship, setSportsmanship] = useState<SportsmanshipData | null>(null);
  const [fitness, setFitness] = useState<FitnessData | null>(null);

  useEffect(() => {
    if (!player) return;
    getMatchStats(player.id).then(setMatchStats);
    getSportsmanship(player.id).then(setSportsmanship);
    getFitnessData(player.id).then(setFitness);
  }, [player]);

  if (!player || !user) return null;

  const tier = tierForElo(player.elo);
  const seed = seedFromElo(player.elo);
  const age = player.dateOfBirth ? ageFromTimestamp(player.dateOfBirth) : null;
  const avatarSeed = player.name;

  function closeEditor() {
    setEditingAvatar(false);
    setPhotoError("");
  }

  function handleSaveAvatar(avatarId: string) {
    // With a photo set, the photo shows instead of the avatar, so switching
    // to a different avatar means removing the photo first.
    if (player!.photoURL) {
      setPendingAvatar(avatarId);
      return;
    }
    saveAvatar(avatarId, false);
  }

  async function saveAvatar(avatarId: string, removePhoto: boolean) {
    setSaving(true);
    setMessage("");
    setPhotoError("");
    if (removePhoto) {
      try {
        await removeProfilePhoto();
      } catch (err) {
        setPendingAvatar(null);
        setSaving(false);
        setPhotoError(callableErrorMessage(err, "Couldn't remove your photo. Please try again."));
        return;
      }
    }
    try {
      await updatePlayer(player!.id, user!.uid, { avatarId });
      await refreshPlayer();
      setEditingAvatar(false);
      setMessage("Avatar updated!");
    } catch {
      setMessage("Failed to update avatar.");
      // The photo may already be gone; show the current state.
      if (removePhoto) await refreshPlayer();
    } finally {
      setPendingAvatar(null);
      setSaving(false);
    }
  }

  async function handlePhotoPicked(file: File) {
    setPhotoError("");
    setMessage("");
    setPhotoStatus("Uploading... 0%");
    try {
      await uploadProfilePhoto(user!.uid, file, (f) => {
        setPhotoStatus(f < 1 ? `Uploading... ${Math.round(f * 100)}%` : "Checking photo...");
      });
      await refreshPlayer();
      setMessage("Photo updated!");
    } catch (err) {
      setPhotoError(callableErrorMessage(err, "Couldn't upload your photo. Please try again."));
    } finally {
      setPhotoStatus("");
    }
  }

  async function handleRemovePhoto() {
    setPhotoError("");
    setMessage("");
    setPhotoStatus("Removing photo...");
    try {
      await removeProfilePhoto();
      await refreshPlayer();
      setMessage("Photo removed.");
    } catch (err) {
      setPhotoError(callableErrorMessage(err, "Couldn't remove your photo. Please try again."));
    } finally {
      setPhotoStatus("");
    }
  }

  async function saveRegion(e: FormEvent) {
    e.preventDefault();
    if (!homePostalCode.trim()) {
      setMessage("Zip / Postal code is required.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await updatePlayer(player!.id, user!.uid, {
        homeCountryCode,
        homePostalCode: homePostalCode.trim(),
      });
      await refreshPlayer();
      setEditingRegion(false);
      setMessage("Home area updated!");
    } catch {
      setMessage("Failed to update home area.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner">

        {message && (
          <div className={`alert ${message.includes("Failed") ? "error" : "success"}`} style={{ marginBottom: 16 }}>
            {message}
          </div>
        )}

        {/* ── Profile Header ── */}
        <div className="profile-section">
          <div className="profile-header-card">
            <div className="profile-avatar-wrapper">
              <PlayerAvatar photoURL={player.photoURL} avatarId={player.avatarId} nameSeed={avatarSeed} alt="Avatar" className="profile-lg-avatar" />
              <button className="profile-avatar-edit" onClick={() => { setEditingAvatar(true); setMessage(""); }} title="Change photo or avatar">
                &#x270F;&#xFE0F;
              </button>
            </div>
            <h2 className="profile-name">{player.name}</h2>
            <div className="profile-badges">
              {(player.genderRaw === "male" || player.genderRaw === "female") && (
                <span className="profile-badge">{player.genderRaw === "female" ? "Female" : "Male"}</span>
              )}
              <span className="profile-badge" style={{ background: tier.color, color: "white" }}>{tier.name}</span>
            </div>
          </div>

          {editingAvatar && (
            <AvatarEditor
              name={player.name}
              nameSeed={avatarSeed}
              photoURL={player.photoURL || null}
              avatarId={player.avatarId || null}
              photoStatus={photoStatus}
              error={photoError || (message.includes("Failed") ? message : "")}
              saving={saving}
              onPickPhoto={handlePhotoPicked}
              onRemovePhoto={handleRemovePhoto}
              onSave={handleSaveAvatar}
              onCancel={closeEditor}
            />
          )}

          {pendingAvatar && (
            <ConfirmDialog
              title="Use this avatar instead of your photo?"
              message="Your photo will be removed."
              confirmLabel="Use Avatar"
              busy={saving}
              onConfirm={() => saveAvatar(pendingAvatar, true)}
              onCancel={() => setPendingAvatar(null)}
            />
          )}
        </div>

        {/* ── Contact ── */}
        <div className="profile-section">
          <div className="profile-card-section">
            <h3 className="profile-section-title">Contact</h3>
            <div className="profile-row">
              <span className="profile-row-label">Email</span>
              <span className="profile-row-value">{player.email}</span>
            </div>
            {player.phone && (
              <div className="profile-row">
                <span className="profile-row-label">Phone</span>
                <span className="profile-row-value">{player.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Age ── */}
        <div className="profile-section">
          <div className="profile-card-section">
            <h3 className="profile-section-title">Age</h3>
            <div className="profile-row">
              <span className="profile-row-value">
                {age !== null ? `${age} years old` : "Not set"}
              </span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginTop: 4 }}>
              Used for age-group eligibility
            </p>
          </div>
        </div>

        {/* ── Tournament Area ── */}
        <div className="profile-section">
          <div className="profile-card-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="profile-section-title">Tournament Area</h3>
              {!editingRegion && (
                <button className="btn-text" onClick={() => { setEditingRegion(true); setMessage(""); }}>Edit</button>
              )}
            </div>
            {!editingRegion ? (
              <>
                <div className="profile-row">
                  <span className="profile-row-label">Country</span>
                  <span className="profile-row-value">{player.homeCountryCode ?? "Not set"}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-row-label">Zip / Postal</span>
                  <span className="profile-row-value">{player.homePostalCode ?? "Not set"}</span>
                </div>
              </>
            ) : (
              <form onSubmit={saveRegion} style={{ marginTop: 12 }}>
                <div className="form-group">
                  <label htmlFor="editCountry">Country</label>
                  <select id="editCountry" className="form-select" value={homeCountryCode} onChange={(e) => setHomeCountryCode(e.target.value)}>
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
                  <label htmlFor="editPostal">Zip / Postal Code</label>
                  <input id="editPostal" type="text" className="form-input" value={homePostalCode} onChange={(e) => setHomePostalCode(e.target.value)} placeholder="e.g. 75001" />
                </div>
                <div className="wizard-buttons">
                  <button type="button" className="btn-outline" onClick={() => setEditingRegion(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ── Match Stats ── */}
        <div className="profile-section">
          <div className="profile-card-section">
            <h3 className="profile-section-title">Match Stats</h3>
            {matchStats ? (
              <div className="profile-stats-row">
                <div className="profile-stat">
                  <span className="profile-stat-value">{matchStats.matchesPlayed}</span>
                  <span className="profile-stat-label">Matches</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">{matchStats.wins}</span>
                  <span className="profile-stat-label">Wins</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">{matchStats.winRate}%</span>
                  <span className="profile-stat-label">Win Rate</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 12 }}><div className="spinner" style={{ margin: "0 auto", width: 24, height: 24 }} /></div>
            )}
          </div>
        </div>

        {/* ── Fitness ── */}
        {fitness && fitness.sessions > 0 && (
          <div className="profile-section">
            <div className="profile-card-section">
              <h3 className="profile-section-title">Fitness</h3>
              <div className="profile-stats-row">
                <div className="profile-stat">
                  <span className="profile-stat-value">{fitness.totalCalories.toLocaleString()}</span>
                  <span className="profile-stat-label">Total Calories</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">{fitness.sessions}</span>
                  <span className="profile-stat-label">Sessions</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">{fitness.avgPerSession}</span>
                  <span className="profile-stat-label">Avg / Session</span>
                </div>
              </div>
              {player.weightKg && (
                <p style={{ fontSize: "0.85rem", color: "var(--gray-500)", marginTop: 16, textAlign: "center" }}>
                  Weight: {player.weightKg} kg
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Skill Rating ── */}
        <div className="profile-section">
          <div className="profile-card-section">
            <h3 className="profile-section-title">Skill Rating</h3>
            <div className="profile-stats-row" style={{ marginBottom: 16 }}>
              <div className="profile-stat">
                <span className="profile-stat-value" style={{ color: tier.color }}>{player.elo}</span>
                <span className="profile-stat-label">Elo</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">Seed {seed}</span>
                <span className="profile-stat-label">{tier.name}</span>
              </div>
              {player.streak !== 0 && (
                <div className="profile-stat">
                  <span className="profile-stat-value">
                    {player.streak > 0 ? `${player.streak}W` : `${Math.abs(player.streak)}L`}
                  </span>
                  <span className="profile-stat-label">Streak</span>
                </div>
              )}
            </div>
            {tier.next && (
              <p style={{ fontSize: "0.85rem", color: "var(--gray-400)", textAlign: "center" }}>
                {tier.next - player.elo} points to next tier
              </p>
            )}
          </div>
        </div>

        {/* ── Sportsmanship ── */}
        <div className="profile-section">
          <div className="profile-card-section">
            <h3 className="profile-section-title">Sportsmanship</h3>
            {sportsmanship ? (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <StarRow rating={sportsmanship.average} />
                <span style={{ fontWeight: 700, color: "var(--dark-navy)" }}>
                  {sportsmanship.average.toFixed(1)} / 5.0
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>
                  {sportsmanship.count} rating{sportsmanship.count !== 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 12 }}><div className="spinner" style={{ margin: "0 auto", width: 24, height: 24 }} /></div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
