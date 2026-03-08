/**
 * tRPC initialization — router and procedure factories.
 *
 * @module tRPC
 */
import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
