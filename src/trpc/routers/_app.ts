import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import prisma from '@/lib/db';

export const appRouter = createTRPCRouter({
    getUsers: protectedProcedure
        // .input(
        //     z.object({
        //         text: z.string(),
        //     }),
        // )
        .query(({ctx}) => {
            console.log("User Id", ctx.auth.user.id);
            return prisma.user.findMany({
                where:{
                    id: ctx.auth.user.id,

                }
            })
        }),
});

// export type definition of API
export type AppRouter = typeof appRouter;