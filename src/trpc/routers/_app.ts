
import { credentialsRouter } from '@/features/credentials/server/routers';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import { workFlowsRouter } from '@/features/workflows/server/routers';
import { ExecutionsRouter } from '@/features/executions/server/routers';


export const appRouter = createTRPCRouter({
   workflows: workFlowsRouter,
   credentials: credentialsRouter,
   executions: ExecutionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;