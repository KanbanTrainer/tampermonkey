# Tampermonkey userscripts

Small browser fixes and utilities, kept in Git so the repository—not Tampermonkey sync—is the source of truth.

## Install

Open the raw URL for a `.user.js` file in this repository. Tampermonkey will offer to install it.

Every userscript must include:

```text
// @version      1.0.0
// @updateURL    https://raw.githubusercontent.com/KanbanTrainer/tampermonkey/main/<file>.user.js
// @downloadURL  https://raw.githubusercontent.com/KanbanTrainer/tampermonkey/main/<file>.user.js
```

After installation, Tampermonkey periodically checks `@updateURL`. If the remote `@version` is newer, it downloads the script from `@downloadURL`.

## Versioning

Use monotonically increasing semantic versions: `MAJOR.MINOR.PATCH`.

- Patch: fixes and small changes.
- Minor: meaningful new behavior.
- Major: incompatible or substantially changed behavior.

A changed userscript must always get a newer `@version`. CI enforces the metadata and validates version changes on pull requests.

## Repository rules

- One userscript per `*.user.js` file.
- Keep scripts self-contained unless an external dependency is genuinely necessary.
- Prefer narrow `@match` rules over global execution.
- Never commit secrets or credentials.
- Git history is the rollback mechanism.
- `main` is the canonical published version.

## License

MIT.
