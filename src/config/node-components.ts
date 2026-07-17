import { InitialNode } from "@/components/initial-node";
import { NodeType } from "@/generated/prisma/browser";
import type { NodeTypes } from "@xyflow/react";

import { HttpRequestNode } from "@/features/executions/componets/http-requests/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-triggers/node";

export const nodeComponents = {
    [NodeType.INITIAL]: InitialNode,
    [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
    [NodeType.HTTP_REQUEST]: HttpRequestNode,
} as const satisfies NodeTypes

export type RegisteredNodeType = keyof typeof nodeComponents; 