/* Types Astro can't work out for itself. Kept global: no imports at the top of this file. */
declare namespace App {
  interface Locals {
    /* who is signed in, set by src/middleware.js for server routes and actions; null when nobody is */
    user: { id: string; name: string; email: string } | null;
  }
}
