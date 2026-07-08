import { Polar } from "@polar-sh/sdk";

export const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server:  'sandbox', // CHANGE THIS TO 'production' WHEN WE GO LIVE
})