"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime"; 
import { httpRequestChannel } from "@/inngest/channels/http-request";
import  { inngest } from "@/inngest/client";


export type NodeStatusToken = Realtime.Token<
    typeof httpRequestChannel,
    ["status"]
>


export async function fetchNodeStatusRealtimeToken(): Promise<NodeStatusToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: httpRequestChannel(),
        topics: ["status"],
    });

    return token
} 
