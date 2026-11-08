-- Sign-in moves to Better Auth. Its tables (as `npx @better-auth/cli generate` writes them for SQLite):
-- user, session, account (one row per sign-in method), verification (one-time tokens) and rateLimit.
-- The old users/accounts/sessions tables go: sign-in was never switched on, so they hold no one.
-- progress and messages are rebuilt to point at "user"; contact messages are kept, unlinked from any account.
PRAGMA defer_foreign_keys = true;

CREATE TABLE "user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" integer not null, "image" text, "createdAt" date not null, "updatedAt" date not null);
CREATE TABLE "session" ("id" text not null primary key, "expiresAt" date not null, "token" text not null unique, "createdAt" date not null, "updatedAt" date not null, "ipAddress" text, "userAgent" text, "userId" text not null references "user" ("id") on delete cascade);
CREATE TABLE "account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" date, "refreshTokenExpiresAt" date, "scope" text, "password" text, "createdAt" date not null, "updatedAt" date not null);
CREATE TABLE "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" date not null, "createdAt" date not null, "updatedAt" date not null);
CREATE TABLE "rateLimit" ("id" text not null primary key, "key" text not null unique, "count" integer not null, "lastRequest" bigint not null);
CREATE INDEX "session_userId_idx" ON "session" ("userId");
CREATE INDEX "account_userId_idx" ON "account" ("userId");
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");

CREATE TABLE progress_new (user_id TEXT PRIMARY KEY REFERENCES "user"("id") ON DELETE CASCADE, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE messages_new (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at INTEGER NOT NULL, user_id TEXT REFERENCES "user"("id") ON DELETE SET NULL, reply_to TEXT, body TEXT NOT NULL);
INSERT INTO messages_new (id, created_at, user_id, reply_to, body) SELECT id, created_at, NULL, reply_to, body FROM messages;

DROP TABLE progress;
DROP TABLE messages;
DROP TABLE sessions;
DROP TABLE accounts;
DROP TABLE users;
ALTER TABLE progress_new RENAME TO progress;
ALTER TABLE messages_new RENAME TO messages;
