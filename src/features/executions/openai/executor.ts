import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { createOpenAI } from "@ai-sdk/openai";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { openAIChannel } from "@/inngest/channels/openai";
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


type OpenAIData = {
    variableName?: string;
    model?: string;
    credentialId?: string;
    systemPrompt?: string;
    userPrompt?: string;
}


export const openAIExecutor: NodeExecutor<OpenAIData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {

    await publish(
        openAIChannel().status({
            nodeId, 
            status: "loading"
        })
    )

    if (!data.variableName) {
        await publish (
            openAIChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("OpenAI node: Variable Name is missing ")
    }
    
    if (!data.credentialId) {
        await publish (
            openAIChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("OpenAI Node: Credential is missing ")
    }

    if (!data.userPrompt) {
        await publish(
            openAIChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("OpenAI Node: User Prompt is missing")
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
            openAIChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("OpenAI node: Credential not found")
    }

    const openai = createOpenAI({
        apiKey: credential.value
    });

    try {
        const model = openai(data.model || "gpt-4.1-mini");

        const { steps } = await step.ai.wrap(
            `openai-generate-text-${nodeId}`,
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
           openAIChannel().status({
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
            openAIChannel().status({
                nodeId,
                status: `error`
            })
        );
        throw toNonRetriableError(e);
    }
}
