import type { NodeExecutor, NodeExecutorParams } from "@/features/executions/componets/types";
import { contextFromJSON } from "@polar-sh/sdk/models/components/validationerror.js";

type manualTriggerData = Record<string, unknown>

export const manualTriggerExecutor: NodeExecutor<manualTriggerData> = async ({
    data,
    nodeId,
    context,
    step
}) => {
    const result = await step.run("manual-trigger", async () => context)

    // Publish success state for manual trigger
    return result
}