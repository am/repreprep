import { esc } from "./html.js";

/* every song the course names: title -> [artist, Spotify track id of the original studio release, each checked on its Spotify page] */
export const SONGS = {
  Kiara: ["Bonobo", "7sqii6BhIDpJChYpU3WjwS"],
  "Black Sands": ["Bonobo", "5LIgIvEcHw74l7X4Jrq6YA"],
  "One Drop": ["Bob Marley & The Wailers", "3Ui4BMHapr00Iul1kB7lHC"],
  Archangel: ["Burial", "2agb1CPPGWXqXnrKn6cx7u"],
  "Ghost Hardware": ["Burial", "4hozy0D7dPkpQ31Xt8BBlN"],
  "Near Dark": ["Burial", "3P2zm9Ca0847WLIYV0UR0r"],
  "Mi Mujer": ["Nicolas Jaar", "4QHKR48C18rwlpSYW6rH7p"],
  "Miss You": ["Trentemøller", "4WTmtPRtIpjzgwBbQsMYyo"],
  "Last Bloom": ["Floating Points", "3fsvD5xpHnp1LwmYHOCWYy"],
  "Silhouettes (I, II & III)": ["Floating Points", "5sCDWRBmmQ4hw9fC3qZSP6"],
  "King Tubby Meets Rockers Uptown": ["Augustus Pablo", "0Rvtj66lo8oTWubx6GA1nR"],
  "La Femme d'Argent": ["Air", "3ZzhV6JIDKWvWR7wiKWD0C"],
  "Playground Love": ["Air", "052z2UsE2wPrHsBJ9tly0g"],
  Looped: ["Kiasmos", "4bwQt4sjaPe0ZU0gI8FPKP"],
  Thrown: ["Kiasmos", "5D4lclzqz9tuUHAZpCrgyV"],
  Swayed: ["Kiasmos", "6h45KL9DmvH1ltlL1eS5Cl"],
  Blurred: ["Kiasmos", "6hwFQPg7zY7qOqJHAfFeMC"],
  "Sudden Throw": ["Ólafur Arnalds", "3wEzlLcMYNAIssspEyBK6z"],
};
export const SPOTIFY_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M6.5 9.2c3.8-1.1 7.9-.8 11.2 1M7.2 12.4c3-.8 6.3-.5 9 .9M7.9 15.4c2.3-.6 4.7-.4 6.8.7" fill="none" stroke="var(--surface)" stroke-width="1.6" stroke-linecap="round"/></svg>';
export function songLink(m, raw) {
  const t = raw.replace(/&#39;/g, "'").replace(/&amp;/g, "&");
  if (!SONGS[t]) return m;
  const [a, id] = SONGS[t];
  return `<a class="song" href="spotify:track:${id}" title="Open ${esc(a)}, ${esc(t)} in the Spotify app">${m}${SPOTIFY_ICON}</a>`;
}
export function linkSongs(html) {
  return html.replace(/&quot;(.{2,80}?)&quot;/g, songLink);
}
