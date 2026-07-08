import { betterAuth } from "better-auth";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import prisma from "@/lib/db";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {polarClient} from "./polar";

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
    },
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "06190cbe-d86a-4a7d-bba8-35dfe89a3f2a",
                            slug: "Nodeflow-Pro"
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly: true,
                }),
                portal()
            ]

        })
    ]
})