import { useEffect } from "react";

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Centered modal confirmation over a dimmed backdrop. Escape cancels. */
export default function ConfirmDialog({ title, message, confirmLabel, cancelLabel = "Cancel", busy, onConfirm, onCancel }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <div className="confirm-backdrop" onClick={() => !busy && onCancel()}>
      <div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}>
        <h3 id="confirm-title">{title}</h3>
        <p>{message}</p>
        <div className="wizard-buttons">
          <button type="button" className="btn-outline" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button type="button" className="btn-primary" onClick={onConfirm} disabled={busy} autoFocus>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
