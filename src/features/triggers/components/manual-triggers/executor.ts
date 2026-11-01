import type { NodeExecutor } from "@/features/executions/types";
import { httpRequestChannel } from "@/inngest/channels/http-request";

type manualTriggerData = Record<string, unknown>

export const manualTriggerExecutor: NodeExecutor<manualTriggerData> = async ({
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(httpRequestChannel().status({ nodeId, status: "loading" }));

    try {
        const result = await step.run("manual-trigger", async () => context);
        await publish(httpRequestChannel().status({ nodeId, status: "success" }));
        return result;
    } catch (error) {
        await publish(httpRequestChannel().status({ nodeId, status: "error" }));
        throw error;
    }

}
