import { getAdminUser } from "../../../../admin-auth";
import { deleteContent, normalizeContentInput, updateContent } from "../../../../../db/content";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Administrator access required" }, { status: 403 });
  try {
    const { id } = await context.params;
    const contentId = Number.parseInt(id, 10);
    if (!Number.isInteger(contentId)) return Response.json({ error: "Invalid content id" }, { status: 400 });
    const input = normalizeContentInput(await request.json());
    return Response.json({ item: await updateContent(contentId, input, admin.email) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to update content" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Administrator access required" }, { status: 403 });
  try {
    const { id } = await context.params;
    const contentId = Number.parseInt(id, 10);
    if (!Number.isInteger(contentId)) return Response.json({ error: "Invalid content id" }, { status: 400 });
    return Response.json({ item: await deleteContent(contentId, admin.email) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to delete content" }, { status: 400 });
  }
}
