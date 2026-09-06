# graph-note

まず書き、その後に構造化できるメモ環境。ノートをグラフのノードとして
作成・編集・接続できる。

## Requirements

- Docker (with Docker Compose)

Docker is the only supported way to run and verify this project; behavior
must not depend on the local machine's Node.js installation.

## Development

```bash
docker compose up
```

Then open http://localhost:3000.

## Verification

```bash
docker compose run --rm web pnpm run verify
```

This runs, in order: TypeScript type-checking, ESLint, a Prettier format
check, Vitest (domain logic unit tests), a dependency audit, and a
production build.

## E2E tests

E2E tests (Playwright) run against an already-running instance of the app
— they do not start it themselves. Start the app first, then run the
tests from the host (requires Node.js + pnpm locally, since this drives a
browser against the app rather than running the app itself):

```bash
docker compose up -d
pnpm run test:e2e
```

## More context

- `AGENTS.md` — priority order of specs and the escalation policy for
  agents working in this repo.
- `specs/product.md` — product vision (highest-priority source of truth).
- `specs/architecture.md` — current technical decisions, constraints, and
  deferred decisions.
- `docs/plan/` — records of past planning decisions (e.g. Phase 0
  bootstrap).
