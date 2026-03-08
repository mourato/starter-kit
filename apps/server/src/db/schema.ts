/**
 * Database schema — Drizzle ORM + SQLite.
 *
 * @module Schema
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const notes = sqliteTable("notes", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    content: text("content").notNull().default(""),
    createdAt: text("created_at")
        .notNull()
        .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
        .notNull()
        .default(sql`(datetime('now'))`),
});
