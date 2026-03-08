/**
 * Contracts — Shared schemas and types.
 *
 * This package contains ONLY Zod schemas and TypeScript types.
 * No runtime logic should live here.
 *
 * @module Contracts
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Note schemas
// ---------------------------------------------------------------------------

export const NoteSchema = z.object({
    id: z.number(),
    title: z.string().min(1),
    content: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const CreateNoteSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().default(""),
});

export const UpdateNoteSchema = z.object({
    id: z.number(),
    title: z.string().min(1).optional(),
    content: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type Note = z.infer<typeof NoteSchema>;
export type CreateNote = z.infer<typeof CreateNoteSchema>;
export type UpdateNote = z.infer<typeof UpdateNoteSchema>;

// ---------------------------------------------------------------------------
// API config
// ---------------------------------------------------------------------------

export const API_DEFAULTS = {
    port: 3000,
    trpcPath: "/trpc",
} as const;
