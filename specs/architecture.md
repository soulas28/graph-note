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
  (typecheck && lint && format:check && build).
- No DB / auth / AI SDK / CSS framework / state management library in
  Phase 0.

## Current Constraints

- No product features are implemented yet — this repo is bootstrap-only
  (Phase 0).
- `specs/product.md` is the highest-priority source of truth; nothing here
  may contradict it.
- No test runner (Vitest/Playwright) and no CI pipeline yet.

## Deferred Decisions

- Persistence approach: Next.js server features are an available option,
  but a client-only approach (localStorage/IndexedDB) is also under
  consideration — not decided, revisit when the relevant feature spec is
  written.
- Whether `next build` stays inside `pnpm run verify` long-term or moves to
  a CI-only step.
- Test runner introduction (Vitest / Playwright), test file location/naming
  convention, and CI pipeline.
- Data model for "graph" (nodes/edges) — deferred to feature specs.
