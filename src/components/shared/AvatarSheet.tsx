import { useEffect, useState } from "react";
import { APP_AVATARS, avatarImageUrl } from "../../services/avatars";

interface Props {
  /** Avatar chosen so far; null when none yet. */
  avatarId: string | null;
  onDone: (avatarId: string) => void;
  onCancel: () => void;
}

/**
 * Profile setup's "Choose Avatar" picker, same as the apps: bottom sheet on
 * phones, centered modal on wider screens. Escape / backdrop cancel.
 */
export default function AvatarSheet({ avatarId, onDone, onCancel }: Props) {
  const [selected, setSelected] = useState<string | null>(avatarId);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="confirm-backdrop avatar-sheet-backdrop" onClick={onCancel}>
      <div className="avatar-sheet" role="dialog" aria-modal="true" aria-labelledby="avatar-sheet-title" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-sheet-handle" aria-hidden="true" />
        <div className="avatar-sheet-bar">
          <button type="button" className="avatar-sheet-cancel" onClick={onCancel}>Cancel</button>
          <h3 id="avatar-sheet-title">Choose Avatar</h3>
          <span />
        </div>
        <div className="avatar-sheet-preview">
          {selected ? (
            <img src={avatarImageUrl(selected)} alt="" />
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          )}
        </div>
        <div className="avatar-sheet-grid avatar-editor-grid">
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
        <button type="button" className="btn-primary avatar-sheet-done" disabled={!selected} onClick={() => selected && onDone(selected)}>
          Done
        </button>
      </div>
    </div>
  );
}
