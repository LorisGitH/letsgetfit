# letsgetfit

A solo training app, usable on phone and laptop. You set one Goal (gain muscle, lose fat, or both), say which exercises you're comfortable with and which equipment you own, and letsgetfit builds a weekly Plan for you. The vocabulary is defined in [CONTEXT.md](CONTEXT.md) and the main decisions in [docs/adr/](docs/adr/).

## Development

Tool versions are pinned in [`mise.toml`](mise.toml). With [mise](https://mise.jdx.dev) installed:

```sh
mise install          # Node and pnpm at the pinned versions
pnpm install
pnpm dev              # local dev server
pnpm check            # format check, lint, type check and tests, as CI runs them
pnpm build            # production build into dist/
```

## Project structure

The code is split into layers, and ESLint enforces which may import which:

| Layer         | Holds                                                     | May import            |
| ------------- | --------------------------------------------------------- | --------------------- |
| `src/domain`  | Pure domain logic and types, with no framework or storage | nothing else in `src` |
| `src/storage` | Persistence on the device, behind domain interfaces       | `domain`              |
| `src/ui`      | React components and translations (English and French)    | `domain`              |
| `src/app`     | The composition root that wires everything together       | everything            |

Domain logic is written test-first. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org).

## Licence

[PolyForm Noncommercial 1.0.0](LICENSE): free for any noncommercial purpose. Commercial use is not permitted.
