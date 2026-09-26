# Agent instructions

This repository is the canonical source for Christian's Tampermonkey userscripts.

## Definition of done

For every userscript change:

1. Keep the script self-contained and readable.
2. Preserve or narrow existing `@match` / `@include` scope unless broader scope is explicitly required.
3. Increment `@version` whenever behavior or metadata changes.
4. Keep `@updateURL` and `@downloadURL` pointed at the exact raw file on `main`:
   `https://raw.githubusercontent.com/KanbanTrainer/tampermonkey/main/<filename>`
5. Do not add secrets, tokens, cookies, account data, or machine-specific paths.
6. Test syntax before committing.
7. Prefer one logical change per commit.

The public `main` branch is effectively the release channel: once a higher version lands there, installed copies may update automatically.
