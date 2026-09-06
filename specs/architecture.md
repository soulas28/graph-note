# Architecture

## Current Decisions

- Framework: Next.js (App Router) + TypeScript, single package. This gives
  the option to use Next.js server features (API Routes/Server Actions)
  later, but does not lock the future backend architecture into Next.js —
  a separate backend service remains a possibility.
- Package manager: pnpm (pinned via corepack / `packageManager` field in
  `package.json`).
- Runtime: Node.js LTS, executed via Docker (`Dockerfile` +
  `docker-compose.yml`). Docker is the sole canonical way to run/build/verify
  this project — local host execution is not a documented/supported path.
- Static verification: TypeScript strict, ESLint (`eslint-config-next`),
  Prettier (default config), aggregated via `pnpm run verify`
  (typecheck && lint && format:check && test && build).
- Test runner: Vitest, scoped to domain/logic modules under `src/lib/`
  (pure functions, no React/DOM). Test files live under a top-level
  `tests/` directory mirroring the `src/` layout (e.g. `src/lib/notes.ts`
  → `tests/lib/notes.test.ts`), not colocated with source. UI component
  testing (React Testing Library) is not introduced yet.
- E2E: Playwright (`@playwright/test`), test files under `tests/e2e/*.spec.ts`
  (kept separate from Vitest's `tests/lib/*.test.ts` by directory and
  extension so each runner only picks up its own files). Playwright does
  not start the app itself (no `webServer` config) — Docker remains the
  sole way the app is run; `pnpm run test:e2e` assumes `docker compose up`
  is already running. `pnpm run verify` intentionally does not include
  e2e, to keep it fast and to keep the app's own Docker image free of
  browser dependencies. In CI, e2e runs as its own job using the official
  `mcr.microsoft.com/playwright` image (pinned to the same version as
  `@playwright/test`) as an external client hitting the already-running
  app over `--network host` — it is a test client, not another way of
  running the app.
- CI: GitHub Actions, triggered on `pull_request`. Jobs are added
  incrementally, one focused concern per job (currently: `verify`, which
  runs the exact same command as local development —
  `docker compose build && docker compose run --rm web pnpm run verify`,
  no separate CI-only verification logic; `secrets-scan`; and `e2e`). No
  deploy/CD.
- DevSecOps: dependency vulnerability audit (`pnpm audit --audit-level=high`)
  is part of `pnpm run verify` itself (not a separate CI-only step, for the
  same reason `verify` is a single canonical command). Dependabot
  (`.github/dependabot.yml`) keeps npm/pnpm, Docker base image, and GitHub
  Actions dependencies updated. Gitleaks scans for committed secrets on
  every PR via the `secrets-scan` CI job. Static analysis (e.g. CodeQL) is
  deferred — not warranted at the current project size.
- Graph data model: notes (nodes) and their relationships (edges) are
  separate entities — a `Note` does not embed relationship data. This
  keeps `src/lib/notes.ts` free of any edge/graph awareness and leaves
  room for edges to carry their own metadata later without touching the
  Note model. Graph rendering uses `@xyflow/react`, used with its default
  behavior only (no custom node/edge types, layout algorithms, or
  toolbar/minimap customization).
- No DB / auth / AI SDK / CSS framework / state management library.

## Current Constraints

- `specs/product.md` is the highest-priority source of truth; nothing here
  may contradict it.
- No persistence: application state is in-memory only and is lost on
  reload.

## Deferred Decisions

- Persistence approach: Next.js server features are an available option,
  but a client-only approach (localStorage/IndexedDB) is also under
  consideration — not decided, revisit when the relevant feature spec is
  written.
- Whether `next build` stays inside `pnpm run verify` long-term or moves to
  a CI-only step.
- Edge metadata (label, type, weight, etc.) — the `Edge` type is designed
  to allow this later, but nothing beyond `{ id, source, target }` is
  implemented yet.
- UI component testing (React Testing Library) — introduce when a
  feature's UI behavior is complex enough to warrant it (e2e/Playwright is
  now introduced, see Current Decisions).
- Static analysis / SAST (e.g. CodeQL) — deferred until the project size
  warrants it.
