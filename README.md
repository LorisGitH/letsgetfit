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

## Exercise catalogue

The built-in Catalogue comes from [free-exercise-db](https://github.com/yuhonas/free-exercise-db), which is in the public domain ([ADR 0003](docs/adr/0003-catalogue-from-free-exercise-db.md)). `pnpm catalogue:import` rebuilds it at the pinned source commit. Pass `--commit <sha>` to move to another commit. The import writes `src/domain/catalogue/exercises.json` and `public/catalogue/images/`; commit both. The rules that choose and tag exercises are in [`scripts/catalogue/tagging.ts`](scripts/catalogue/tagging.ts).

## Deployment

letsgetfit is an installable PWA that works offline. Its icons are generated at build time from [`public/favicon.svg`](public/favicon.svg). It runs as a Project on traquenard ([ADR 0002](docs/adr/0002-hosted-on-traquenard.md)):

- The [`Dockerfile`](Dockerfile) serves `dist/` from an unprivileged nginx on port 8080, configured in [`deploy/nginx.conf`](deploy/nginx.conf) (cache headers and the Content-Security-Policy).
- The [image workflow](.github/workflows/image.yml) builds and checks the image on every pull request. On every push to `main` it also publishes `ghcr.io/lorisgith/letsgetfit:main-<unix time>-<short sha>`.
- [`deploy/smoke.sh <base url>`](deploy/smoke.sh) checks what a browser gets: status codes, content types, cache headers, CSP, service worker and icons. CI runs it against the image; run it against the live site after a deploy.

## Licence

[PolyForm Noncommercial 1.0.0](LICENSE): free for any noncommercial purpose. Commercial use is not permitted.
