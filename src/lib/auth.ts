import { betterAuth } from "better-auth";
import prisma from "@/lib/db";
import { prismaAdapter } from "better-auth/adapters/prisma";

const trustedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
];

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    }
})