import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { users } from "../db/schema";
import { isTeacherRole, normalizeAccountEmail } from "./account-policy";
import { getAppUser } from "./google-auth";

export type MemberRole = "student" | "teacher" | "org_admin";
export { isTeacherRole };

export async function getAuthenticatedMember() {
  const identity = await getAppUser();
  if (!identity) return null;

  const email = normalizeAccountEmail(identity.email);
  const db = getDb();
  const [member] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!member) return null;

  return {
    identity: { ...identity, email },
    member,
  };
}
