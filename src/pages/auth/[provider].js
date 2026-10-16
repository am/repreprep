import { startSignIn, testSignIn, userFor, createSession, safeNext } from "../../lib/auth.js";
export const prerender = false;

/* /auth/google, /auth/github: send the browser to the provider. /auth/dev: local test account. */
export async function GET({ params, url, cookies, redirect }) {
  if (params.provider === "dev") {
    if (!testSignIn(url)) return new Response("Not found", { status: 404 });
    const id = await userFor("dev", { provider_user_id: "local", name: "Local tester", email: null });
    await createSession(id, url, cookies);
    return redirect(safeNext(url.searchParams.get("next")), 302);
  }
  const to = startSignIn(params.provider, url, cookies);
  if (!to) return new Response("This sign-in option is not set up.", { status: 404 });
  return redirect(to.toString(), 302);
}
