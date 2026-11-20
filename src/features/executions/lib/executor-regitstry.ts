import { NodeType } from "@/generated/prisma/enums";
import { NonRetriableError } from "inngest";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-triggers/executor";
import { HTTPRequestExecutor } from "../components/http-requests/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { geminiExecutor } from "../components/gemini/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { openAIExecutor } from "../components/openai/executor";
import { AnthropicExecutor } from "../anthropic/executor";
import { DiscordExecutor } from "../components/discord/executor";
import { SlackExecutor } from "../components/slack/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
    [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
    [NodeType.HTTP_REQUEST]: HTTPRequestExecutor,
    [NodeType.INITIAL]: manualTriggerExecutor,
    [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
    [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor   , // Placeholder executor for Stripe Trigger
    [NodeType.GEMINI]: geminiExecutor, // Placeholder executor for Gemini
    [NodeType.ANTHROPIC]: AnthropicExecutor, // Placeholder executor for Anthropic
    [NodeType.OPENAI]: openAIExecutor,
    [NodeType.DISCORD]: DiscordExecutor,
    [NodeType.SLACK]: SlackExecutor,
    
}


export const getExecutor = (type: NodeType): NodeExecutor => {
    const executor = executorRegistry[type];
    if (!executor) {
        throw new Error(`No executor found for node type: ${type}`)
    }

    return executor
} 
