/**
 * Database migration script.
 *
 * Creates tables if they don't exist. Run with: bun run db:migrate
 *
 * @module Migrate
 */
import { db } from "./index";
import { sql } from "drizzle-orm";

console.log("Running migrations...");

db.run(sql`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

console.log("Migrations complete.");
