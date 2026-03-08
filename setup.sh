#!/usr/bin/env bash
set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────────────────────
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'

CHECK="✓"
CROSS="✗"
ARROW="→"

# ─── Utilities ───────────────────────────────────────────────────────────────
sedi() {
  if [[ "$OSTYPE" == darwin* ]]; then sed -i '' "$@"; else sed -i "$@"; fi
}

print_header() {
  echo ""
  echo -e "${MAGENTA}${BOLD}$1${RESET}"
  echo -e "${DIM}$(printf '─%.0s' $(seq 1 50))${RESET}"
}

print_step()    { echo -e "  ${CYAN}${ARROW}${RESET} $1"; }
print_success() { echo -e "  ${GREEN}${CHECK}${RESET} $1"; }
print_warn()    { echo -e "  ${YELLOW}!${RESET} $1"; }
print_error()   { echo -e "  ${RED}${CROSS}${RESET} $1"; exit 1; }

prompt() {
  local msg="$1" default="$2" result
  if [[ -n "$default" ]]; then
    echo -en "  ${WHITE}${msg}${RESET} ${DIM}(${default})${RESET}: "
  else
    echo -en "  ${WHITE}${msg}${RESET}: "
  fi
  read -r result
  echo "${result:-$default}"
}

prompt_option() {
  local msg="$1"; shift; local opts=("$@") choice
  echo -e "\n  ${WHITE}${msg}${RESET}"
  for i in "${!opts[@]}"; do
    echo -e "    ${CYAN}$((i + 1)))${RESET} ${opts[$i]}"
  done
  echo -en "  ${DIM}Choose [1-${#opts[@]}]${RESET}: "
  read -r choice
  if [[ -z "$choice" ]] || ! [[ "$choice" =~ ^[0-9]+$ ]] || [[ "$choice" -lt 1 || "$choice" -gt "${#opts[@]}" ]]; then
    echo "1"
  else
    echo "$choice"
  fi
}

prompt_yn() {
  local msg="$1" default="${2:-y}" result
  if [[ "$default" == "y" ]]; then
    echo -en "  ${WHITE}${msg}${RESET} ${DIM}[Y/n]${RESET}: "
  else
    echo -en "  ${WHITE}${msg}${RESET} ${DIM}[y/N]${RESET}: "
  fi
  read -r result
  result="${result:-$default}"
  result=$(echo "$result" | tr 'A-Z' 'a-z')
  [[ "$result" == "y" || "$result" == "yes" ]]
}

# ─── Generators ──────────────────────────────────────────────────────────────

generate_web_no_backend() {
  rm -f apps/web/src/lib/trpc.ts

  cat > apps/web/src/main.tsx << 'EOF'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./app.css";

const queryClient = new QueryClient();
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Missing #root element");

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
EOF

  cat > apps/web/vite.config.ts << 'EOF'
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tanstackRouter(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", { target: "19" }]],
      },
    }),
    tailwindcss(),
  ],
  resolve: { tsconfigPaths: true },
  server: { port: 5173, strictPort: true },
  build: { outDir: "dist", emptyOutDir: true },
});
EOF

  cat > apps/web/src/routes/index.tsx << 'EOF'
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center animate-fade-in">
      <Sparkles className="w-12 h-12 text-accent mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-text mb-3">Welcome</h1>
      <p className="text-text-muted mb-8">
        Your project is ready. Start building something amazing.
      </p>
      <p className="text-xs text-text-dim">
        Edit <code className="text-accent">src/routes/index.tsx</code> to get started.
      </p>
    </div>
  );
}
EOF

  # Remove tRPC deps from web package.json
  if command -v bun &>/dev/null; then
    bun -e "
      const pkg = await Bun.file('apps/web/package.json').json();
      for (const dep of ['@trpc/client', '@trpc/tanstack-react-query']) {
        delete pkg.dependencies?.[dep];
      }
      await Bun.write('apps/web/package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
  fi
}

generate_electron_skeleton() {
  mkdir -p apps/desktop/src

  cat > apps/desktop/package.json << EOF
{
  "name": "${PACKAGE_SCOPE}/desktop",
  "version": "0.1.0",
  "private": true,
  "main": "dist/main.js",
  "scripts": {
    "dev": "electron .",
    "build": "tsdown src/main.ts src/preload.ts --format cjs --clean",
    "typecheck": "tsc --noEmit",
    "test": "vitest run --passWithNoTests"
  },
  "dependencies": {
    "electron": "^40.6.0",
    "electron-updater": "^6.6.2"
  },
  "devDependencies": {
    "@types/node": "^24.10.13",
    "tsdown": "^0.20.3",
    "typescript": "^5.7.3",
    "vitest": "^4.0.0"
  }
}
EOF

  cat > apps/desktop/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
EOF

  cat > apps/desktop/src/main.ts << EOF
import { app, BrowserWindow } from "electron";
import path from "node:path";

const DEV_URL = "http://localhost:5173";

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "${PROJECT_NAME}",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === "development") {
    win.loadURL(DEV_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../apps/web/dist/index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
EOF

  cat > apps/desktop/src/preload.ts << 'EOF'
import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("platform", {
  name: process.platform,
  isDesktop: true,
});
EOF
}

generate_postgres_db() {
  cat > apps/server/src/db/index.ts << 'EOF'
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? "postgresql://localhost:5432/app";
export const db = drizzle(connectionString, { schema });
EOF

  cat > apps/server/drizzle.config.ts << 'EOF'
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/app",
  },
} satisfies Config;
EOF

  sedi 's|"drizzle-orm/sqlite-core"|"drizzle-orm/pg-core"|g' apps/server/src/db/schema.ts
  sedi "s|sqliteTable|pgTable|g" apps/server/src/db/schema.ts
  sedi "s|integer(\"id\").primaryKey({ autoIncrement: true })|serial(\"id\").primaryKey()|g" apps/server/src/db/schema.ts
  sedi "s|text(\"created_at\")|timestamp(\"created_at\", { withTimezone: true })|g" apps/server/src/db/schema.ts
  sedi "s|text(\"updated_at\")|timestamp(\"updated_at\", { withTimezone: true })|g" apps/server/src/db/schema.ts
  sedi "s|(datetime('now'))|CURRENT_TIMESTAMP|g" apps/server/src/db/schema.ts
}

generate_cms_config() {
  local cms="$1"
  mkdir -p docs
  cat > docs/CMS_SETUP.md << EOF
# CMS Integration: ${cms}

This project was configured to use **${cms}** as a headless CMS.

## Setup Instructions

EOF

  case "$cms" in
    payload)
      cat >> docs/CMS_SETUP.md << 'EOF'
1. Install Payload CMS:
   ```bash
   bun add payload @payloadcms/richtext-lexical @payloadcms/db-sqlite
   ```
2. Create a `payload.config.ts` in `apps/server/src/`.
3. See: https://payloadcms.com/docs
EOF
      ;;
    sanity)
      cat >> docs/CMS_SETUP.md << 'EOF'
1. Install Sanity client:
   ```bash
   bun add @sanity/client next-sanity
   ```
2. Create a Sanity project at https://www.sanity.io
3. Add `SANITY_PROJECT_ID` and `SANITY_DATASET` to your `.env`.
4. See: https://www.sanity.io/docs
EOF
      ;;
    wordpress)
      cat >> docs/CMS_SETUP.md << 'EOF'
1. Set up a WordPress instance with WPGraphQL plugin.
2. Add `WORDPRESS_URL` to your `.env`.
3. Use `@tanstack/react-query` to fetch from the GraphQL API.
4. See: https://www.wpgraphql.com
EOF
      ;;
  esac
}

generate_auth_config() {
  mkdir -p apps/server/src/auth
  cat > apps/server/src/auth/index.ts << 'EOF'
/**
 * Authentication — Better Auth scaffold.
 *
 * Install: bun add better-auth
 * Docs: https://www.better-auth.com
 *
 * @module Auth
 */

// TODO: Configure Better Auth
// import { betterAuth } from "better-auth";
//
// export const auth = betterAuth({
//   database: { ... },
//   emailAndPassword: { enabled: true },
// });

export {};
EOF
  print_warn "Auth scaffold created. Install better-auth and configure it in apps/server/src/auth/index.ts"
}

# ─── Main ────────────────────────────────────────────────────────────────────

main() {
  # Prerequisites
  if [[ ! -f "package.json" ]] || ! grep -q '@starter/monorepo' package.json 2>/dev/null; then
    print_error "Run this script from the starter-kit root directory."
  fi
  if ! command -v bun &>/dev/null; then
    print_error "Bun is required. Install: https://bun.sh"
  fi

  clear
  echo ""
  echo -e "${MAGENTA}${BOLD}  ╔═══════════════════════════════════════════╗${RESET}"
  echo -e "${MAGENTA}${BOLD}  ║        ✦  Starter Kit Setup  ✦           ║${RESET}"
  echo -e "${MAGENTA}${BOLD}  ╚═══════════════════════════════════════════╝${RESET}"
  echo ""
  echo -e "  ${DIM}Configure your project interactively.${RESET}"
  echo -e "  ${DIM}Press Enter to accept defaults.${RESET}"

  # ── Questions ────────────────────────────────────────────────────────────
  print_header "⚙ Project Identity"
  PROJECT_NAME=$(prompt "Project name" "my-app")
  PACKAGE_SCOPE=$(prompt "Package scope" "@${PROJECT_NAME}")
  PROJECT_DESC=$(prompt "Description" "A fullstack TypeScript project")

  print_header "⚙ Architecture"

  PLATFORM_CHOICE=$(prompt_option "Project platform:" "Web only" "Desktop (Electron)" "Web + Desktop")
  case "$PLATFORM_CHOICE" in
    2) PLATFORM="desktop" ;; 3) PLATFORM="both" ;; *) PLATFORM="web" ;;
  esac

  if [[ "$PLATFORM" == "desktop" ]]; then
    INCLUDE_BACKEND=true
    print_step "Backend auto-enabled for desktop apps"
  else
    prompt_yn "Include backend (Hono + tRPC)?" && INCLUDE_BACKEND=true || INCLUDE_BACKEND=false
  fi

  if [[ "$INCLUDE_BACKEND" == true ]]; then
    DB_CHOICE=$(prompt_option "Database:" "SQLite (local, recommended)" "PostgreSQL" "None")
    case "$DB_CHOICE" in 2) DATABASE="postgres" ;; 3) DATABASE="none" ;; *) DATABASE="sqlite" ;; esac
    prompt_yn "Include authentication?" "n" && INCLUDE_AUTH=true || INCLUDE_AUTH=false
  else
    DATABASE="none"
    INCLUDE_AUTH=false
  fi

  CMS_CHOICE=$(prompt_option "CMS integration:" "None" "Payload CMS" "Sanity" "Headless WordPress")
  case "$CMS_CHOICE" in 2) CMS="payload" ;; 3) CMS="sanity" ;; 4) CMS="wordpress" ;; *) CMS="none" ;; esac

  prompt_yn "Initialize Git repository?" && GIT_INIT=true || GIT_INIT=false

  # ── Summary ──────────────────────────────────────────────────────────────
  print_header "📋 Summary"
  echo -e "  ${BOLD}Project:${RESET}   ${PROJECT_NAME} (${PACKAGE_SCOPE})"
  echo -e "  ${BOLD}Platform:${RESET}  ${PLATFORM}"
  echo -e "  ${BOLD}Backend:${RESET}   $([[ "$INCLUDE_BACKEND" == true ]] && echo "Hono + tRPC" || echo "None")"
  echo -e "  ${BOLD}Database:${RESET}  ${DATABASE}"
  echo -e "  ${BOLD}Auth:${RESET}      $([[ "$INCLUDE_AUTH" == true ]] && echo "Better Auth" || echo "None")"
  echo -e "  ${BOLD}CMS:${RESET}       ${CMS}"
  echo ""
  if ! prompt_yn "Proceed?"; then
    print_warn "Cancelled."; exit 0
  fi

  # ── Execute ──────────────────────────────────────────────────────────────
  echo ""
  print_header "🔨 Configuring"

  # 1. Rename scope
  print_step "Renaming scope to ${PACKAGE_SCOPE}..."
  find . \( -name '*.json' -o -name '*.ts' -o -name '*.tsx' -o -name '*.md' -o -name '*.css' \) \
    -not -path '*/node_modules/*' -not -path '*/.git/*' -print0 2>/dev/null |
    xargs -0 grep -l '@starter' 2>/dev/null | while read -r f; do
      sedi "s|@starter|${PACKAGE_SCOPE}|g" "$f"
    done
  print_success "Scope updated"

  # 2. Project name
  print_step "Updating project name..."
  sedi "s|\"Starter\"|\"${PROJECT_NAME}\"|g" packages/shared/src/constants.ts 2>/dev/null || true
  sedi "s|<title>Starter</title>|<title>${PROJECT_NAME}</title>|g" apps/web/index.html 2>/dev/null || true
  print_success "Name updated"

  # 3. Backend
  if [[ "$INCLUDE_BACKEND" == false ]]; then
    print_step "Removing backend..."
    rm -rf apps/server
    generate_web_no_backend
    print_success "Backend removed"
  fi

  # 4. Database
  if [[ "$INCLUDE_BACKEND" == true && "$DATABASE" == "none" ]]; then
    print_step "Removing database layer..."
    rm -rf apps/server/src/db apps/server/drizzle.config.ts
    sedi '/db\/migrate/d' apps/server/src/index.ts 2>/dev/null || true
    print_success "Database removed"
  elif [[ "$INCLUDE_BACKEND" == true && "$DATABASE" == "postgres" ]]; then
    print_step "Switching to PostgreSQL..."
    generate_postgres_db
    print_success "PostgreSQL configured"
  fi

  # 5. Desktop
  if [[ "$PLATFORM" == "desktop" || "$PLATFORM" == "both" ]]; then
    print_step "Creating Electron skeleton..."
    generate_electron_skeleton
    print_success "Electron created"
  fi

  # 6. CMS
  if [[ "$CMS" != "none" ]]; then
    print_step "Adding CMS setup guide..."
    generate_cms_config "$CMS"
    print_success "CMS docs added"
  fi

  # 7. Auth
  if [[ "$INCLUDE_AUTH" == true ]]; then
    print_step "Adding auth scaffold..."
    generate_auth_config
    print_success "Auth scaffold added"
  fi

  # 8. Clean setup files
  print_step "Cleaning up..."
  rm -f setup.sh
  sedi '/^setup:/,/^\$/d' Makefile 2>/dev/null || true
  sedi '/Initial project setup/d' Makefile 2>/dev/null || true
  print_success "Setup files cleaned"

  # 9. Git
  if [[ "$GIT_INIT" == true ]]; then
    print_step "Initializing Git..."
    [[ -d .git ]] && rm -rf .git
    git init -q && git add -A && git commit -q -m "feat: initial project setup"
    print_success "Git initialized"
  fi

  # ── Done ─────────────────────────────────────────────────────────────────
  echo ""
  echo -e "${GREEN}${BOLD}  ╔═══════════════════════════════════════════╗${RESET}"
  echo -e "${GREEN}${BOLD}  ║          ${CHECK} Setup Complete!               ║${RESET}"
  echo -e "${GREEN}${BOLD}  ╚═══════════════════════════════════════════╝${RESET}"
  echo ""
  echo -e "  ${BOLD}Next steps:${RESET}"
  echo -e "    ${CYAN}1.${RESET} bun install"
  if [[ "$INCLUDE_BACKEND" == true && "$DATABASE" != "none" ]]; then
    echo -e "    ${CYAN}2.${RESET} make db-migrate"
    echo -e "    ${CYAN}3.${RESET} make dev"
  else
    echo -e "    ${CYAN}2.${RESET} make dev"
  fi
  echo ""
  echo -e "  ${DIM}Happy coding! 🚀${RESET}"
  echo ""
}

main "$@"
