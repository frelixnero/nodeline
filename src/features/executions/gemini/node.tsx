"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/executions/componets/base-execution-node"; 
import { useNodeStatus } from "../hooks/use-node-status";
import { GeminiDialog, type GeminiFormValues } from "./dialog";
import { fetchGeminiRealtimeToken } from "./actions";

type GeminiNodeData = {
  variableName?: string;
  model?: GeminiFormValues["model"];
  systemPrompt?: string;
  userPrompt?: string;
};

type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => {
  const { setNodes } = useReactFlow();

  const [dialogOpen, setDialogOpen] = useState(false);
  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: GeminiFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              variableName: values.variableName,
              model: values.model,
              systemPrompt: values.systemPrompt,
              userPrompt: values.userPrompt,
            },
          };
        }
        return node;
      }),
    );
  };

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "gemini-channel-execution",
    topic: "status",
    refreshToken: fetchGeminiRealtimeToken,
  });

  const nodeData = props.data as GeminiNodeData;
  const description = nodeData?.userPrompt 
    ? `${nodeData.model || "gemini-2.5-flash"}: ${nodeData.userPrompt.slice(0,50)}...`
    : "Not Configured";

  return (
    <>
      <GeminiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
        defaultVariableName={nodeData?.variableName || ""}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={"/logos/gemini.svg"}
        name="Gemini"
        description={description}
        status={nodeStatus}
        onDoubleClick={handleOpenSettings}
        onSettings={handleOpenSettings}
      />
    </>
  );
});

GeminiNode.displayName = "GeminiNode";
