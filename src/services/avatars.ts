/**
 * Player avatars, the same set as the iOS/Android apps (`PlayerAvatar`):
 * DiceBear "adventurer" characters (CC BY 4.0, art by Lisa Wischofsky),
 * stored in `players.avatarId` by id ("shuttlecock", "racket", …).
 *
 * Accounts created on the web before this used a DiceBear style name as
 * the id ("adventurer", "bottts", …); those still render as before.
 */

export interface AppAvatar {
  id: string;
  name: string;
}

/** In the apps' picker order. */
export const APP_AVATARS: AppAvatar[] = [
  ["shuttlecock", "Aiden"], ["racket", "Riley"], ["champion", "Valentina"], ["flame", "Zara"],
  ["bolt", "Leo"], ["ace", "Mika"], ["smash", "Jaden"], ["rally", "Nora"],
  ["drop", "Felix"], ["serve", "Luna"], ["leaf", "Eliza"], ["star", "Mason"],
  ["heart", "Sadie"], ["moon", "Kai"], ["sun", "Harper"], ["phoenix", "Roman"],
  ["eagle", "Skyler"], ["tiger", "Dante"], ["panda", "Chloe"], ["ninja", "Raven"],
  ["runner", "Olive"], ["wave", "Miles"], ["crown", "Aria"], ["shield", "Brian"],
].map(([id, name]) => ({ id, name }));

export const DEFAULT_AVATAR_ID = APP_AVATARS[0].id;

const LEGACY_WEB_STYLES = new Set([
  "adventurer", "avataaars", "bottts", "fun-emoji", "lorelei",
  "micah", "miniavs", "notionists", "open-peeps", "personas",
]);

/**
 * Image URL for a player's avatar. `nameSeed` is only used for avatars
 * saved by the old web picker (style + the player's name).
 */
export function avatarImageUrl(avatarId: string | undefined | null, nameSeed = "player"): string {
  const app = APP_AVATARS.find((a) => a.id === avatarId);
  if (app) return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(app.name)}`;
  if (avatarId && LEGACY_WEB_STYLES.has(avatarId)) {
    return `https://api.dicebear.com/9.x/${avatarId}/svg?seed=${encodeURIComponent(nameSeed)}`;
  }
  // "defaultAvatar" or unknown: the apps' plain default.
  return "https://api.dicebear.com/9.x/adventurer/svg?seed=Default";
}
