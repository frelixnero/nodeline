import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { createAnthropic } from "@ai-sdk/anthropic";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { AnthropicChannel } from "@/inngest/channels/anthropic";
import {
    AI_REQUEST_TIMEOUT_MS,
    toNonRetriableError,
} from "@/features/executions/lib/ai-errors";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
    const jsonStringified = JSON.stringify(context, null, 2);
    const safestring = new Handlebars.SafeString(jsonStringified);

     
    return safestring;
} );


type AnthropicData = {
    variableName?: string;
    model?: string;
    credentialId: string;
    systemPrompt?: string;
    userPrompt?: string;
}


export const AnthropicExecutor: NodeExecutor<AnthropicData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {

    await publish(
        AnthropicChannel().status({
            nodeId, 
            status: "loading"
        })
    )

    if (!data.variableName) {
        await publish (
            AnthropicChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("Anthropic node: Variable Name is missing ")
    }

    if (!data.credentialId) {
            await publish (
                AnthropicChannel().status({
                    nodeId,
                    status: "error"
                })
            );
            throw new NonRetriableError("Anthropic Node: Credential is missing ")
        }
    

    if (!data.userPrompt) {
        await publish(
            AnthropicChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("Anthropic Node: User Prompt is missing")
    }

    const systemPrompt = data.systemPrompt 
        ? Handlebars.compile(data.systemPrompt)(context)
        :"You are a good assistant"


    const userPrompt = Handlebars.compile(data.userPrompt)(context)

    const credential = await step.run(`get-credential-${nodeId}`, () => {
        return prisma.credential.findUnique({
            where: {
                id: data.credentialId
            }
        })
    })

    if (!credential) {
        await publish(
            AnthropicChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("Anthropic node: Credential not found")
    }
    

    const anthropic = createAnthropic({
        apiKey: credential.value,
    });

    try {
        const model = anthropic(data.model || "claude-sonnet-4-5");

        const { steps } = await step.ai.wrap(
            `anthropic-generate-text-${nodeId}`,
            async (args: Parameters<typeof generateText>[0]) => {
                try {
                    return await generateText({
                        ...args,
                        abortSignal: AbortSignal.timeout(AI_REQUEST_TIMEOUT_MS),
                    });
                } catch (error) {
                    // Throw inside the step so Inngest does not retry permanent errors.
                    throw toNonRetriableError(error);
                }
            },
            {
                model,
                system: systemPrompt,
                prompt: userPrompt,
                maxRetries: 0,
                experimental_telemetry: {
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true,
                }
            }
        );

        const text = 
            steps[0].content[0].type === "text" 
                ? steps[0].content[0].text 
                : ""
        await publish(
           AnthropicChannel().status({
                nodeId,
                status: "success"
            })
        );

        return {
            ...context,
            [data.variableName]: {
                text,
            }
        }
    } catch (e) {
        await publish(
            AnthropicChannel().status({
                nodeId,
                status: `error`
            })
        );
        throw toNonRetriableError(e);
    }
}
