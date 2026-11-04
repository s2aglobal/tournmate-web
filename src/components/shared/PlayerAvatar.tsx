import { useEffect, useState, type CSSProperties } from "react";
import { avatarImageUrl } from "../../services/avatars";

interface Props {
  photoURL?: string | null;
  avatarId?: string | null;
  nameSeed?: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
}

type PhotoState = "loading" | "loaded" | "failed";

/**
 * A player's photo when set; their preset avatar while it loads, if it fails,
 * or when there's none. Size / circle crop come from `className` / `style`.
 */
export default function PlayerAvatar({ photoURL, avatarId, nameSeed, alt = "", className, style }: Props) {
  const [state, setState] = useState<PhotoState>("loading");

  useEffect(() => {
    if (!photoURL) return;
    // Preload so the preset shows until the photo is ready (instant when cached).
    const img = new Image();
    let active = true;
    img.onload = () => active && setState("loaded");
    img.onerror = () => active && setState("failed");
    img.src = photoURL;
    setState(img.complete && img.naturalWidth > 0 ? "loaded" : "loading");
    return () => { active = false; };
  }, [photoURL]);

  const src = photoURL && state === "loaded" ? photoURL : avatarImageUrl(avatarId, nameSeed);
  return <img src={src} alt={alt} className={className} style={{ objectFit: "cover", ...style }} />;
}
