# Seoul Keys first-minute and teacher patch — 2026-09-20

## Local changes, not deployed

- Added optional, collapsible warm-up: two index-finger keys, then 가, then an optional user-confirmed Hangul name. No saved curriculum indices, progress records, local storage or network requests are changed by this exercise.
- Added collapsible, read-only syllable decomposition guide to home/syllable/batchim practice. Does not intercept IME, scoring or saved progress. Romanization is limited to the introductory 가 (ga) example; full phonetic transcription and animation are not implemented.
- Fixed teacher login link: the old link navigated via GET to a POST-only authentication endpoint. Reused the existing GoogleSignIn flow instead; retained persisted role enforcement.
- Teacher dashboard now reports load/create/delete/assignment/clipboard failures. Load failure no longer masquerades as an empty class list. Added retry for loading.
- Added first-class name presets (not auto-published assignments) and responsive wrapping in the teacher header/grid.
- Existing keyboard/finger guidance, visit streak and continue-learning UI preserved.

## Verification

- Baseline typecheck passed (sandbox needed elevated Node path access).
- Patched typecheck and production build passed.
- Focused input/progress/auth tests: 28/28 passed.
- Full suite: 83/85 passed. Two failures in untouched learning-i18n tests:
  - generator source assertion expects `required_protected_values(key, learning_content)`;
  - route-scoped common bundles missing 11 locale files.
- git diff --check passed. Existing dirty files and untracked assets were not reset.
- Browser visual QA not completed: Vite dev server produces a React `useContext` error in vinext Slot; Node production start rejects the cloudflare: import; local Wrangler build redirects HTTP to local HTTPS without a working TLS listener. These are release blockers, not proof of an error on the live site. No framework/config changes were made to mask them.

## Boundaries and remaining work

- No production deployment, database migration, email/push send, new cron, remote class creation, external outreach or paid AI call.
- No verified live metric supporting the supplied 45% dropout number; do not infer a cause from it alone.
- Warm-up copy currently has authored Korean/English and uses existing translation fallback; remaining locales need reviewed static translations before broad rollout.
- Teacher account login, real class creation, invite/join and submission path require an authorized test account and isolated data before claiming end-to-end verification.
- Before release: resolve local rendering environment, verify mobile/desktop screenshots and interaction/IME flows, resolve pre-existing translation test failures, then review an isolated deployment diff against the currently deployed version.
- Guest class membership, campaign outreach and consent-based reminder delivery are deliberately not enabled.
