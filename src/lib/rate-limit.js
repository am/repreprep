import { db } from "./db.js";

/* Better Auth's counters for its request limits (too many login tries from one visitor answer 429). Better Auth
   keys each counter by the visitor's IP address and the path; this store keeps a keyed hash of that instead, so
   the database never holds an IP address, and drops counters an hour after their last request.
   It replaces Better Auth's own "database" storage and uses the same rateLimit table (migrations/). */
const HOUR = 3600 * 1000;

const keys = new Map();
async function hmacKey(secret) {
  let k = keys.get(secret);
  if (!k) {
    k = crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
      "sign",
    ]);
    keys.set(secret, k);
  }
  return k;
}

/* the same input always gives the same hash, but without the site's secret it can't be matched to an address */
export async function hashKey(secret, key) {
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), new TextEncoder().encode(`rate-limit|${key}`));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hashedRateLimitStorage(secret) {
  return {
    /* one atomic step: start a new window, or count this request in the current one */
    async consume(key, { window, max }) {
      const d = await db();
      const now = Date.now();
      const windowMs = window * 1000;
      const [, counted] = await d.batch([
        d.prepare('DELETE FROM "rateLimit" WHERE "lastRequest" < ?').bind(now - HOUR),
        d
          .prepare(
            `INSERT INTO "rateLimit" ("id", "key", "count", "lastRequest") VALUES (?1, ?2, 1, ?3)
             ON CONFLICT ("key") DO UPDATE SET
               "count" = CASE WHEN ?3 - "lastRequest" >= ?4 THEN 1 ELSE "count" + 1 END,
               "lastRequest" = CASE WHEN ?3 - "lastRequest" >= ?4 THEN ?3 ELSE "lastRequest" END
             RETURNING "count", "lastRequest"`
          )
          .bind(crypto.randomUUID(), await hashKey(secret, key), now, windowMs),
      ]);
      const { count, lastRequest } = counted.results[0];
      if (count <= max) return { allowed: true, retryAfter: null };
      return { allowed: false, retryAfter: Math.max(1, Math.ceil((Number(lastRequest) + windowMs - now) / 1000)) };
    },
  };
}
