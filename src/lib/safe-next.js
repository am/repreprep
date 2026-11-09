/* where to land after signing in: only paths on this site.
   Browsers drop tabs and line breaks from addresses, so "/\t/evil.example" would become "//evil.example",
   another site. Paths with control characters or spaces are refused for that reason, as are "//" and "\". */
export const safeNext = (p) =>
  typeof p === "string" && /^\/(?![/\\])[^\\\s\u0000-\u001f\u007f]*$/.test(p) ? p : "/account";
