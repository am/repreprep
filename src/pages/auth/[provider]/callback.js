import { finishSignIn, userFor, createSession, safeNext } from "../../../lib/auth.js";
export const prerender = false;

/* the provider sends the browser back here with a one-time code */
export async function GET({ params, url, cookies, redirect }) {
  try {
    const profile = await finishSignIn(params.provider, url, cookies);
    const id = await userFor(params.provider, profile);
    await createSession(id, url, cookies);
    const next = safeNext(cookies.get("rrr_next")?.value);
    for (const c of ["rrr_oauth_state", "rrr_oauth_verifier", "rrr_next"]) cookies.delete(c, { path: "/" });
    return redirect(next, 302);
  } catch (e) {
    console.error("sign-in failed", params.provider, e);
    return redirect("/account?error=signin", 302);
  }
}
