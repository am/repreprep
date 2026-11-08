-- The tables as the app used to create them itself on first use. On a database that already has them
-- (production), this changes nothing; on a new one (tests, previews) it gives the next migration a starting point.
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS accounts (provider TEXT NOT NULL, provider_user_id TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, PRIMARY KEY (provider, provider_user_id));
CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS progress (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at INTEGER NOT NULL, user_id TEXT REFERENCES users(id) ON DELETE SET NULL, reply_to TEXT, body TEXT NOT NULL);
