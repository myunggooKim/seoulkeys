import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

// 1. 기관/학교 테이블 (Organizations)
export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  planType: text("plan_type").notNull().default("school_free"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 2. 클래스(반) 테이블 (Classes)
export const classes = sqliteTable("classes", {
  id: text("id").primaryKey(),
  orgId: text("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  teacherEmail: text("teacher_email").notNull(),
  className: text("class_name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 3. 유저 테이블 (Users - B2B 확장)
export const users = sqliteTable("users", {
  email: text("email").primaryKey(),
  googleSubject: text("google_subject"),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("student"), // 'student' | 'teacher' | 'org_admin'
  classId: text("class_id").references(() => classes.id, { onDelete: "set null" }),
  studentId: text("student_id").default(""), // 이메일 없는 학교 컴퓨터실 계정용
  // ISO-3166 alpha-2 from Cloudflare's edge at sign-up. "" when unknown (local
  // dev, or a request that never passed through the edge).
  country: text("country").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastLoginAt: text("last_login_at"),
  loginCount: integer("login_count").notNull().default(1),
  lastVisitDate: text("last_visit_date").notNull(),
  streakDays: integer("streak_days").notNull().default(1),
  longestStreak: integer("longest_streak").notNull().default(1),
  totalVisits: integer("total_visits").notNull().default(1),
  totalXp: integer("total_xp").notNull().default(0),
  coins: integer("coins").notNull().default(0),
});

// 4. 과제 테이블 (Assignments)
export const assignments = sqliteTable("assignments", {
  id: text("id").primaryKey(),
  classId: text("class_id").notNull().references(() => classes.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull().default("일반"),
  content: text("content").notNull().default(""),
  targetLevel: integer("target_level").notNull().default(1),
  targetAccuracy: integer("target_accuracy").notNull().default(90),
  dueDate: text("due_date"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 5. 과제 제출/성적 테이블 (Assignment Submissions)
export const assignmentSubmissions = sqliteTable("assignment_submissions", {
  id: text("id").primaryKey(),
  assignmentId: text("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
  studentEmail: text("student_email").notNull().references(() => users.email, { onDelete: "cascade" }),
  cpm: integer("cpm").notNull().default(0),
  accuracy: integer("accuracy").notNull().default(0),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  submittedAt: text("submitted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("assignment_submissions_assignment_student_unique")
    .on(table.assignmentId, table.studentEmail),
]);

export const dailyVisits = sqliteTable("daily_visits", {
  userEmail: text("user_email").notNull().references(() => users.email, { onDelete: "cascade" }),
  visitDate: text("visit_date").notNull(),
  visitedAt: text("visited_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [primaryKey({ columns: [table.userEmail, table.visitDate] })]);

// 6. 반별 통계 집계 테이블 (Class Summary / Aggregation)
export const classSummary = sqliteTable("class_summary", {
  classId: text("class_id").primaryKey().references(() => classes.id, { onDelete: "cascade" }),
  totalStudents: integer("total_students").notNull().default(0),
  avgCpm: integer("avg_cpm").notNull().default(0),
  avgAccuracy: integer("avg_accuracy").notNull().default(0),
  totalCompletedTasks: integer("total_completed_tasks").notNull().default(0),
  // 0001 originally created this legacy camelCase column name.
  updatedAt: text("updatedAt").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const learningProgress = sqliteTable("learning_progress", {
  userEmail: text("user_email").primaryKey().references(() => users.email, { onDelete: "cascade" }),
  currentLesson: integer("current_lesson").notNull().default(0),
  completedSentences: integer("completed_sentences").notNull().default(0),
  totalSentences: integer("total_sentences").notNull().default(5),
  typingSeconds: integer("typing_seconds").notNull().default(0),
  accuracy: integer("accuracy").notNull().default(100),
  lessonFinished: integer("lesson_finished", { mode: "boolean" }).notNull().default(false),
  awardedXp: integer("awarded_xp").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const rewards = sqliteTable("rewards", {
  userEmail: text("user_email").notNull().references(() => users.email, { onDelete: "cascade" }),
  rewardCode: text("reward_code").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  earnedAt: text("earned_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [primaryKey({ columns: [table.userEmail, table.rewardCode] })]);

export const contentItems = sqliteTable("content_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull(),
  title: text("title").notNull(),
  sourceTitle: text("source_title").notNull().default(""),
  creator: text("creator").notNull().default(""),
  koreanText: text("korean_text").notNull(),
  translation: text("translation").notNull().default(""),
  audioFemaleUrl: text("audio_female_url").notNull().default(""),
  audioMaleUrl: text("audio_male_url").notNull().default(""),
  rightsStatus: text("rights_status").notNull().default("permission_pending"),
  rightsNote: text("rights_note").notNull().default(""),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminAuditLog = sqliteTable("admin_audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  adminEmail: text("admin_email").notNull(),
  action: text("action").notNull(),
  contentId: integer("content_id"),
  detail: text("detail").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
