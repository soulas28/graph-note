# graph-note

Phase 0: repository bootstrap. No product features are implemented yet —
this is the minimum scaffolding needed to run and verify a Next.js app.

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
check, and a production build.

## More context

- `AGENTS.md` — priority order of specs and the escalation policy for
  agents working in this repo.
- `specs/product.md` — product vision (highest-priority source of truth).
- `specs/architecture.md` — current technical decisions, constraints, and
  deferred decisions.
- `docs/plan/` — records of past planning decisions (e.g. Phase 0
  bootstrap).
