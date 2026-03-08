/**
 * tRPC client — React Query integration (tRPC v11 pattern).
 *
 * @module tRPC
 */
import { createTRPCContext } from "@trpc/tanstack-react-query";

import type { AppRouter } from "@starter/server/src/routers";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
