# AGENTS.md

## Task Completion Requirements

- Both `bun lint` and `bun typecheck` must pass before considering tasks completed.
- NEVER run `bun test`. Always use `bun run test` (runs Vitest via Turborepo).

## Project Snapshot

This is a fullstack TypeScript monorepo starter with React, Hono, tRPC, and optional Electron support.

## Core Values & Precedence

1. **Performance** and **Reliability** first.
2. Keep **behavior predictable** under load and during failures.
3. **Safety** — memory safety, data integrity, security first
4. **Completeness** — feature-complete, no silent failures
5. **Helpfulness** — clear guidance, actionable advice

If a tradeoff is required, choose **correctness and robustness** over short-term convenience.

## Maintainability

Long term maintainability is a core priority. If you add new functionality, first check if there is shared logic that can be extracted to a separate module. Duplicate logic across multiple files is a code smell and should be avoided.

## Package Roles

- `apps/server`: Hono HTTP server with tRPC API. Manages database access via Drizzle ORM + SQLite.
- `apps/web`: React/Vite UI. Owns routing (TanStack Router), client-side state (Zustand), and data fetching (tRPC + TanStack Query).
- `packages/contracts`: Shared Zod schemas and TypeScript types. Keep this package schema-only — no runtime logic.
- `packages/shared`: Shared runtime utilities consumed by both server and web. Uses explicit subpath exports (e.g. `@starter/shared/formatting`) — no barrel index.

## Code Style

- All code, comments, and commits in **English**.
- Use `camelCase` for variables/functions, `PascalCase` for types/components, `UPPER_SNAKE_CASE` for constants.
- File names in `kebab-case`.
- Follow Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, etc.
