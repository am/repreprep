import { env } from "cloudflare:workers";

/* D1 database (binding DB in wrangler.jsonc). Its tables come from the SQL files in migrations/, applied with
   `wrangler d1 migrations apply` before every deploy (and by the tests, on their local database). */
export async function db() {
  const d = env.DB;
  if (!d) throw new Error("The DB binding is missing. Check d1_databases in wrangler.jsonc.");
  return d;
}
