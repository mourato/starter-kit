/**
 * Database connection — Drizzle ORM + Bun SQLite.
 *
 * Uses Bun's native SQLite bindings via FFI for maximum performance.
 *
 * @module Database
 */
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const sqlite = new Database("data.db", { create: true });

// Enable WAL mode for better concurrent read performance
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA foreign_keys = ON;");

export const db = drizzle(sqlite, { schema });
