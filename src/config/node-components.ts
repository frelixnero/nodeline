import { InitialNode } from "@/components/initial-node";
import { NodeType } from "@/generated/prisma/browser";
import type { NodeTypes } from "@xyflow/react";

import { HttpRequestNode } from "@/features/executions/http-requests/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-triggers/node";
import { GoogleFormTriggerNode } from "@/features/triggers/components/google-form-trigger/node";

export const nodeComponents = {
    [NodeType.INITIAL]: InitialNode,
    [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
    [NodeType.HTTP_REQUEST]: HttpRequestNode,
    [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
} as const satisfies NodeTypes

export type RegisteredNodeType = keyof typeof nodeComponents;  