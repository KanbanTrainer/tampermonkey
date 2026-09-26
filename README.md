# Tampermonkey userscripts

Small browser fixes and utilities, kept in Git so the repository—not Tampermonkey sync—is the source of truth.

## Scripts

| Script | What it does | Version | Install |
| --- | --- | ---: | --- |
| **Scroll to Bottom Button** | Shows a floating ↓ button whenever the page is not at the bottom. | `1.0.0` | **[Install](https://raw.githubusercontent.com/KanbanTrainer/tampermonkey/main/scroll-to-bottom.user.js)** |
| **Auto Retry Buttons** | Automatically retries matching Retry/Try again buttons, with countdown and per-tab pause. | `1.0.0` | **[Install](https://raw.githubusercontent.com/KanbanTrainer/tampermonkey/main/auto-retry.user.js)** |

Clicking an **Install** link opens the raw `.user.js` file. With Tampermonkey installed, Tampermonkey should offer to install or update it.

## Automatic updates

Every userscript must include:

```text
// @version      1.0.0
// @updateURL    https://raw.githubusercontent.com/KanbanTrainer/tampermonkey/main/<file>.user.js
// @downloadURL  https://raw.githubusercontent.com/KanbanTrainer/tampermonkey/main/<file>.user.js
```

After installation, Tampermonkey periodically checks `@updateURL`. If the remote `@version` is newer, it downloads the script from `@downloadURL`.

Git is therefore the synchronization mechanism:

```text
edit → test → bump @version → merge to main → Tampermonkey update
```

## Versioning and releases

`main` is the release channel. A separate GitHub Release is not required for ordinary userscript changes.

Use monotonically increasing semantic versions: `MAJOR.MINOR.PATCH`.

- **Patch:** fixes and small changes.
- **Minor:** meaningful new behavior.
- **Major:** incompatible or substantially changed behavior.

A changed userscript must always get a newer `@version`. CI validates userscript metadata and syntax, and pull requests changing an existing userscript must also change its version.

## Testing

Deterministic browser fixtures live under `tests/fixtures/`. They are intentionally plain HTML so userscript behavior can be exercised without depending on a live site's current DOM.

For the scroll-to-bottom script, open `tests/fixtures/scroll-to-bottom.html` and verify:

1. The ↓ button is visible near the top of the page.
2. Clicking it scrolls smoothly to the bottom.
3. The button disappears at the bottom.
4. Scrolling upward makes it reappear.
5. Adding dynamic content while at the bottom makes it reappear because the page is no longer at the bottom.

## Repository rules

- One userscript per `*.user.js` file.
- Keep scripts self-contained unless an external dependency is genuinely necessary.
- Prefer narrow `@match` rules over global execution when the script is site-specific.
- Global `@match *://*/*` is acceptable only when the behavior is intentionally useful across arbitrary pages.
- Never commit secrets or credentials.
- Git history is the rollback mechanism.
- Avoid build tooling, shared UI libraries, Renovate/Dependabot, and other infrastructure until dependencies or concrete duplication make them useful.

## License

MIT.
