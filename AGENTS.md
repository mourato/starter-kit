# Starter Kit

Starter Kit is a fullstack TypeScript monorepo that developers clone to start
a new project. It ships a small notes app as a working example: a React UI
calls a Hono and tRPC server, which stores notes in SQLite through Drizzle.
Each project cloned from here starts with this code, so a mistake here is
copied into them. Setup can add an Electron desktop shell.

## What we never compromise

Core values, in precedence order. When two values conflict, the higher one
wins. A required tradeoff goes to correctness and robustness over short-term
convenience.

1. **Performance and reliability.** These come first. Other values yield to
   them when they conflict.
2. **Predictable behavior.** Behavior stays the same under load and during
   failures.
3. **Safety.** Memory safety, data integrity, and security come first. Notes
   live in `data.db`, so their integrity matters.
4. **Completeness.** Features are complete, and no failure passes silently.
   The notes router throws an error for a missing note instead of returning
   nothing.
5. **Helpfulness.** Give clear guidance and advice the reader can act on.

## Glossary

Terms an agent most often misreads here:

- **contracts** — `packages/contracts`: Zod schemas and TypeScript types
  shared by server and web. Schema only, no runtime logic.
- **shared** — `packages/shared`: runtime utilities used by server and web.
- **subpath export** — an import such as `@starter/shared/formatting`. The
  shared package has no root index, so import a subpath.
- **procedure** — one tRPC endpoint, a query or a mutation, defined in
  `apps/server/src/routers/`.
- **data.db** — the local SQLite file the server creates in its working
  directory. It is gitignored.

## The ways to hurt yourself

These mistakes break the app or lose data. Each one names the safe path.

1. **Running `bun test`.** It is not this repo's test command. Run
   `bun run test` instead, which runs Vitest through Turborepo.
2. **Losing local notes.** `data.db` is created when the server's database
   module loads, and tests or scripts that import it open the same file. It
   holds the notes, so deleting or resetting it erases them. Test against a
   copy, and look at `data.db` before you remove or overwrite it.
3. **Schema drift.** `apps/server/src/db/schema.ts` and the `CREATE TABLE`
   in `migrate.ts` both define the notes table. `migrate.ts` uses
   `IF NOT EXISTS`, so an existing `data.db` keeps its old columns after you
   change the schema. Update both files in one change, and treat an existing
   `data.db` as unchanged until you verify it.
4. **Running `make setup` twice.** Setup renames `@starter` in json, ts, tsx,
   md, and css files, deletes `setup.sh`, and removes the `setup` target from
   the Makefile. With Git init chosen, it deletes `.git` first. Run it once,
   right after cloning, as the README Quick Start shows.
5. **Changing the server port alone.** The server reads `PORT`, but Vite
   proxies `/trpc` to `http://localhost:3000`, and the server's CORS origin
   is `http://localhost:5173`. Keep ports 3000 and 5173, or change
   `apps/web/vite.config.ts` and `apps/server/src/index.ts` together.

## Hit every surface

Before calling work done, walk this list and say which entries applied:

- **Server routes** (`apps/server/src/routers/`). Add procedures to a router
  that `routers/index.ts` merges. Take input schemas from `@starter/contracts`.
- **Database** (`apps/server/src/db/`). The server manages database access
  through Drizzle ORM over SQLite. Keep `schema.ts` and `migrate.ts`
  matching. `make db-generate` writes migrations to `drizzle/`, which is
  gitignored.
- **Web UI** (`apps/web/src/`). The web app owns routing (TanStack Router),
  client state (Zustand), and data fetching (tRPC with TanStack Query). Pages
  live in `routes/`, stores in `stores/`, and server calls go through `useTRPC`
  from `lib/trpc.ts`. Check
  that the home page still lists, creates, edits, and deletes notes.
- **Styles** (`apps/web/src/app.css`). The dark-theme design tokens, font,
  animations, and focus ring live here. Check the change against them.
- **Contracts** (`packages/contracts`). A schema change reaches server input
  checks and web types. Check both.
- **Shared** (`packages/shared`). A new module needs its own entry in the
  `exports` map of `packages/shared/package.json`.
- **Dev wiring** (`apps/web/vite.config.ts`, `apps/server/src/index.ts`).
  Ports 5173 and 3000 and the `/trpc` proxy must agree.

## Working here

Run commands through the `Makefile`, which wraps the `bun run` scripts. Start
both apps with `make dev`, or one with `make dev-web` or `make dev-server`.
Vite uses `strictPort`, so it fails if port 5173 is busy. Create tables with
`make db-migrate`.

## Canonical abstractions

- `@starter/shared/formatting` and `@starter/shared/constants` — import the
  subpath, not the package root; enforced by the `exports` map in
  `packages/shared/package.json`, which has no root entry.
- `packages/shared` — put runtime code used by both server and web here,
  instead of copying it into each; enforced by none found in the repo.
- `CreateNoteSchema` and `UpdateNoteSchema` from `@starter/contracts` — use
  them as tRPC inputs, instead of redefining the shape; enforced by none found
  in the repo.
- `publicProcedure` and `router` from `apps/server/src/trpc.ts` — define
  procedures with them, instead of calling `initTRPC` again; enforced by none
  found in the repo.
- `useTRPC` from `apps/web/src/lib/trpc.ts` — use it in components for
  queries and mutations; enforced by none found in the repo.

## Verifying

The gates catch type, lint, and build errors. They cannot prove behavior that
no test covers.

- Before handoff, run `bun lint`, `bun typecheck`, `bun run test`, and
  `bun run build`. Both `bun lint` and `bun typecheck` must pass before
  considering tasks completed.
- The repository test command is `bun run test`. NEVER run `bun test`.
  Always use `bun run test`, which runs Vitest via Turborepo.
- The test scripts pass with no test files (`--passWithNoTests`), and the
  repo has none yet. When `bun run test` passes with nothing to run, say so
  in the handoff.

## Taste

Long-term maintainability is a core priority. Consistent names let an agent
find code by its kind, and one shared module lets a fix land once.

- Before you add functionality, check for shared logic to extract. Duplicate
  logic across files is a code smell; move it into one module first.
- Write all code, comments, and commits in **English**.
- Use `camelCase` for variables and functions, `PascalCase` for types and
  components, and `UPPER_SNAKE_CASE` for constants.
- Name files in `kebab-case`.
- Follow Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, and so
  on.
