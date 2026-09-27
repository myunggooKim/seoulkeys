# Seoul Keys loading improvements — 2026-09-27

## Evidence before changes

Cloudflare Web Analytics, last 24 hours as inspected during this task:

- Only five LCP samples; do not treat the percentages as a stable population estimate.
- LCP p75: 8,332 ms. Debug view identified `img.hand-rest-image`,
  `/images/typing-hands-v2.png` (two samples, 8,332 ms).
- One poor CLS sample (0.285) identified `aside.live-board` in the notice row.
- The app waits for locale, translations, account, progress, theme and all fonts
  before revealing its first frame, with a 4-second emergency reveal.

## Implemented

- Preserve language-selection precedence. Skip `/api/locale` only when the
  supported non-English primary browser language already determines the result.
  English/unknown browsers retain geographic lookup; manual choices still win.
- After account/locale/progress/theme/translation readiness, limit the additional
  font wait to 150 ms. Keep Korean webfonts, swap behavior and the emergency guard.
- Load Falling Words, Missing Letter and Crossword on selection instead of
  embedding all three in the initial home module. An activity-scoped error
  boundary prevents failed optional chunks from replacing the entire home page.
- Generate a lossless WebP hand guide: 471,302 → 295,956 bytes (37.2% smaller).
  Every alpha value and every visible RGB value is identical to the original;
  dimensions are unchanged. Preserve the PNG source. Use one new URL for the
  illustration, pressed-finger layer, alpha mask and home-only early preload.
  The new URL also avoids an old service-worker image-cache entry.
- Keep the counter's reserved position and last valid totals when the existing
  API returns its all-zero datastore-error fallback. Poll/heartbeat intervals
  remain 60/45 seconds; no extra database reads or writes were introduced.
- Gate the unreleased September 20 warmup/syllable panels off. Their source is
  preserved, but this performance rollout does not enable a new practice UI.

## Verification

- Typecheck and production build pass.
- Full suite: 92/94 pass. Both remaining failures already exist in HEAD and in
  `ONBOARDING-2026-09-20.md`: the translation-generator source assertion and 11
  missing common learning-guide locale bundles. No translation packs were
  generated or changed, and those assertions were not weakened.
- Image pixel/alpha/dimension checks pass; both image layers load in the preview.
- All three split games render their actual playable control screens in the
  preview with no captured browser console errors.
- Desktop (1440×900) and mobile (390×844) checks show no horizontal document
  overflow. Shared layout CSS matches the live September 8 stylesheet after
  accounting for the hand-image URL and an added underline utility declaration.
- Main home module: live 330,944 bytes → new 196,557 bytes. This is one module,
  **not** a claim of a 41% reduction in all transferred JavaScript: shared
  dependencies still load separately.
- Preview version: `21d6f72f-b5bc-4d5c-b897-0cbb9ceabfd9`.
- Existing ASSETS/DB/ADMIN_EMAILS/SESSION_SECRET bindings were retained and
  verified by name/type; credentials were not printed or changed.

## Deployment and boundaries

Previous production version (rollback target):
`8960edf2-7626-4625-9385-bc05fea7781f`.

Activated `21d6f72f-b5bc-4d5c-b897-0cbb9ceabfd9` at 100% production traffic.
Post-deployment checks: home, learning library, pulse and the 295,956-byte WebP
return 200 on `seoulkeys.com`. The home uses `page-DI8vJbfH.js`; in the live
signed-in browser the existing session remains valid, the 1-day/1,000-beat badge
is present, both hand-image layers load, and no browser errors or horizontal
document overflow were observed. These are functional checks, not an LCP trace.

No database migration, role changes, class creation/deletion, new cron,
notification campaign, paid AI call, dependency upgrade or authentication
removal is part of this task. Teacher-account end-to-end flows are not claimed
as verified by the anonymous preview checks.

Chrome DevTools MCP was not available in this session. No replacement browser
trace or fabricated before/after LCP was used. Benefits must be checked against
new real-user samples; old 24-hour analytics do not disappear on deployment.
