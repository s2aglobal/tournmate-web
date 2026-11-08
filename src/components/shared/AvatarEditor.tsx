import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { APP_AVATARS, avatarImageUrl } from "../../services/avatars";
import PlayerAvatar from "./PlayerAvatar";
import { PhotoIcon, TrashIcon } from "./icons";

interface Props {
  name: string;
  /** Seed for legacy web avatars (the player's name). */
  nameSeed?: string;
  /** Current photo (download URL, or a local preview during setup). */
  photoURL: string | null;
  /** Saved preset avatar; null when none is chosen yet (setup). */
  avatarId: string | null;
  /** Progress text while a photo is uploading / being removed. */
  photoStatus?: string;
  error?: string;
  saving?: boolean;
  onPickPhoto: (file: File) => void;
  onRemovePhoto: () => void;
  onSave: (avatarId: string) => void;
  onCancel: () => void;
}

/**
 * "Choose Avatar" modal, same layout as the apps: purple hero with the current
 * picture and photo actions, avatar grid below. Save is enabled only once a
 * different avatar is picked. Used by the profile page and profile setup.
 */
export default function AvatarEditor({
  name, nameSeed, photoURL, avatarId, photoStatus, error, saving,
  onPickPhoto, onRemovePhoto, onSave, onCancel,
}: Props) {
  const [selected, setSelected] = useState<string | null>(avatarId);
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = !!photoStatus || !!saving;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onPickPhoto(file);
  }

  const heroAvatarId = selected ?? avatarId;
  const canSave = !!selected && selected !== avatarId && !busy;

  return (
    <div className="confirm-backdrop avatar-editor-backdrop" onClick={() => !busy && onCancel()}>
      <div className="avatar-editor" role="dialog" aria-modal="true" aria-labelledby="avatar-editor-title" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-editor-hero">
          <div className="avatar-editor-bar">
            <button type="button" className="avatar-editor-cancel" onClick={onCancel} disabled={busy}>Cancel</button>
            <h3 id="avatar-editor-title">Choose Avatar</h3>
            <span />
          </div>
          {photoURL || heroAvatarId ? (
            <PlayerAvatar photoURL={photoURL} avatarId={heroAvatarId} nameSeed={nameSeed} alt="" className="avatar-editor-picture" />
          ) : (
            <div className="avatar-editor-picture avatar-editor-empty"><PhotoIcon size={36} /></div>
          )}
          <div className="avatar-editor-name">{name}</div>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
          <div className="avatar-editor-pills">
            <button type="button" className="avatar-pill" disabled={busy} onClick={() => inputRef.current?.click()}>
              <PhotoIcon size={18} /> {photoURL ? "Replace" : "Upload photo"}
            </button>
            {photoURL && (
              <button type="button" className="avatar-pill" disabled={busy} onClick={onRemovePhoto}>
                <TrashIcon size={18} /> Remove
              </button>
            )}
          </div>
          {photoStatus && <p className="avatar-editor-status">{photoStatus}</p>}
        </div>

        <div className="avatar-editor-panel">
          {error && <div className="alert error" style={{ marginBottom: 16 }}>{error}</div>}
          <div className="avatar-editor-heading">
            <span>Avatars</span>
            {photoURL && <span className="avatar-editor-note">Photo overrides avatar</span>}
          </div>
          <div className="avatar-editor-grid">
            {APP_AVATARS.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`avatar-editor-option${selected === a.id ? " selected" : ""}`}
                aria-label={a.name}
                aria-pressed={selected === a.id}
                onClick={() => setSelected(a.id)}
              >
                <span className="avatar-editor-circle">
                  <img src={avatarImageUrl(a.id)} alt="" loading="lazy" />
                  {selected === a.id && <span className="avatar-editor-badge" aria-hidden="true">&#x2713;</span>}
                </span>
                <span className="avatar-editor-label">{a.name}</span>
              </button>
            ))}
          </div>
          <div className="avatar-editor-footer">
            <button type="button" className="btn-primary" disabled={!canSave} onClick={() => selected && onSave(selected)}>
              {saving ? "Saving..." : "Save Avatar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
