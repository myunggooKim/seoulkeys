import { cookies, headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { getLearningProfile } from "../../../../db/learning";
import { dailyVisits, learningProgress, rewards, users } from "../../../../db/schema";
import {
  classifySignIn,
  googleSubjectHasDifferentOwner,
  normalizeAccountEmail,
  normalizeSignupRole,
  resolveMemberRole,
  type SignupRole,
} from "../../../account-policy";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionValue,
  sessionCookieOptions,
  verifyGoogleIdToken,
} from "../../../google-auth";

export const dynamic = "force-dynamic";

/** Exchange a Google ID token for our signed session cookie. */
export async function POST(request: Request) {
  let credential = "";
  let requestedRole: SignupRole | null = null;
  try {
    const payload = await request.json() as { credential?: string; role?: unknown };
    credential = typeof payload.credential === "string" ? payload.credential : "";
    requestedRole = normalizeSignupRole(payload.role);
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!credential) return Response.json({ error: "Missing credential" }, { status: 400 });

  const user = await verifyGoogleIdToken(credential);
  if (!user) return Response.json({ error: "Sign-in verification failed" }, { status: 401 });

  const sessionValue = await createSessionValue(user);
  if (!sessionValue) {
    // Fail closed: no signing secret means we cannot issue a trustworthy session.
    return Response.json({ error: "Sign-in is not configured on this server" }, { status: 503 });
  }

  // Country comes from Cloudflare's edge rather than the client, so the browser
  // cannot spoof it. It is only ever read back in aggregate.
  const requestHeaders = await headers();
  const country = (requestHeaders.get("cf-ipcountry") ?? "").toUpperCase().slice(0, 2);
  const validCountry = /^[A-Z]{2}$/.test(country) ? country : "";

  const email = normalizeAccountEmail(user.email);
  const now = new Date();
  const nowIso = now.toISOString();
  const today = nowIso.slice(0, 10);
  let role: "student" | "teacher" = "student";
  let isNewMember = false;
  let visitRewardGranted = false;
  try {
    const db = getDb();
    const [existing] = await db
      .select({
        role: users.role,
        country: users.country,
        googleSubject: users.googleSubject,
        lastVisitDate: users.lastVisitDate,
        loginCount: users.loginCount,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existing) {
      isNewMember = true;
      role = resolveMemberRole(null, requestedRole);
      await db.insert(users).values({
        email,
        googleSubject: user.googleSubject,
        displayName: user.displayName,
        role,
        country: validCountry,
        lastLoginAt: nowIso,
        loginCount: 1,
        lastVisitDate: today,
        coins: 25,
      }).onConflictDoNothing();

      await db.insert(dailyVisits)
        .values({ userEmail: email, visitDate: today, visitedAt: nowIso })
        .onConflictDoNothing();
      await db.insert(learningProgress)
        .values({ userEmail: email })
        .onConflictDoNothing();
      await db.insert(rewards).values({
        userEmail: email,
        rewardCode: "welcome",
        title: "Seoul Keys에 오신 것을 환영해요",
        description: "첫 가입 완료 · 25 비트",
      }).onConflictDoNothing();
    } else {
      role = resolveMemberRole(existing.role, requestedRole);
      if (
        existing.googleSubject
        && user.googleSubject
        && existing.googleSubject !== user.googleSubject
      ) {
        const [subjectOwner] = await db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.googleSubject, user.googleSubject))
          .limit(1);

        if (googleSubjectHasDifferentOwner(subjectOwner?.email, email)) {
          return Response.json({ error: "This Google account is already linked to another member" }, { status: 409 });
        }
      }

      await db.update(users).set({
        displayName: user.displayName,
        // The ID token has a Google-verified email. Rebind stale legacy
        // subjects for that same email while the uniqueness check above keeps
        // one Google identity from taking over a different member.
        googleSubject: user.googleSubject,
        country: existing.country || validCountry,
        lastLoginAt: nowIso,
        loginCount: existing.loginCount + 1,
      }).where(eq(users.email, email));

      visitRewardGranted = existing.lastVisitDate !== today;
      await getLearningProfile(email, user.displayName, true);
    }
  } catch (error) {
    console.error("Unable to persist Google sign-in", error);
    return Response.json({ error: "Unable to save the account. Please try again." }, { status: 503 });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionValue, sessionCookieOptions(SESSION_MAX_AGE));

  return Response.json(
    {
      user: { email, displayName: user.displayName, picture: user.picture },
      role,
      isNewMember,
      isNewUser: isNewMember,
      isReturningUser: !isNewMember,
      signInKind: classifySignIn(!isNewMember),
      visitRewardGranted,
      // Teachers get their own dashboard; it is the future paid tier.
      redirectTo: role === "teacher" ? "/teacher" : "/my",
    },
    { headers: { "cache-control": "no-store" } },
  );
}
