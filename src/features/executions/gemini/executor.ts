import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import Handlebars from "handlebars";
import { geminiChannel } from "@/inngest/channels/gemini";
import { generateText } from "ai";
import prisma from "@/lib/db";
import {
    AI_REQUEST_TIMEOUT_MS,
    toNonRetriableError,
} from "@/features/executions/lib/ai-errors";

Handlebars.registerHelper("json", (context) => {
    const jsonStringified = JSON.stringify(context, null, 2);
    const safestring = new Handlebars.SafeString(jsonStringified);

     
    return safestring;
} );
 

type GeminiData = {
    variableName?: string;
    model?: string;
    credentialId: string;
    systemPrompt?: string;
    userPrompt?: string;
}


export const geminiExecutor: NodeExecutor<GeminiData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {

    await publish(
        geminiChannel().status({
            nodeId, 
            status: "loading"
        })
    )

    if (!data.variableName) {
        await publish (
            geminiChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("Gemini Node: Variable Name is missing ")
    }

    if (!data.credentialId) {
        await publish (
            geminiChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("Gemini Node: Credential is missing ")
    }

    if (!data.userPrompt) {
        await publish(
            geminiChannel().status({
                nodeId,
                status: "error"
            })
        );
        throw new NonRetriableError("Gemini Node: User Prompt is missing")
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
        throw new NonRetriableError("Gemini node: Credential not found")
    }


    // fecth credential that user selected
    
    const google = createGoogleGenerativeAI({
        apiKey: credential.value,

    });

    try {
        const { steps } = await step.ai.wrap(
            `gemini-generate-text-${nodeId}`,
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
                model: google(data.model || "gemini-3.5-flash-lite"),
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
            geminiChannel().status({
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
            geminiChannel().status({
                nodeId,
                status: `error`
            })
        );
        throw toNonRetriableError(e);
    }
}
