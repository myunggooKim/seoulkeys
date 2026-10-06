import { env } from "cloudflare:workers";
import { serveDefenseWasm } from "../../../godot-defense-asset";

export const dynamic = "force-dynamic";

export function GET(request: Request): Promise<Response> {
  return serveDefenseWasm(request, env.ASSETS);
}

export function HEAD(request: Request): Promise<Response> {
  return serveDefenseWasm(request, env.ASSETS);
}
