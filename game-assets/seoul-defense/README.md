# Defense game assets

Accepted base: Defense16. Integration17 retains every other packed resource and updates the language/host-lifecycle script only.

The complete PCK is tracked as two binary pieces to stay within the supported GitHub upload transport. `npm run build` and `npm run dev` first invoke scripts/assemble-defense-assets.mjs, which verifies both pieces and reconstructs public/games/seoul-defense/index.pck. The output is ignored by Git, preventing duplicate pack storage. Missing/corrupt pieces fail the build. Deployment uses npm run build, so it uses the same gate.

The verified PCK SHA-256 is 39c641a333933d8915d3b5d49b6ec9e678790f17d6bc09cdd9f4ea50a8c435f6. Runtime URL and engine loading are unchanged. Editable scripts are under source/scripts. Do not directly editor-import the preserved binary-asset project; use the approved safe overlay export against the verified pack and preserve all other resources.
