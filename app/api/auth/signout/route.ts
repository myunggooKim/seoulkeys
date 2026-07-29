import { cookies } from "next/headers";
import { SESSION_COOKIE, sessionCookieOptions } from "../../../google-auth";

export const dynamic = "force-dynamic";

/** Clear the session cookie. */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", sessionCookieOptions(0));
  // Without no-store an intermediary — or the service worker — could replay a
  // response captured while the user was still signed in.
  return Response.json({ signedOut: true }, { headers: { "cache-control": "no-store" } });
}
