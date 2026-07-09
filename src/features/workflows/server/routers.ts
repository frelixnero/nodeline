import prisma from "@/lib/db";
import { createTRPCRouter, premiumProcedure, protectedProcedure } from "@/trpc/init";
import z from "zod";

export const workFlowsRouter = createTRPCRouter({
    create: premiumProcedure.mutation(({ctx}) => {
        return prisma.workFLow.create({
            data: {
                name: "TODO",
                userId: ctx.auth.user.id,

            }  
        })
    }),
    remove: protectedProcedure.input(z.object({id: z.string()})).mutation(({ctx, input}) => {
        return prisma.workFLow.delete({
            where: {
                id: input.id,
                userId: ctx.auth.user.id
            }
        })
    }),
    updateName: protectedProcedure.input(z.object({id: z.string(), name: z.string().min(1)}))
    .mutation(({ ctx, input }) => {
        return prisma.workFLow.update({
            where: {
                id: input.id, userId: ctx.auth.user.id
            },
            data: {
                name: input.name
            }
        });
    }),
    getOne: protectedProcedure.input(z.object({id: z.string(), }))
    .mutation(({ ctx, input }) => {
        return prisma.workFLow.findUnique({
            where: {
                id: input.id, userId: ctx.auth.user.id
            },
            
        });
    }),
    getMany: protectedProcedure.
        query(({ ctx, }) => {
            return prisma.workFLow.findMany({
                where: {
                    userId: ctx.auth.user.id
                }
        });
    })
}) 