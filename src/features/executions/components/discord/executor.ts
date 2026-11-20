import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { discordChannel } from "@/inngest/channels/discord";
import { toNonRetriableError } from "@/features/executions/lib/ai-errors";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
    const jsonStringified = JSON.stringify(context, null, 2);
    return new Handlebars.SafeString(jsonStringified);
});

const DISCORD_MESSAGE_LIMIT = 2000;

type DiscordData = {
    variableName?: string;
    webhookURL?: string;
    content?: string;
    username?: string;
};

export const DiscordExecutor: NodeExecutor<DiscordData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(
        discordChannel().status({
            nodeId,
            status: "loading",
        }),
    );

    const variableName = data.variableName;
    const webhookURL = data.webhookURL;

    if (!variableName) {
        await publish(
            discordChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Discord Node: Variable Name is missing");
    }

    if (!data.content) {
        await publish(
            discordChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Discord Node: Message content is missing");
    }

    if (!webhookURL) {
        await publish(
            discordChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Discord Node: Webhook URL is missing");
    }

    let content: string;
    let username: string | undefined;
    try {
        content = Handlebars.compile(data.content)(context).slice(
            0,
            DISCORD_MESSAGE_LIMIT,
        );
        username = data.username
            ? Handlebars.compile(data.username)(context)
            : undefined;
    } catch (error) {
        await publish(
            discordChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError(
            `Discord Node: failed to render message template: ${
                error instanceof Error ? error.message : String(error)
            }`,
            { cause: error },
        );
    }

    try {
        await step.run(`discord-webhook-${nodeId}`, async () => {
            try {
                await ky.post(webhookURL, {
                    json: {
                        content,
                        ...(username ? { username } : {}),
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
