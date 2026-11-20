 "use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime"; 
import  { inngest } from "@/inngest/client";
import { openAIChannel } from "@/inngest/channels/openai";


export type openAIToken = Realtime.Token<
    typeof openAIChannel,
    ["status"]
>


export async function fetchOpenAIRealtimeToken(): Promise<openAIToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: openAIChannel(),
        topics: ["status"],
    });

    return token
} 
