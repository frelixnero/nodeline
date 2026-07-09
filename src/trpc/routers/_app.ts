
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import { workFlowsRouter } from '@/features/workflows/server/routers';


export const appRouter = createTRPCRouter({
   workflows: workFlowsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;