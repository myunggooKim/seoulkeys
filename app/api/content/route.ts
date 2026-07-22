import { contentCategories, listPublishedContent, type ContentCategory } from "../../../db/content";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const requested = new URL(request.url).searchParams.get("categories")
      ?.split(",")
      .filter((category): category is ContentCategory => contentCategories.includes(category as ContentCategory));
    return Response.json({ items: await listPublishedContent(requested) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load content" }, { status: 500 });
  }
}
