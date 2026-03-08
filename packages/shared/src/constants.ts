/**
 * Application-wide constants shared between server and web.
 *
 * @module Constants
 */

export const APP_NAME = "Starter";

export const LIMITS = {
    noteTitle: 200,
    noteContent: 50_000,
} as const;
