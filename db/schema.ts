import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  email: text("email").primaryKey(),
  displayName: text("display_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastVisitDate: text("last_visit_date").notNull(),
  streakDays: integer("streak_days").notNull().default(1),
  longestStreak: integer("longest_streak").notNull().default(1),
  totalVisits: integer("total_visits").notNull().default(1),
  totalXp: integer("total_xp").notNull().default(0),
  coins: integer("coins").notNull().default(0),
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
