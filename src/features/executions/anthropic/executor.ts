import type { NodeExecutor } from "@/features/executions/types";
import { anthropic, NonRetriableError } from "inngest";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import Handlebars from "handlebars";import { generateText, modelMessageSchema } from "ai";
import { openAIChannel } from "@/inngest/channels/openai";
import { AnthropicChannel } from "@/inngest/channels/anthropic";

Handlebars.registerHelper("json", (context) => {
    const jsonStringified = JSON.stringify(context, null, 2);
    const safestring = new Handlebars.SafeString(jsonStringified);

     
    return safestring;
} );


type AnthropicData = {
    variableName?: string;
    model?: string;
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
        throw new NonRetriableError("OpenAI node: Variable Name is missing ")
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

    // fecth credential that user selected
    const credentialValue = process.env.ANTHROPIC_API_KEY
    
    const openai = createOpenAI({
        apiKey: credentialValue,

    });

    try {
        const { steps } = await step.ai.wrap(
            "anthropic-generate-text",
            generateText,
            {
                model: "anthropic/claude-sonnet-5.5",
                system: systemPrompt,
                prompt: userPrompt,
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
        throw e;
    }
}
