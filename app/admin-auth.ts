import { env } from "cloudflare:workers";
import { getChatGPTUser } from "./chatgpt-auth";

export async function getAdminUser() {
  const user = await getChatGPTUser();
  if (!user) return null;

  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  const configuredEmails = runtimeEnv.ADMIN_EMAILS ?? process.env.ADMIN_EMAILS ?? "";
  const adminEmails = configuredEmails
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(user.email.toLowerCase()) ? user : null;
}
