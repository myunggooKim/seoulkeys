import { cookies } from "next/headers";
import { env } from "cloudflare:workers";
import { normalizeAccountEmail } from "./account-policy";

// Google Sign-In. The browser gets an ID token from Google Identity Services and
// posts it to /api/auth/google. The Worker verifies that token against Google's
// public keys, then issues its own HMAC-signed session cookie so later requests
// don't need to re-verify with Google (Google ID tokens expire in ~1 hour).

export const GOOGLE_CLIENT_ID_FALLBACK =
  "207766266551-91vfnh9btlf7unfeq0igmq5bn96cpo02.apps.googleusercontent.com";

export const SESSION_COOKIE = "hangeul_pop_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const GOOGLE_ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);
const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";

export type AppUser = {
  email: string;
  displayName: string;
  fullName: string | null;
  picture: string | null;
  googleSubject: string | null;
};

function runtimeValue(name: string): string {
  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  return runtimeEnv[name] ?? process.env[name] ?? "";
}

export function googleClientId(): string {
  return runtimeValue("GOOGLE_CLIENT_ID") || GOOGLE_CLIENT_ID_FALLBACK;
}

/**
 * Secret used to sign session cookies. Fail closed: without a configured secret
 * we refuse to mint or accept sessions rather than falling back to a guessable
 * value, which would let anyone forge a login.
 */
function sessionSecret(): string | null {
  const secret = runtimeValue("SESSION_SECRET");
  return secret.length >= 16 ? secret : null;
}

const encoder = new TextEncoder();

function base64UrlDecodeToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function base64UrlDecodeToString(value: string): string {
  return new TextDecoder().decode(base64UrlDecodeToBytes(value));
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

type GoogleClaims = {
  sub?: string;
  iss?: string;
  aud?: string;
  exp?: number;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
};

type JsonWebKey_ = { kid: string; n: string; e: string; alg?: string; kty: string; use?: string };

let jwksCache: { keys: JsonWebKey_[]; fetchedAt: number } | null = null;
const JWKS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function getGoogleJwksKeys(): Promise<JsonWebKey_[] | null> {
  const now = Date.now();
  if (jwksCache && now - jwksCache.fetchedAt < JWKS_CACHE_TTL_MS) {
    return jwksCache.keys;
  }
  try {
    const response = await fetch(GOOGLE_JWKS_URL, { cf: { cacheTtl: 3600 } } as RequestInit);
    if (!response.ok) return jwksCache?.keys ?? null;
    const { keys } = (await response.json()) as { keys: JsonWebKey_[] };
    if (Array.isArray(keys) && keys.length) {
      jwksCache = { keys, fetchedAt: now };
      return keys;
    }
    return jwksCache?.keys ?? null;
  } catch {
    return jwksCache?.keys ?? null;
  }
}

/** Verify a Google ID token (RS256) against Google's published JWKS. */
export async function verifyGoogleIdToken(idToken: string): Promise<AppUser | null> {
  const parts = idToken.split(".");
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, signaturePart] = parts;

  let header: { kid?: string; alg?: string };
  let claims: GoogleClaims;
  try {
    header = JSON.parse(base64UrlDecodeToString(headerPart));
    claims = JSON.parse(base64UrlDecodeToString(payloadPart));
  } catch {
    return null;
  }
  if (header.alg !== "RS256" || !header.kid) return null;

  // Audience must be our client, issuer must be Google, and it must not be expired.
  if (claims.aud !== googleClientId()) return null;
  if (!claims.iss || !GOOGLE_ISSUERS.has(claims.iss)) return null;
  if (!claims.exp || claims.exp * 1000 <= Date.now()) return null;
  const emailVerified = claims.email_verified === true || claims.email_verified === "true";
  if (!claims.email || !emailVerified) return null;
  if (!claims.sub) return null;

  const keys = await getGoogleJwksKeys();
  if (!keys) return null;
  const jwk = keys.find((candidate) => candidate.kid === header.kid);
  if (!jwk) return null;

  const publicKey = await crypto.subtle.importKey(
    "jwk",
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signatureBytes = base64UrlDecodeToBytes(signaturePart);
  const signature = new ArrayBuffer(signatureBytes.byteLength);
  new Uint8Array(signature).set(signatureBytes);
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    signature,
    encoder.encode(`${headerPart}.${payloadPart}`),
  );
  if (!valid) return null;

  return {
    email: normalizeAccountEmail(claims.email),
    displayName: claims.name || claims.email,
    fullName: claims.name ?? null,
    picture: claims.picture ?? null,
    googleSubject: claims.sub,
  };
}

/** Build the signed cookie value for a verified user. */
export async function createSessionValue(user: AppUser): Promise<string | null> {
  const secret = sessionSecret();
  if (!secret) return null;
  const payload = base64UrlEncode(encoder.encode(JSON.stringify({
    email: user.email,
    sub: user.googleSubject,
    name: user.fullName,
    picture: user.picture,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  })));
  return `${payload}.${await hmac(payload, secret)}`;
}

async function readSessionValue(value: string | undefined): Promise<AppUser | null> {
  const secret = sessionSecret();
  if (!secret || !value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  if (!timingSafeEqual(signature, await hmac(payload, secret))) return null;

  try {
    const data = JSON.parse(base64UrlDecodeToString(payload)) as {
      email?: string; sub?: string | null; name?: string | null; picture?: string | null; exp?: number;
    };
    if (!data.email || !data.exp || data.exp * 1000 <= Date.now()) return null;
    return {
      email: normalizeAccountEmail(data.email),
      displayName: data.name || data.email,
      fullName: data.name ?? null,
      picture: data.picture ?? null,
      googleSubject: data.sub ?? null,
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export const SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS;

/**
 * The signed-in user for this request.
 *
 * Only our HMAC-signed cookie is accepted. Request headers are intentionally
 * never treated as identity on the public custom domain: a browser can supply
 * arbitrary `oai-*` headers, so trusting them would allow account spoofing.
 */
export async function getAppUser(): Promise<AppUser | null> {
  const cookieStore = await cookies();
  return readSessionValue(cookieStore.get(SESSION_COOKIE)?.value);
}
