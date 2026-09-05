# Agent Instructions

## Source of Truth

Priority:

1. specs/product.md
2. specs/features/\*
3. specs/architecture.md
4. tests
5. implementation

Specification takes priority over existing implementation.

## Before Coding

- Read the relevant feature specification.
- Inspect existing implementation.
- Produce an implementation plan.
- Identify ambiguity.
- Do not modify code until the plan is complete.

## Implementation

- Make the smallest change that satisfies the specification.
- Do not implement non-goals.
- Do not introduce unrelated refactoring.

## Verification

Before considering work complete, run:

pnpm run verify

Do not claim completion if verification fails.

## Escalation

Stop and report if:

- specification is contradictory
- architecture change is necessary
- destructive migration is required
- verification fails repeatedly

## Git Workflow

- Branch model: trunk-based. `main` + short-lived topic branches. No `develop` branch.
- Branch naming: prefix by intent — `feature/*` (product features), `chore/*`
  (infra/tooling/bootstrap), `fix/*` (bug fixes).
- One topic branch per completed unit of work, merged into `main` via PR.
- Agent responsibility ends at opening the PR. Do not merge PRs.
- PR title and body must be written in Japanese. Commit messages may keep
  the conventional-commit prefix (e.g. `chore:`, `feat:`, `fix:`) in
  English, but the descriptive text should be Japanese.
- Deleting a remote branch changes shared repository state. Before doing
  so, confirm the branch is fully merged and has no unmerged work, then
  ask the user for explicit confirmation before deleting it.
