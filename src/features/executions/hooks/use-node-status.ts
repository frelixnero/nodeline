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

        // `data` arrives in chronological order, so the last matching message
        // is the newest one. Relying on a timestamp sort here is unreliable:
        // `loading` and `error` can share the same millisecond, and a stable
        // sort would then keep the older `loading` message first.
        let latestStatus: NodeStatus | undefined;

        for (const message of data) {
            if (
                message.kind !== "data" ||
                message.channel !== channel ||
                message.topic !== topic ||
                message.data.nodeId !== nodeId
            ) {
                continue;
            }

            latestStatus = message.data.status as NodeStatus;
        }

        if (latestStatus) {
            setStatus(latestStatus);
        }
     }, [data, nodeId, channel, topic]);

     return status;
}
