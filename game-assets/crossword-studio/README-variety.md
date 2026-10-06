# Crossword variety and active-word update

The accepted ceramic scene, embedded model, lighting, rotation, music, locale dictionaries and font inventory remain the basis of this update. It changes the puzzle catalog, session persistence and selected-word glaze. Do not rebuild locale dictionaries or fonts for this change: no new answer was introduced.

## Actual content, not layout counts

The offline generator creates 1,024 connected, independently validated puzzles: 256 each for travel, business, friends and reading. The no-theme track uses the combined catalog, not another 1,024 separately counted puzzles. Each theme has 64 six-word and 192 seven-word boards; all have at least four on-theme answers. Other answers are reviewed bridge vocabulary from the existing corpus. Opening rounds use six words within an 8×8 bound; all later grids fit within 10×10.

Every puzzle has a different sorted answer set. Within a theme, two puzzles must differ by at least two answers, so changing one word or rotating the same grid does not inflate the count. All 1,024 have valid matching crossings, connected entries, no parallel overlap, no side-touching unlisted words, and clean word boundaries. All 439 used answers retain the exact reviewed contextual meanings in all 33 locale packs. The 470-answer source corpus and all 15,510 source translations remain unchanged. Single-character, spaced, and unsuitable/unconnected words are not counted as new crossword coverage.

The former first 200 rounds contained only 12/17/12/7/12 actual answer sets for core/travel/business/friends/reading. The former compaction step kept reselecting a small dense central cluster even when the larger candidate board had other vocabulary.

## Selection and saving

Runtime drawing takes an unseen catalog card first, never a new random layout. A full 256-card theme deck or 1,024-card mixed deck must be exhausted before a puzzle can repeat. A weighted six-board history prefers fresh vocabulary, with the immediately prior board taking precedence. Toward the very end of a deck, some words may recur if every remaining board overlaps; a fresh disjoint card always wins when available. The deck boundary also avoids immediately repeating the last puzzle.

The versioned checkpoint stores the current puzzle, selected clue, typed drafts, solved/assisted answers, score, stars, time and deck history. Reload resumes that round rather than consuming a card or granting rewards twice. Theme tracks are separate. Changing the clue language keeps the Korean-answer track, draft and selection intact, so switching language cannot reset the deck. Valid old cumulative progress is migrated without losing score or learned words. Invalid checkpoints are rejected and blocked storage is reported while play remains available.

Active answer tiles have a blue glossy glaze. The input position is darker and outlined. Solved tiles remain jade; a selected solved intersection keeps a blue selection border. Flat fallback and accessibility markers reflect the same state. The original Hangul input selection handler is retained while forwarding its selection event to the position marker.

## Reproduction and checks

- npm run generate:crossword-catalog regenerates the checked-in catalog deterministically from the existing reviewed locale packs and theme membership.
- npm run build:crossword rebuilds only the static game runtime.
- node scripts/build-crossword-game.mjs --check proves exported JS/CSS match authoring source.
- npm run test:crossword-variety runs full-catalog structural/content checks, two full decks per track with serialized reload checks, live 24-round completion, current-round reload, theme/language continuation, and selected-tile tests.
- npm run typecheck checks the full site.

The sourceHash in app/crossword-build.ts is SHA-256 of sorted source-relative filenames, a null separator, file bytes and a null separator, excluding crossword-build.ts itself. baseSourceHash records the accepted prior-source provenance; tileHash still identifies the unchanged accepted model.

Additional rerouted accepted model, orbit, music and bridge regressions are recorded in ../crossword-variety-qa outside this site directory. They do not certify actual GPU appearance, audio listening, or physical-device IME/touch. Those remain final preview-browser checks, not claims inferred from DOM simulations. This task does not deploy or modify production.
