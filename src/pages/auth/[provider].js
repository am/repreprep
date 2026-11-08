import { auth, testSignIn, safeNext, redirectWith, providers } from "../../lib/auth.js";
export const prerender = false;

/* /auth/google?next=…: sends the browser to Google, then back to `next` once signed in.
   /auth/dev?next=…: the local test account (localhost only). */
export async function GET({ params, url, request }) {
  const a = auth(url);
  if (!a || ["email", "password"].includes(params.provider) || !providers(url).some((p) => p.id === params.provider))
    return new Response("Not found", { status: 404 });
  const next = safeNext(url.searchParams.get("next"));
  /* Better Auth checks the Origin of every sign-in request; this one starts on our own page */
  const headers = new Headers(request.headers);
  headers.set("Origin", url.origin);
  if (params.provider === "dev" && testSignIn(url)) {
    const res = await a.api.devSignIn({ headers, asResponse: true });
    return redirectWith(res, next);
  }
  const res = await a.api.signInSocial({
    body: { provider: params.provider, callbackURL: next, errorCallbackURL: "/account?error=signin" },
    headers,
    asResponse: true,
  });
  const { url: to } = await res.clone().json();
  return redirectWith(res, to);
}
