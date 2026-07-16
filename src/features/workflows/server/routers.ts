import { PAGINATION } from "@/config/constant";
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
        input(
            z.object({
                page: z.number().default(PAGINATION.DEFAULT_PAGE),
                pageSize: z.number().min(PAGINATION.MIN_PAGE_SIZE)
                .max(PAGINATION.MAX_PAGE_SIZE)
                .default(PAGINATION.DEFAULT_PAGE_SIZE),
                search: z.string().default("")
            })
        ).
        query(async({ ctx, input}) => {
            const { page, pageSize, search } = input;

            const [items, totalCount] = await Promise.all([
                prisma.workFLow.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: {
                        userId: ctx.auth.user.id,
                        name: {
                            contains: search,
                            mode: "insensitive",

                        },
                    },
                    orderBy: {
                        updatedAt: "desc",
                    },

                }),
                prisma.workFLow.count({
                    where: {
                        userId: ctx.auth.user.id,
                        name: {
                            contains: search,
                            mode: "insensitive",

                        },
                    }
                }),
            ]);
            const totalPages = Math.ceil(totalCount / pageSize);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            // Map
            return {
                items: items,
                page, 
                pageSize,
                totalCount,
                totalPages,
                hasNextPage,
                hasPreviousPage,
            }
    })
}) 