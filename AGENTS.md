# Agent instructions

This repository is the canonical source for Christian's Tampermonkey userscripts.

## Definition of done

For every userscript change:

1. Keep the script self-contained and readable.
2. Preserve or narrow existing `@match` / `@include` scope unless broader scope is explicitly required. Use global scope only for genuinely page-agnostic behavior.
3. Increment `@version` whenever behavior or metadata changes.
4. Keep `@updateURL` and `@downloadURL` pointed at the exact raw file on `main`:
   `https://raw.githubusercontent.com/KanbanTrainer/tampermonkey/main/<filename>`
5. Add or update the script's row in the README index, including its direct install link and current version.
6. Add or update a deterministic fixture under `tests/fixtures/` when browser behavior can reasonably be exercised there.
7. Do not add secrets, tokens, cookies, account data, or machine-specific paths.
8. Test syntax before committing.
9. Prefer one logical change per commit.
10. Do not introduce dependencies, build tooling, dependency bots, or shared abstractions until concrete duplication or another requirement justifies them.

The public `main` branch is the release channel: once a higher version lands there, installed copies may update automatically.
