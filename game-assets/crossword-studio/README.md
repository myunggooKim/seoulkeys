# Crossword Studio integration source

Accepted visual revision: studio-candidate-10c-music. The source directory preserves the renderer, models, orbit, game and 104.04-second score together with the selected-language bridge. The deploy-ready export is in public/games/crossword-studio-v17.

Run `npm run build:crossword` only when deliberately regenerating this export after source changes. Regular npm build uses the checked-in, hash-verified export and does not regenerate music, fonts or translations or make paid calls. Definitions are loaded from the local hashed locale files described by source/locale-manifest.json. Review glyph coverage again when changing vocabulary.
