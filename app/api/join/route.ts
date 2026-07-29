import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { classes, users } from "../../../db/schema";
import { getAuthenticatedMember } from "../../server-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code")?.trim().toUpperCase();

  if (!code) {
    return new Response(JSON.stringify({ error: "Missing invite code" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const db = getDb();
  const [targetClass] = await db.select().from(classes).where(eq(classes.inviteCode, code));

  if (!targetClass) {
    return new Response(JSON.stringify({ error: "Invalid invite code" }), { status: 404, headers: { "Content-Type": "application/json" } });
  }

  // Get teacher name
  const [teacher] = await db.select().from(users).where(eq(users.email, targetClass.teacherEmail));

  return new Response(
    JSON.stringify({
      valid: true,
      classId: targetClass.id,
      className: targetClass.className,
      teacherName: teacher?.displayName || targetClass.teacherEmail,
      inviteCode: targetClass.inviteCode,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedMember();
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized. Please sign in first." }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const body = (await request.json()) as { inviteCode?: string };
    const code = body.inviteCode?.trim().toUpperCase();

    if (!code) {
      return new Response(JSON.stringify({ error: "Invite code is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const db = getDb();
    const [targetClass] = await db.select().from(classes).where(eq(classes.inviteCode, code));

    if (!targetClass) {
      return new Response(JSON.stringify({ error: "Invalid invite code" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    // Link the membership without silently demoting an existing teacher.
    await db
      .update(users)
      .set({ classId: targetClass.id })
      .where(eq(users.email, auth.identity.email));

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully joined ${targetClass.className}!`,
        className: targetClass.className,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
