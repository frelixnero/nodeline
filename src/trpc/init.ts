import { auth } from '@/lib/auth';
import { polarClient } from '@/lib/polar';
import { initTRPC, TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
import { cache } from 'react';

export const createTRPCContext = cache(async () => {
    /**
     * @see: https://trpc.io/docs/server/context
     */
    return { userId: 'user_123' };
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    // transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async({ctx, next}) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session){
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "UNAUTHORIZED: You must be logged in to access this resource",
        })
    }

    return next({ctx: {...ctx, auth: session}});
})

export const premiumProcedure = protectedProcedure.use(
    async({ctx, next}) => {
        let customer;
        try {
            customer = await polarClient.customers.getStateExternal({
                externalId: ctx.auth.user.id,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const isMissingCustomer =
                message.includes("ResourceNotFound") ||
                message.includes("Not found");

            // Treat missing Polar customer as non-premium access for gated procedures.
            if (isMissingCustomer) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "FORBIDDEN: You must have an active subscription to access this resource",
                });
            }

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to validate subscription status",
                cause: error,
            });
        }

        if (
            !customer.activeSubscriptions ||
            customer.activeSubscriptions.length === 0
        ) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "FORBIDDEN: You must have an active subscription to access this resource",
            });
        }
        return next({ctx: {...ctx, customer}});
    },
);