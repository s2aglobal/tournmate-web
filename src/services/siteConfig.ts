import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Public app config the marketing site mirrors from Firestore:
 * - `config/sports`: which sports are Live vs Soon, and their categories
 *   (same doc the iOS/Android apps read; seeded by tournmate-server).
 * - `config/app`: store links (`iosStoreURL`, `androidStoreURL`).
 *
 * Both docs are public-read. The bundled defaults below render first and are
 * kept if Firestore is unreachable, so the page never shows an empty state.
 */

export interface SportInfo {
  id: string;
  name: string;
}

export interface SportCategory {
  id: string;
  title: string;
  sports: string[];
}

export interface SiteConfig {
  live: string[];
  categories: SportCategory[];
  iosStoreURL: string;
  androidStoreURL: string | null;
}

export const SPORT_NAMES: Record<string, string> = {
  pickleball: "Pickleball",
  badminton: "Badminton",
  tennis: "Tennis",
  padel: "Padel",
  table_tennis: "Table Tennis",
  squash: "Squash",
  volleyball: "Volleyball",
  beach_volleyball: "Beach Volleyball",
  basketball: "Basketball",
  soccer: "Soccer",
  cricket: "Cricket",
  roundnet: "Roundnet",
  golf: "Golf",
  disc_golf: "Disc Golf",
  bowling: "Bowling",
  darts: "Darts",
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  live: ["pickleball", "badminton", "tennis"],
  categories: [
    {
      id: "racket_paddle",
      title: "Racket & Paddle",
      sports: ["pickleball", "badminton", "tennis", "padel", "table_tennis", "squash"],
    },
    {
      id: "court_field",
      title: "Court & Field",
      sports: ["volleyball", "beach_volleyball", "basketball", "soccer", "cricket", "roundnet"],
    },
    {
      id: "target_more",
      title: "Target & More",
      sports: ["golf", "disc_golf", "bowling", "darts"],
    },
  ],
  iosStoreURL: "https://apps.apple.com/us/app/tournmate/id6765781689",
  androidStoreURL: null,
};

export function sportName(id: string): string {
  return SPORT_NAMES[id] ?? id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Icon from the shared sport icon pack in /public/sport-icons. */
export function sportIcon(id: string, size: 96 | 192 | 512 = 192): string {
  return `/sport-icons/png/${id.replace(/_/g, "-")}-${size}.png`;
}

function nonBlank(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function parseSports(data: Record<string, unknown> | undefined): Pick<SiteConfig, "live" | "categories"> | null {
  if (!data || data.schemaVersion !== 1) return null;
  const live = Array.isArray(data.live) ? data.live.filter((s): s is string => typeof s === "string") : [];
  const categories = Array.isArray(data.categories)
    ? data.categories.flatMap((c) => {
        if (!c || typeof c !== "object") return [];
        const { id, title, sports } = c as Record<string, unknown>;
        if (typeof id !== "string" || typeof title !== "string" || !Array.isArray(sports)) return [];
        // Only sports we have a name and icon for; unknown future ids are skipped.
        const known = sports.filter((s): s is string => typeof s === "string" && s in SPORT_NAMES);
        return known.length ? [{ id, title, sports: known }] : [];
      })
    : [];
  if (live.length === 0 || categories.length === 0) return null;
  return { live, categories };
}

export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [sports, app] = await Promise.allSettled([
        getDoc(doc(db, "config", "sports")),
        getDoc(doc(db, "config", "app")),
      ]);
      if (cancelled) return;
      setConfig((prev) => {
        const next = { ...prev };
        if (sports.status === "fulfilled") {
          const parsed = parseSports(sports.value.data());
          if (parsed) Object.assign(next, parsed);
        }
        if (app.status === "fulfilled") {
          const data = app.value.data();
          next.iosStoreURL = nonBlank(data?.iosStoreURL) ?? prev.iosStoreURL;
          next.androidStoreURL = nonBlank(data?.androidStoreURL);
        }
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return config;
}
