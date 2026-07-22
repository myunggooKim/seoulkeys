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
npm test
```

Set `ADMIN_EMAILS` to a comma-separated allowlist for the content studio. The Sites deployment also requires its D1 binding named `DB`.

## Prerecorded Korean audio

The 28 MP3 files in `public/audio/ko` are generated once and served as static assets, so lesson playback has no per-request TTS cost. They were synthesized with [Supertonic](https://github.com/supertone-inc/supertonic): sample code under MIT and model weights under OpenRAIL-M.

To regenerate them, create a Python 3.12 environment with `supertonic` and `soundfile`, then run:

```bash
python scripts/generate_static_korean_audio.py --ffmpeg /path/to/ffmpeg
```

The browser falls back to a Korean device voice if a recorded file is unavailable. An optional self-hosted Supertonic endpoint can be configured with `SUPERTONIC_TTS_URL`; `SUPERTONIC_TTS_API_KEY` is optional.

## Authentication

The current Sites deployment uses dispatch-owned Sign in with ChatGPT and per-request authenticated identity headers. `/my` and `/admin` are protected server-rendered pages. A true Google-only login requires a separate Google OAuth client and an independent authentication deployment; it is not represented as active here.

## Database and verification

- Schema: `db/schema.ts`
- Migration: `drizzle/0000_black_black_bird.sql`
- Generate future migrations: `npm run db:generate`
- Production build: `npm run build`
- Full verification: `npm test`
