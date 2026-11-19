import { InitialNode } from "@/components/initial-node";
import { NodeType } from "@/generated/prisma/browser";
import type { NodeTypes } from "@xyflow/react";

import { HttpRequestNode } from "@/features/executions/http-requests/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-triggers/node";
import { GoogleFormTriggerNode } from "@/features/triggers/components/google-form-trigger/node";
import { StripeTriggerNode } from "@/features/triggers/components/stripe-trigger/node";
import { GeminiNode } from "@/features/executions/gemini/node";
import { OpenAINode } from "@/features/executions/openai/node";
import { AnthropicNode } from "@/features/executions/anthropic/node";
import { DiscordNode } from "@/features/executions/discord/node";
import { SlackNode } from "@/features/executions/slack/node";

export const nodeComponents = {
    [NodeType.INITIAL]: InitialNode,
    [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
    [NodeType.HTTP_REQUEST]: HttpRequestNode,
    [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
    [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
    [NodeType.GEMINI]: GeminiNode, // Placeholder for Gemini Node
    [NodeType.OPENAI]: OpenAINode,
    [NodeType.ANTHROPIC]: AnthropicNode,
    [NodeType.DISCORD]: DiscordNode,
    [NodeType.SLACK]: SlackNode
    // [NodeType.ANTHROPIC]: Anthr,
} as const satisfies NodeTypes

export type RegisteredNodeType = keyof typeof nodeComponents;  