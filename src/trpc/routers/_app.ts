import { z } from 'zod';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '../init';
import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';

// google ai
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';


export const appRouter = createTRPCRouter({
    testAi: protectedProcedure.mutation( async ()=>{
       await inngest.send({
        name: "execute/ai",
       })
       return {sucess:true, message: "Job Queued"}
    }),
    getWorkFlows: protectedProcedure
        // .input(
        //     z.object({
        //         text: z.string(),
        //     }),
        // )
        .query(({ctx}) => {
            console.log("User Id", ctx.auth.user.id);
            return prisma.workFLow.findMany({});
        }),

    createWorkFlows: protectedProcedure.mutation(async () => {
        await inngest.send({
            name: "test/hello.world",
            data:{
                email:"nero@mail.coom"
            }
        })
        

        return {sucess:true, message: "Job Queued"}
    })
});

// export type definition of API
export type AppRouter = typeof appRouter;