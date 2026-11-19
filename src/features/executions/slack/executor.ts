import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { discordChannel } from "@/inngest/channels/discord";
import { toNonRetriableError } from "@/features/executions/lib/ai-errors";
import ky from "ky";
import { slackChannel } from "@/inngest/channels/slack";

Handlebars.registerHelper("json", (context) => {
    const jsonStringified = JSON.stringify(context, null, 2);
    return new Handlebars.SafeString(jsonStringified);
});

const DISCORD_MESSAGE_LIMIT = 2000;

type SlackData = {
    variableName?: string;
    webhookURL?: string;
    content?: string;
};

export const SlackExecutor: NodeExecutor<SlackData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(
        slackChannel().status({
            nodeId,
            status: "loading",
        }),
    );

    const variableName = data.variableName;
    const webhookURL = data.webhookURL;

    if (!variableName) {
        await publish(
            slackChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Slack Node: Variable Name is missing");
    }

    if (!data.content) {
        await publish(
            slackChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Slack Node: Message content is missing");
    }

    if (!webhookURL) {
        await publish(
            slackChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Slack Node: Webhook URL is missing");
    }

    let content: string;
    let username: string | undefined;
    try {
        content = Handlebars.compile(data.content)(context).slice(
            0,
            DISCORD_MESSAGE_LIMIT,
        );
    } catch (error) {
        await publish(
            slackChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError(
            `Slack Node: failed to render message template: ${
                error instanceof Error ? error.message : String(error)
            }`,
            { cause: error },
        );
    }

    try {
        await step.run(`slack-webhook-${nodeId}`, async () => {
            try {
                await ky.post(webhookURL, {
                    json: {
                        text: content,
                    },
                });
            } catch (error) {
                // Convert inside the step so Inngest records a non-retriable
                // failure and does not retry permanent errors (bad URL, 4xx).
                throw toNonRetriableError(error);
            }
        });

        await publish(
            discordChannel().status({
                nodeId,
                status: "success",
            }),
        );

        return {
            ...context,
            [variableName]: {
                text: content,
                username,
            },
        };
    } catch (error) {
        await publish(
            discordChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw toNonRetriableError(error);
    }
};
