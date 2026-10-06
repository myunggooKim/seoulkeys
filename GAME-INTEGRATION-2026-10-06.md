# Two-game integration, 2026-10-06

Based on main commit 86491f5f218e2cbba1db680aded59e9868e2a0e8. The current learning, community, likes, header and reviewed shared translations are retained. The existing menu now opens the accepted Defense 16 and Crossword Studio 10 games through same-origin hosts.

## Build and deployment

Use Node >=22.13, `npm ci`, `npm run typecheck`, `npm run build`, and `npm test`. The defense pack is stored as two binary parts under game-assets/seoul-defense; prebuild and predev verify every SHA-256 and reconstruct public/games/seoul-defense/index.pck atomically. The reconstructed file is not committed. Its required SHA-256 is 62c683d0aa31bc3a25f3b3cc44279a31d710808a18af111b36c6b942641dd6a5. Missing or corrupt parts fail the build. Do not deploy public directly without running the build. npm run deploy already calls npm run build before preparing/uploading the Worker version.

The existing deployment scripts name Worker `hangeul-pop`, not `seoulkeys`; the latest HANDOFF documents seoulkeys.com and www.seoulkeys.com. Before a production deployment, verify the signed-in Cloudflare account, this Worker, its domain routes and D1 bindings. This integration does not itself authorize or perform a production deployment. No ad publisher ID or account configuration has been added.

Crossword editable source is in game-assets/crossword-studio/source. `node scripts/build-crossword-game.mjs --check` verifies its exact frozen JS/CSS export. `npm run build:crossword` deliberately rebuilds that export after source changes; regular site builds do not regenerate music, translations or fonts. Defense editable scripts are preserved in game-assets/seoul-defense/source/scripts; preserve the accepted compiled resources when rebuilding the game.

## Behaviour and validation

Both games use the selected site's 33-language meaning dictionaries. Defense includes 456 meanings per locale; crossword includes 470. Korean typing targets remain Korean. The accepted game interface labels retain their existing Korean/English behaviour. Meaning checks and script/glyph rendering checks are not a native-speaker endorsement of every translation.

Locale, sound, theme and exit-dialog state are bridged with origin/source checks; crossword also validates a per-mount session. Exit cancellation retains the current game, draft input and prior manual pause. Background suspension remains distinct. The integrated page traps dialog focus. Escape during IME composition is not treated as an exit request.

Reserved desktop side rails are 160px with at least 150px clearance from game interaction; narrower layouts omit these rails instead of squeezing controls. They are reserved blank space, not live ad units. Game and meaning resources bypass the old service-worker cache-first path and revalidate. Fonts and music are served locally.

The shared Thai puppy entry and its generator override are corrected to ลูกสุนัข, with regression coverage. Other shared meanings are unchanged.

Cloud checks: site typecheck and production build; 258 unit tests; defense packed/source locale, glyph, layout, bridge and pause checks; crossword source/export consistency, resource hashes, locale/keyboard/pointer/audio contracts. Native defense captures covered Korean, Arabic and Tamil desktop/mobile. Full hosted-browser/GPU, physical OS IME and audible music playback remain deployment smoke tests, not claimed passes. In the cloud sandbox the tsx CLI IPC pipe is unavailable; the same units run via `node --import tsx --test tests/*.test.mjs`.

After a separately authorized deployment, check both menu entries, cached/reloaded game assets, all locale fetches, Arabic/Indic rendering, Korean composition, exit/cancel/back, music/effects toggles, narrow/mobile layouts, and reserved ad clearance on the actual site.

## Responsive Defense follow-up

Desktop 1440/1536 layouts show two 160×600 reserved ad placeholders, separated from gameplay by 150 px. Rails require a minimum 760 px game viewport and collapse on narrower layouts. The v4 safe overlay changes only HUD _layout against v3; music, models, main gameplay and 166 other packed resources remain identical. Native checks cover narrow result-card text and on-screen keyboard hit targets.

## Crossword catalog follow-up

Four theme decks now contain 256 puzzles each, 1,024 distinct answer sets in total. The existing host selects the active site theme (travel by default). Each deck is exhausted before repeating a puzzle; saved drafts, completion state and recent history survive reload and locale changes. The 439 used answers retain their existing meanings in all 33 languages. The current answer is blue, its input position is darker blue, and solved answers stay jade. Models, fonts and the accepted music are unchanged.
