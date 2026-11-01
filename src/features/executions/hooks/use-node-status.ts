import type { Realtime } from "@inngest/realtime";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { useEffect, useState } from "react";
import type { NodeStatus } from "@/components/react-flow/node-status-indicator"


interface UseNodeStatusOptions {
    nodeId: string;
    channel: string;
    topic: string;
    refreshToken: () => Promise<Realtime.Subscribe.Token >;
}

export function useNodeStatus({
    nodeId,
    channel,
    topic,
    refreshToken,
}: UseNodeStatusOptions) {
     const [status, setStatus] = useState<NodeStatus>("initial")

      const { data, state, error } = useInngestSubscription({
         refreshToken,
         enabled: true,

      });

      useEffect(() => {
         if (error) {
             console.error(`[Inngest realtime] ${channel}/${topic} subscription failed`, error);
         } else if (process.env.NODE_ENV === "development") {
             console.debug(`[Inngest realtime] ${channel}/${topic} subscription: ${state}`);
         }
      }, [channel, topic, state, error]);

     useEffect(() => {
        if (!data?.length){
            return;
        }
        const latestMessage = data
        .filter(
            (msg) => 
                msg.kind === "data" &&
                msg.channel === channel &&
                msg.topic === topic &&
                msg.data.nodeId === nodeId, 
        )
        .sort(
            (a,b) => {
                if (a.kind === "data" && b.kind === "data") {
                    return (
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

                    );
                }
                return 0;
            }
        )[0]

        if (latestMessage?.kind === "data") {
            setStatus(latestMessage.data.status as NodeStatus);
        }
     }, [data, nodeId, channel, topic]);

     return status;
}
