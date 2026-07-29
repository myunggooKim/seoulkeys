# Hangeul Pop

Multilingual Korean typing and language-learning site built with Next.js/vinext and hosted with OpenAI Sites.

## What is included

- Korean two-set keyboard position guide with local QWERTY/AZERTY/QWERTZ labels and translucent finger guidance
- five-sentence daily lesson with Enter-to-advance, pronunciation wait, and typewriter return sound
- word Tetris, missing-letter, crossword, travel conversation, K-POP, and K-Drama/movie-style typing activities
- female/male prerecorded Korean pronunciation, progress sync, streak rewards, and a personal learning page
- private content studio at `/admin`, with rights status, publication controls, and female/male audio URLs
- privacy, terms, advertising, copyright, child-safety, and accessibility baseline at `/legal`

## Local development

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
npm run audio:drills
```

This first rebuilds `scripts/korean-audio-lines.json` directly from the current
curriculum, then renders both female and male MP3 files for every drill word.
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
