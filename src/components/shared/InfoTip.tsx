import { useEffect, useRef, useState } from "react";

/**
 * Circled "i" button with a dark tooltip. Shows on hover / keyboard focus and
 * toggles on click or tap; Escape or a click elsewhere hides it.
 */
export default function InfoTip({ id, text }: { id: string; text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className={`info-tip${open ? " open" : ""}`}>
      <button type="button" className="info-tip-btn" aria-label="More info" aria-describedby={id} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        i
      </button>
      <span id={id} role="tooltip" className="info-tip-bubble">{text}</span>
    </span>
  );
}
