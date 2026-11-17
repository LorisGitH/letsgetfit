# letsgetfit

## Commands

Run tools through mise (versions pinned in `mise.toml`), e.g. `mise exec -- pnpm check`. `pnpm check` runs the same format, lint, type and test gates as CI; `pnpm build` also type-checks and builds.

## Conventions

- Layers and what each may import are in the README's "Project structure"; ESLint enforces them.
- TypeScript stays on 6.0.x: typescript-eslint's typed rules don't support TypeScript 7 yet.
- pnpm refuses packages published less than a day ago. Pick an older version instead of adding `minimumReleaseAgeExclude` entries.
- Every UI string goes in both `src/ui/i18n/locales/en.ts` and `fr.ts`; the `Translation` type makes a missing key a type error.

## Agent skills

### Issue tracker

Issues are tracked in this repo's GitHub Issues (`gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
