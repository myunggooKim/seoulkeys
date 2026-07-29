import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { classes, classSummary, learningProgress, users } from "../../../../db/schema";
import { getAuthenticatedMember, isTeacherRole } from "../../../server-auth";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SK-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET() {
  const auth = await getAuthenticatedMember();
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  if (!isTeacherRole(auth.member.role)) {
    return Response.json({ error: "Teacher access required" }, { status: 403 });
  }

  const db = getDb();
  // Fetch classes created by this teacher
  const teacherClasses = await db.select().from(classes).where(eq(classes.teacherEmail, auth.identity.email));

  const result = await Promise.all(
    teacherClasses.map(async (c) => {
      // Fetch students in this class
      const studentsInClass = await db.select().from(users).where(eq(users.classId, c.id));

      // Fetch learning progress for each student
      const studentReports = await Promise.all(
        studentsInClass.map(async (student) => {
          const [progress] = await db.select().from(learningProgress).where(eq(learningProgress.userEmail, student.email));
          return {
            email: student.email,
            displayName: student.displayName,
            studentId: student.studentId || "—",
            streakDays: student.streakDays,
            totalXp: student.totalXp,
            completedSentences: progress?.completedSentences ?? 0,
            accuracy: progress?.accuracy ?? 100,
            typingSeconds: progress?.typingSeconds ?? 0,
            updatedAt: progress?.updatedAt || student.createdAt,
          };
        })
      );

      const [summary] = await db.select().from(classSummary).where(eq(classSummary.classId, c.id));

      return {
        id: c.id,
        className: c.className,
        inviteCode: c.inviteCode,
        inviteUrl: `https://seoulkeys.com/join?code=${c.inviteCode}`,
        createdAt: c.createdAt,
        totalStudents: studentsInClass.length,
        avgAccuracy: summary?.avgAccuracy ?? (studentsInClass.length ? Math.round(studentReports.reduce((acc, s) => acc + s.accuracy, 0) / studentsInClass.length) : 100),
        students: studentReports,
      };
    })
  );

  return new Response(JSON.stringify({ classes: result }), { status: 200, headers: { "Content-Type": "application/json" } });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedMember();
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  if (!isTeacherRole(auth.member.role)) {
    return Response.json({ error: "Teacher access required" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { className?: string };
    const className = body.className?.trim().slice(0, 80) || "3학년 1반";

    const db = getDb();
    const classId = `class_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const inviteCode = generateInviteCode();

    // 1. Create class
    await db.insert(classes).values({
      id: classId,
      teacherEmail: auth.identity.email,
      className,
      inviteCode,
    });

    // 2. Initialize class summary
    await db.insert(classSummary).values({
      classId,
      totalStudents: 0,
      avgCpm: 0,
      avgAccuracy: 100,
      totalCompletedTasks: 0,
    });

    return new Response(
      JSON.stringify({
        success: true,
        class: {
          id: classId,
          className,
          inviteCode,
          inviteUrl: `https://seoulkeys.com/join?code=${inviteCode}`,
        },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function DELETE(request: Request) {
  const auth = await getAuthenticatedMember();
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  if (!isTeacherRole(auth.member.role)) {
    return Response.json({ error: "Teacher access required" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    if (!classId) {
      return new Response(JSON.stringify({ error: "Missing classId" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const db = getDb();
    // Check ownership
    const [targetClass] = await db.select().from(classes).where(and(
      eq(classes.id, classId),
      eq(classes.teacherEmail, auth.identity.email),
    ));
    if (!targetClass) {
      return new Response(JSON.stringify({ error: "Class not found or forbidden" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    // 1. Unlink students
    await db.update(users).set({ classId: null }).where(eq(users.classId, classId));

    // 2. Delete summary and class
    await db.delete(classSummary).where(eq(classSummary.classId, classId));
    await db.delete(classes).where(eq(classes.id, classId));

    return new Response(JSON.stringify({ success: true, deletedId: classId }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
