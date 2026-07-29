import { getAppUser } from "../../google-auth";
import { getLearningProfile, saveLearningProgress, type ProgressUpdate } from "../../../db/learning";
import { practiceCurriculum } from "../../practice-curriculum";

export const dynamic = "force-dynamic";

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : fallback;
}

export async function GET() {
  const user = await getAppUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });

  try {
    const profile = await getLearningProfile(user.email, user.displayName, true);
    return Response.json(profile);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load progress" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAppUser();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });

  try {
    const payload = await request.json() as Partial<ProgressUpdate>;
    const update: ProgressUpdate = {
      currentLesson: safeNumber(payload.currentLesson),
      completedSentences: safeNumber(payload.completedSentences),
      // The browser cannot choose the XP denominator. The deployed curriculum
      // is the server-side source of truth.
      totalSentences: practiceCurriculum.length,
      typingSeconds: safeNumber(payload.typingSeconds),
      accuracy: safeNumber(payload.accuracy, 100),
      lessonFinished: Boolean(payload.lessonFinished),
    };
    const profile = await saveLearningProgress(user.email, user.displayName, update);
    return Response.json(profile);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save progress" }, { status: 500 });
  }
}
