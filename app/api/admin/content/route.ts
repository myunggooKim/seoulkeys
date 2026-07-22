import { getAdminUser } from "../../../admin-auth";
import { createContent, listAdminContent, normalizeContentInput } from "../../../../db/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Administrator access required" }, { status: 403 });
  try {
    return Response.json({ items: await listAdminContent() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load content" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Administrator access required" }, { status: 403 });
  try {
    const input = normalizeContentInput(await request.json());
    const item = await createContent(input, admin.email);
    return Response.json({ item }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to create content" }, { status: 400 });
  }
}
