/**
 * Server entrypoint — Hono HTTP server with tRPC middleware.
 *
 * @module Server
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { trpcServer } from "@hono/trpc-server";

import { API_DEFAULTS } from "@starter/contracts";

import { appRouter } from "./routers";

// Run migrations on startup (creates tables if they don't exist)
import "./db/migrate";

const app = new Hono();

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use("*", logger());
app.use(
    "*",
    cors({
        origin: ["http://localhost:5173"],
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["Content-Type"],
    }),
);

// ---------------------------------------------------------------------------
// tRPC API
// ---------------------------------------------------------------------------

app.use(
    `${API_DEFAULTS.trpcPath}/*`,
    trpcServer({
        router: appRouter,
    }),
);

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

const port = Number(process.env.PORT ?? API_DEFAULTS.port);

console.log(`🚀 Server running at http://localhost:${port}`);
console.log(`   tRPC endpoint: http://localhost:${port}${API_DEFAULTS.trpcPath}`);

export default {
    port,
    fetch: app.fetch,
};
