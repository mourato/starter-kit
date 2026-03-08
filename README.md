# Starter Kit

## Features

- **React 19** with React Compiler (automatic memoization)
- **Vite 7** with Rolldown (Rust-powered builds)
- **TailwindCSS 4** with design tokens and dark theme
- **TanStack Router** — file-based, type-safe routing
- **TanStack Query** — data fetching & caching
- **Zustand** — lightweight state management (~1KB)
- **Hono** — ultrafast HTTP server (~14KB)
- **tRPC v11** — end-to-end type-safe APIs
- **Drizzle ORM** — type-safe, SQL-first database layer
- **SQLite** via Bun native FFI (or PostgreSQL)
- **Turborepo** — incremental builds & task caching
- **Bun** — fast package manager & runtime
- **OxLint + OxFmt** — Rust-powered linting/formatting (~100x faster)
- **Vitest 4** — HMR-aware testing
- **Optional Electron** — desktop app support

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/mourato/starter-kit.git my-project
cd my-project

# 2. Run interactive setup
make setup

# 3. Install dependencies
bun install

# 4. Start developing
make dev
```

The `setup.sh` script will interactively configure the project based on your needs.

## Setup Options

The interactive setup asks the following questions and configures the project accordingly:

| Question | Options | Effect |
|---|---|---|
| **Project name** | Any string | Renames all packages and references |
| **Package scope** | `@myorg` | Replaces `@starter` across all files |
| **Platform** | Web / Desktop / Both | Adds Electron skeleton if desktop |
| **Backend** | Yes / No | Removes `apps/server` + tRPC if no |
| **Database** | SQLite / PostgreSQL / None | Configures Drizzle accordingly |
| **Authentication** | None / Better Auth | Scaffolds auth module |
| **CMS** | None / Payload / Sanity / WP | Adds setup documentation |
| **Git init** | Yes / No | Initializes repo with first commit |

## Stack

### Frontend (`apps/web`)

| Technology | Purpose |
|---|---|
| React 19 + React Compiler | UI with automatic memoization |
| Vite 7 (Rolldown) | Dev server + Rust-powered builds |
| TailwindCSS 4 | Design system + utility styling |
| TanStack Router | Type-safe file-based routing |
| TanStack Query | Server state & caching |
| TanStack Virtual | List virtualization |
| Zustand 5 | Client state (~1KB) |
| Lucide React | Tree-shakeable SVG icons |

### Backend (`apps/server`)

| Technology | Purpose |
|---|---|
| Hono | Ultrafast HTTP framework |
| tRPC v11 | End-to-end type-safe API |
| Drizzle ORM | Type-safe SQL queries |
| SQLite (Bun FFI) | Zero-config local database |

### Monorepo

| Technology | Purpose |
|---|---|
| Turborepo | Incremental builds, task cache |
| Bun | Package manager + runtime |
| OxLint | Rust-powered linting |
| OxFmt | Rust-powered formatting |
| Vitest 4 | Testing framework |
| TypeScript 5.7+ strict | Maximum type safety |

## Project Structure

```
├── apps/
│   ├── web/                 # React + Vite frontend
│   │   ├── src/
│   │   │   ├── routes/      # TanStack Router (file-based)
│   │   │   ├── stores/      # Zustand stores
│   │   │   ├── lib/         # Utilities (tRPC client, etc.)
│   │   │   └── app.css      # TailwindCSS design tokens
│   │   └── vite.config.ts
│   ├── server/              # Hono + tRPC backend
│   │   ├── src/
│   │   │   ├── routers/     # tRPC routers
│   │   │   ├── db/          # Drizzle schema + connection
│   │   │   └── index.ts     # Server entrypoint
│   │   └── drizzle.config.ts
│   └── desktop/             # Electron (optional)
├── packages/
│   ├── contracts/           # Shared Zod schemas (no runtime)
│   └── shared/              # Shared utilities (subpath exports)
├── setup.sh                 # Interactive project configurator
├── Makefile                 # Common commands
├── turbo.json               # Turborepo tasks
└── tsconfig.base.json       # Shared TypeScript config
```

## Commands

| Command | Description |
|---|---|
| `make setup` | Interactive project setup |
| `make dev` | Start all dev servers |
| `make dev-web` | Start only frontend |
| `make dev-server` | Start only backend |
| `make build` | Build all packages |
| `make test` | Run all tests |
| `make lint` | Lint with OxLint |
| `make fmt` | Format with OxFmt |
| `make typecheck` | TypeScript check |
| `make db-generate` | Generate DB migrations |
| `make db-migrate` | Run DB migrations |
| `make clean` | Remove build artifacts |

## Design System

The project includes a dark-theme design system with CSS custom properties in `apps/web/src/app.css`:

- **Colors:** Neutral palette + Indigo accent + Danger/Success tokens
- **Typography:** Inter font from Google Fonts
- **Animations:** `animate-fade-in` and `animate-slide-up` micro-animations
- **Scrollbar:** Custom styled scrollbar
- **Focus:** Custom focus ring on interactive elements

## 🔧 Key Patterns

### Subpath Exports (no barrel files)

```typescript
// ✅ Import only what you need
import { formatRelativeTime } from "@myorg/shared/formatting";
import { LIMITS } from "@myorg/shared/constants";

// ❌ No barrel index — better tree-shaking
import { formatRelativeTime } from "@myorg/shared";
```

### tRPC v11 Pattern

```tsx
import { useTRPC } from "~/lib/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function MyComponent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data } = useQuery(trpc.notes.list.queryOptions());

  const createMutation = useMutation(
    trpc.notes.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.notes.list.queryFilter());
      },
    }),
  );
}
```

### Zustand Store

```typescript
import { create } from "zustand";

interface MyState {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyState>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
```

## 📝 License

MIT
