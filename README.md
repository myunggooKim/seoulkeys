# Hangeul Pop

Multilingual Korean typing and language-learning site built with Next.js/vinext and hosted independently on Cloudflare Workers.

## What is included

- Korean two-set keyboard position guide with local QWERTY/AZERTY/QWERTZ labels and translucent finger guidance
- five-sentence daily lesson with Enter-to-advance, pronunciation wait, and typewriter return sound
- word Tetris, missing-letter, crossword, travel conversation, K-POP, and K-Drama/movie-style typing activities
- female/male prerecorded Korean pronunciation, progress sync, streak rewards, and a personal learning page
- private content studio at `/admin`, with rights status, publication controls, and female/male audio URLs
- privacy, terms, advertising, copyright, child-safety, and accessibility baseline at `/legal`

## Local development

### Continuing on another computer

Clone the GitHub repository once a remote has been configured, then run `npm ci`
with Node.js 22.13 or newer. Read `ONBOARDING-2026-09-20.md` before deploying:
the transfer snapshot includes local changes that have not been deployed, two
existing translation-test failures, and unresolved local browser-preview issues.

Create a local `.dev.vars` with the required settings described below; credentials
are deliberately excluded from Git. Sign in to Cloudflare separately on the new
computer. The production D1 database is not stored in this repository: preserve
its existing binding and do not recreate it or run remote migrations automatically.
Checked-in audio and translation assets do not need paid regeneration.

Committing or pushing this snapshot is not a production deployment.

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm test
```

Set `SESSION_SECRET` to a cryptographically random value of at least 16
characters. `GOOGLE_CLIENT_ID` may override the bundled public client ID.
Set `ADMIN_EMAILS` to a comma-separated allowlist for the content studio. The
deployment also requires its D1 binding named `DB`.

## Prerecorded Korean audio

The MP3 files in `public/audio/ko` are generated once and served as static assets, so lesson playback has no per-request TTS cost. They were synthesized with [Supertonic](https://github.com/supertone-inc/supertonic): sample code under MIT and model weights under OpenRAIL-M.

To regenerate them, create the local `.venv-tts` Python 3.12 environment with
`supertonic` and `soundfile`, install `ffmpeg`, then run:

```bash
npm run audio:all
npm run audio:drills
```

`audio:all` rebuilds `scripts/korean-audio-lines.json` from the complete content
catalog and renders both voices for every lesson, themed word, conversation,
and proverb. `audio:drills` regenerates only the beginner curriculum.
For another manifest section, run
`python scripts/generate_static_korean_audio.py --prefix lesson --force`.

The browser falls back to a Korean device voice if a recorded file is unavailable. An optional self-hosted Supertonic endpoint can be configured with `SUPERTONIC_TTS_URL`; `SUPERTONIC_TTS_API_KEY` is optional.

## Authentication

Google Identity Services is the only application login. The server verifies the
Google ID token and issues its own HMAC-signed, HTTP-only session cookie. Public
request headers are never accepted as identity.

The token exchange reports `signInKind: "signup"` for a newly created account
and `"returning"` for an existing account. Returning accounts keep their stored
role even if a modified client asks to be promoted. Daily visit rewards are
idempotent per account and UTC date.

## Database and verification

- Schema: `db/schema.ts`
- Migrations: `drizzle/*.sql`
- Generate future migrations: `npm run db:generate`
- Apply locally: `npx wrangler d1 migrations apply DB --local`
- Apply remotely: `npx wrangler d1 migrations apply DB --remote`
- Production build: `npm run build`
- Full verification: `npm test`
