-- The site no longer keeps IP addresses or browser names (see src/lib/auth.js): clear the ones sessions already
-- have, and the rate-limit counters, which were keyed by IP address (they only last seconds to minutes anyway).
UPDATE "session" SET "ipAddress" = NULL, "userAgent" = NULL;
DELETE FROM "rateLimit";
