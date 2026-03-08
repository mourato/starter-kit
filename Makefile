.PHONY: setup dev dev-web dev-server build test lint fmt typecheck db-generate db-migrate clean

# Initial project setup (interactive)
setup:
	@chmod +x setup.sh && ./setup.sh

# ── Development ──────────────────────────────────────────────────────────────

dev:
	bun run dev

dev-web:
	bun run dev:web

dev-server:
	bun run dev:server

# ── Build & Quality ──────────────────────────────────────────────────────────

build:
	bun run build

test:
	bun run test

lint:
	bun run lint

fmt:
	bun run fmt

typecheck:
	bun run typecheck

# ── Database ─────────────────────────────────────────────────────────────────

db-generate:
	bun run db:generate

db-migrate:
	bun run db:migrate

# ── Cleanup ──────────────────────────────────────────────────────────────────

clean:
	bun run clean
