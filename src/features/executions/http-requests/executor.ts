import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";
import { httpRequestChannel } from "@/inngest/channels/http-request";

Handlebars.registerHelper("json", (context) => {
    const jsonStringified = JSON.stringify(context, null, 2);
    const safestring = new Handlebars.SafeString(jsonStringified);

     
    return safestring;
} );


type HTTPRequestData = {
    variableName: string;
    endpoint: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body: string
}


export const HTTPRequestExecutor: NodeExecutor<HTTPRequestData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {

    await publish(
        httpRequestChannel().status({
            nodeId, 
            status: "loading"
        })
    )

    if (!data.endpoint) {
        // publish error for htpp request
        await publish(
            httpRequestChannel().status({
                nodeId, 
                status: "error"
            })
        )
        throw new NonRetriableError("HTTP Request Node: No endpoint configured")
    }

    if (!data.variableName) {
        // publish error for htpp request
        await publish(
            httpRequestChannel().status({
                nodeId, 
                status: "error"
            })
        )
        throw new NonRetriableError("HTTP Request Node: No variable name configured")
    }

    if (!data.method) {
        // publish error for htpp request
        await publish(
            httpRequestChannel().status({
                nodeId, 
                status: "error"
            })
        )
        throw new NonRetriableError("HTTP Request Node: No method configured")
    }


    try {
    const result = await step.run("http-request", async () => {
        const endpoint = Handlebars.compile(data.endpoint!)(context);
        console.log("ENDPOINT", {endpoint})

        const method = data.method || "GET"

        const options: KyOptions = { method }

        if (["POST", "PUT", "PATCH"].includes(method)) {
            if (data.body) {
                const resolved = Handlebars.compile(data.body || "{}")(context);
                JSON.parse(resolved)
                options.body = resolved;
                options.headers = {
                    "Content-Type": "application/json"
                }
            }
        } 

        const response = await ky(endpoint, options)
        const contentType = response.headers.get("content-type") || ""
        const responseData = contentType?.includes("application/json")
            ? await response.json()
            : await response.text();

        const responsePayload = {
            httpResponse: {
                status: response.status,
                statusText: response.statusText,
                data: responseData,

            },   
        }
        
       
        return {
            ...context,
            [data.variableName]: responsePayload,
        }
     

        
    });
    await publish(
        httpRequestChannel().status({
            nodeId,
            status: "success",
        })
    );
    return result as Record<string, unknown>;
    } catch (error) {
        await publish(
            httpRequestChannel().status({
                nodeId,
                status: "error",
            })
        );
        throw error;
    }
}
