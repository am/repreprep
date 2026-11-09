/* Headers that make browsers stricter with the site, on every answer. Pages that are built ahead of time get
   the same list from public/_headers (a test keeps the two in step); answers from the server get them in
   src/middleware.js.
   - HSTS: always use https for a year, on repreprep.studio and its subdomains.
   - No framing: other sites can't show the site inside theirs (to trick a click on "Delete my account").
   - nosniff: files are only read as the type the site says they are.
   - Referrer: other sites see only "repreprep.studio", never the page or its query.
   - Permissions: camera, microphone and location are off; the site never asks for them. */
export const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};
