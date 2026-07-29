import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../../db";
import { assignments, assignmentSubmissions, classes } from "../../../../db/schema";
import { getAuthenticatedMember, isTeacherRole } from "../../../server-auth";

export async function GET() {
  const auth = await getAuthenticatedMember();
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isTeacherRole(auth.member.role)) {
    return Response.json({ error: "Teacher access required" }, { status: 403 });
  }

  const db = getDb();
  const teacherClasses = await db.select().from(classes)
    .where(eq(classes.teacherEmail, auth.identity.email));
  if (teacherClasses.length === 0) {
    return Response.json({ assignments: [] });
  }

  const classIds = teacherClasses.map((c) => c.id);
  const teacherAssignments = await db
    .select()
    .from(assignments)
    .where(inArray(assignments.classId, classIds))
    .orderBy(desc(assignments.createdAt));

  const assignmentIds = teacherAssignments.map((assignment) => assignment.id);
  const submissions = assignmentIds.length
    ? await db.select().from(assignmentSubmissions)
      .where(inArray(assignmentSubmissions.assignmentId, assignmentIds))
    : [];

  const assignmentsWithSubmissions = teacherAssignments.map((asgn) => {
    const asgnSubmissions = submissions.filter((s) => s.assignmentId === asgn.id);
    return {
      ...asgn,
      totalSubmissions: asgnSubmissions.length,
      submissions: asgnSubmissions,
    };
  });

  return Response.json({ assignments: assignmentsWithSubmissions });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedMember();
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isTeacherRole(auth.member.role)) {
    return Response.json({ error: "Teacher access required" }, { status: 403 });
  }

  const body = (await request.json()) as {
    classId: string;
    title: string;
    category?: string;
    content: string;
  };

  const classId = body.classId?.trim();
  const title = body.title?.trim().slice(0, 120);
  const category = body.category?.trim().slice(0, 40) || "일반";
  const content = body.content?.trim().slice(0, 5000);

  if (!classId || !title || !content) {
    return Response.json({ error: "클래스, 제목, 내용은 필수 입력 항목입니다." }, { status: 400 });
  }

  const db = getDb();
  const [ownedClass] = await db.select({ id: classes.id }).from(classes).where(and(
    eq(classes.id, classId),
    eq(classes.teacherEmail, auth.identity.email),
  )).limit(1);
  if (!ownedClass) {
    return Response.json({ error: "Class not found or forbidden" }, { status: 404 });
  }

  const id = `asgn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  await db.insert(assignments).values({
    id,
    classId,
    title,
    category,
    content,
    createdAt: new Date().toISOString(),
  });

  return Response.json({ success: true, assignmentId: id });
}
