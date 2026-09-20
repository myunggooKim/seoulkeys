export const dynamic = "force-dynamic";

const countryHeaderNames = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "x-country-code",
];

export async function GET(request: Request) {
  const countryCode = countryHeaderNames
    .map((name) => request.headers.get(name)?.trim().toUpperCase())
    .find((value) => value && /^[A-Z]{2}$/.test(value)) ?? null;

  return Response.json(
    {
      countryCode,
      browserLanguage: request.headers.get("accept-language")?.split(",")[0]?.trim() ?? null,
    },
    { headers: { "cache-control": "private, no-store" } },
  );
}
