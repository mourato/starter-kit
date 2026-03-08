/**
 * Notes router — CRUD operations for notes.
 *
 * @module NotesRouter
 */
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";

import { CreateNoteSchema, UpdateNoteSchema } from "@starter/contracts";

import { db } from "../db";
import { notes } from "../db/schema";
import { publicProcedure, router } from "../trpc";

export const notesRouter = router({
    /**
     * List all notes, newest first.
     */
    list: publicProcedure.query(async () => {
        return db.select().from(notes).orderBy(desc(notes.createdAt));
    }),

    /**
     * Get a single note by ID.
     */
    getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
            const [note] = await db
                .select()
                .from(notes)
                .where(eq(notes.id, input.id))
                .limit(1);

            if (!note) {
                throw new Error(`Note with id ${input.id} not found`);
            }

            return note;
        }),

    /**
     * Create a new note.
     */
    create: publicProcedure.input(CreateNoteSchema).mutation(async ({ input }) => {
        const [created] = await db
            .insert(notes)
            .values({
                title: input.title,
                content: input.content,
            })
            .returning();

        return created!;
    }),

    /**
     * Update an existing note.
     */
    update: publicProcedure.input(UpdateNoteSchema).mutation(async ({ input }) => {
        const { id, ...updates } = input;

        const [updated] = await db
            .update(notes)
            .set({
                ...updates,
                updatedAt: sql`datetime('now')`,
            })
            .where(eq(notes.id, id))
            .returning();

        if (!updated) {
            throw new Error(`Note with id ${id} not found`);
        }

        return updated;
    }),

    /**
     * Delete a note by ID.
     */
    delete: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
            const [deleted] = await db
                .delete(notes)
                .where(eq(notes.id, input.id))
                .returning();

            if (!deleted) {
                throw new Error(`Note with id ${input.id} not found`);
            }

            return deleted;
        }),
});
