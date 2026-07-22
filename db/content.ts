import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from ".";
import { adminAuditLog, contentItems } from "./schema";

export const contentCategories = ["kpop", "kdrama", "movie", "travel", "lesson"] as const;
export const rightsStatuses = ["original", "licensed", "user_supplied", "permission_pending"] as const;
export type ContentCategory = typeof contentCategories[number];
export type RightsStatus = typeof rightsStatuses[number];

export type ContentInput = {
  category: ContentCategory;
  title: string;
  sourceTitle: string;
  creator: string;
  koreanText: string;
  translation: string;
  audioFemaleUrl: string;
  audioMaleUrl: string;
  rightsStatus: RightsStatus;
  rightsNote: string;
  published: boolean;
};

function canPublish(rightsStatus: RightsStatus) {
  return rightsStatus === "original" || rightsStatus === "licensed";
}

export function normalizeContentInput(payload: Partial<ContentInput>): ContentInput {
  const category = contentCategories.includes(payload.category as ContentCategory)
    ? payload.category as ContentCategory
    : "lesson";
  const rightsStatus = rightsStatuses.includes(payload.rightsStatus as RightsStatus)
    ? payload.rightsStatus as RightsStatus
    : "permission_pending";
  const title = payload.title?.trim() ?? "";
  const koreanText = payload.koreanText?.trim() ?? "";
  if (!title || !koreanText) throw new Error("Title and Korean text are required.");

  return {
    category,
    title,
    sourceTitle: payload.sourceTitle?.trim() ?? "",
    creator: payload.creator?.trim() ?? "",
    koreanText,
    translation: payload.translation?.trim() ?? "",
    audioFemaleUrl: payload.audioFemaleUrl?.trim() ?? "",
    audioMaleUrl: payload.audioMaleUrl?.trim() ?? "",
    rightsStatus,
    rightsNote: payload.rightsNote?.trim() ?? "",
    published: Boolean(payload.published) && canPublish(rightsStatus),
  };
}

export async function listAdminContent() {
  return getDb().select().from(contentItems).orderBy(desc(contentItems.updatedAt), desc(contentItems.id));
}

export async function listPublishedContent(categories?: ContentCategory[]) {
  const db = getDb();
  const publicFields = {
    id: contentItems.id,
    category: contentItems.category,
    title: contentItems.title,
    sourceTitle: contentItems.sourceTitle,
    creator: contentItems.creator,
    koreanText: contentItems.koreanText,
    translation: contentItems.translation,
    audioFemaleUrl: contentItems.audioFemaleUrl,
    audioMaleUrl: contentItems.audioMaleUrl,
    updatedAt: contentItems.updatedAt,
  };
  if (categories?.length) {
    return db.select(publicFields).from(contentItems)
      .where(and(eq(contentItems.published, true), inArray(contentItems.category, categories)))
      .orderBy(desc(contentItems.updatedAt));
  }
  return db.select(publicFields).from(contentItems)
    .where(eq(contentItems.published, true))
    .orderBy(desc(contentItems.updatedAt));
}

export async function createContent(input: ContentInput, adminEmail: string) {
  const db = getDb();
  const [item] = await db.insert(contentItems).values({ ...input, createdBy: adminEmail }).returning();
  await db.insert(adminAuditLog).values({
    adminEmail,
    action: "create",
    contentId: item.id,
    detail: `${input.category}:${input.title}`,
  });
  return item;
}

export async function updateContent(id: number, input: ContentInput, adminEmail: string) {
  const db = getDb();
  const [item] = await db.update(contentItems).set({
    ...input,
    updatedAt: new Date().toISOString(),
  }).where(eq(contentItems.id, id)).returning();
  if (!item) throw new Error("Content item not found.");
  await db.insert(adminAuditLog).values({
    adminEmail,
    action: "update",
    contentId: id,
    detail: `${input.category}:${input.title}:${input.published ? "published" : "draft"}`,
  });
  return item;
}

export async function deleteContent(id: number, adminEmail: string) {
  const db = getDb();
  const [item] = await db.delete(contentItems).where(eq(contentItems.id, id)).returning();
  if (!item) throw new Error("Content item not found.");
  await db.insert(adminAuditLog).values({
    adminEmail,
    action: "delete",
    contentId: id,
    detail: `${item.category}:${item.title}`,
  });
  return item;
}
