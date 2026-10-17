import { env } from "cloudflare:workers";

/* D1 database (binding DB in wrangler.jsonc). The tables are created on first use,
   so a fresh database needs no setup step. */
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS accounts (provider TEXT NOT NULL, provider_user_id TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, PRIMARY KEY (provider, provider_user_id))`,
  `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS progress (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, data TEXT NOT NULL, updated_at INTEGER NOT NULL)`,
  /* messages sent from the form on /privacy; user_id is kept only while the account exists */
  `CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at INTEGER NOT NULL, user_id TEXT REFERENCES users(id) ON DELETE SET NULL, reply_to TEXT, body TEXT NOT NULL)`,
];
let ready = null;
export function db() {
  const d = env.DB;
  if (!d) throw new Error("The DB binding is missing. Check d1_databases in wrangler.jsonc.");
  ready ??= d.batch(SCHEMA.map((s) => d.prepare(s))).catch((e) => { ready = null; throw e; });
  return ready.then(() => d);
}
export { env };
