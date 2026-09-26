# Copilot coding-agent instructions

Implement issue requests end-to-end for this repository.

- Read and follow `AGENTS.md` before making changes.
- Treat the issue title, body, and subsequent comments as the product specification.
- For an existing userscript, preserve unrelated behavior.
- For a new userscript, keep it self-contained and add standard Tampermonkey metadata.
- Every changed userscript must increment `@version`.
- Every userscript must use its exact raw `main` URL for `@updateURL` and `@downloadURL`.
- Update the README script index/version/install link whenever a userscript changes.
- Add or update a deterministic HTML fixture when practical.
- Run syntax/metadata validation and any relevant tests.
- Do not add dependencies or build tooling unless the issue genuinely requires them.
- Keep the pull request linked to the originating issue with a closing keyword so repository automation can mirror progress back to the issue.
- If blocked by missing information, state exactly what is missing in the issue or pull request rather than guessing.
