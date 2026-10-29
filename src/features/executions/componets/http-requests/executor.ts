import type { NodeExecutor, NodeExecutorParams } from "@/features/executions/componets/types";
import { contextFromJSON } from "@polar-sh/sdk/models/components/validationerror.js";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HTTPRequestData = {
    variableName?: string;
    endpoint?: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body: string
}


export const HTTPRequestExecutor: NodeExecutor<HTTPRequestData> = async ({
    data,
    nodeId,
    context,
    step
}) => {
    if (!data.endpoint) {
        // publish error for htpp request
        throw new NonRetriableError("HTTP Request Node: No endpoint configured")
    }

    if (!data.variableName) {
        // publish error for htpp request
        throw new NonRetriableError("HTTP Request Node: No variable name configured")
    }


    const result = await step.run("http-request", async () => {
        const endpoint = data.endpoint!;
        const method = data.method || "GET"

        const options: KyOptions = { method }

        if (["POST", "PUT", "PATCH"].includes(method)) {
            if (data.body) {
                options.body = data.body;
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
        
        if (data.variableName){
                return {
                ...context,
                [data.variableName]: responsePayload,
            }
        }

        //  Fallback to direct http response in context if no variable name is provided
        return {
            ...context,
            ...responsePayload,
            
        }
    })

    // Publish success state for manual trigger
    return result
}