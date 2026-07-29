import { googleClientId } from "../../../google-auth";

export const dynamic = "force-dynamic";

/**
 * The Google client ID is public by design (it ships in the sign-in button on
 * every page). This endpoint exists so client components can render sign-in
 * without the whole page having to become a server component.
 */
export async function GET() {
  return Response.json({ clientId: googleClientId() });
}
