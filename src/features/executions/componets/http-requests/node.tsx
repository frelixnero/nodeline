'use client';

import { NodeProps, Node, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/executions/componets/base-execution-node";
import { FormType, HTTPRequestDialog } from "./dialog";
 

type HttpRequestNodeData = {
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: string;
    [key: string]: any;

}


type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {

    const { setNodes } = useReactFlow();

    const [dialogOpen, setDialogOpen ] = useState(false);
    const handleOpenSettings = () => setDialogOpen(true);

    const handleSubmit = (values: FormType) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node, 
                    data: {
                        ...node.data,
                        endpoint: values.endpoint,
                        method: values.method,
                        body: values.body,
                    }
                }
            }
            return node;
        }))
    }

    const nodeStatus = "initial"; // Replace with actual status logic if need

    const nodeData = props.data as HttpRequestNodeData;
    const description = nodeData?.endpoint
    ? `${nodeData.method || "GET"}: ${nodeData.endpoint}`
    : "Not Configured";

    return (
        <>
        <HTTPRequestDialog open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultEndpoint={nodeData?.endpoint || ""}
        defaultMethod={nodeData?.method || "GET"}
        defaultBody={nodeData?.body || ""}
        />
        <BaseExecutionNode
        {...props}
        id={props.id}
        icon={GlobeIcon}
        name="HTTP Request"
        description={description}
        onDoubleClick={handleOpenSettings}
        onSettings={handleOpenSettings}
        />
        </>
    )
}); 

HttpRequestNode.displayName = "HttpRequestNode";

