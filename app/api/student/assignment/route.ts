import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { assignments, users, assignmentSubmissions } from "../../../../db/schema";
import { getAuthenticatedMember } from "../../../server-auth";

function boundedInteger(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export async function GET() {
  const auth = await getAuthenticatedMember();
  if (!auth) {
    return Response.json({ assignments: [] });
  }

  const db = getDb();
  const [studentRecord] = await db.select().from(users)
    .where(eq(users.email, auth.identity.email));
  if (!studentRecord || !studentRecord.classId) {
    return Response.json({ assignments: [] });
  }

  const classAssignments = await db
    .select()
    .from(assignments)
    .where(eq(assignments.classId, studentRecord.classId));

  const submissions = await db
    .select()
    .from(assignmentSubmissions)
    .where(eq(assignmentSubmissions.studentEmail, auth.identity.email));

  const submittedIds = new Set(submissions.map((s) => s.assignmentId));

  const result = classAssignments.map((a) => ({
    ...a,
    isCompleted: submittedIds.has(a.id),
  }));

  return Response.json({ assignments: result });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedMember();
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    assignmentId: string;
    accuracy: number;
    cpm: number;
  };

  const assignmentId = body.assignmentId?.trim();
  if (!assignmentId) {
    return Response.json({ error: "과제 ID가 누락되었습니다." }, { status: 400 });
  }

  const db = getDb();
  if (!auth.member.classId) {
    return Response.json({ error: "학급에 가입한 학생만 과제를 제출할 수 있습니다." }, { status: 403 });
  }

  const [classAssignment] = await db.select({ id: assignments.id }).from(assignments).where(and(
    eq(assignments.id, assignmentId),
    eq(assignments.classId, auth.member.classId),
  )).limit(1);
  if (!classAssignment) {
    return Response.json({ error: "과제를 찾을 수 없거나 제출 권한이 없습니다." }, { status: 404 });
  }

  const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const accuracy = boundedInteger(body.accuracy, 0, 100, 0);
  const cpm = boundedInteger(body.cpm, 0, 1000, 0);
  const submittedAt = new Date().toISOString();

  await db.insert(assignmentSubmissions).values({
    id,
    assignmentId,
    studentEmail: auth.identity.email,
    accuracy,
    cpm,
    completed: true,
    submittedAt,
  }).onConflictDoUpdate({
    target: [assignmentSubmissions.assignmentId, assignmentSubmissions.studentEmail],
    set: { accuracy, cpm, completed: true, submittedAt },
  });

  return Response.json({ success: true });
}
