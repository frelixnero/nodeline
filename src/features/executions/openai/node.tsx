"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/executions/componets/base-execution-node"; 
import { useNodeStatus } from "../hooks/use-node-status";

import { fetchOpenAIRealtimeToken } from "./actions";
import { OpenAIDialog, OpenAIFormValues } from "./dialog";

type OpenAINodeData = {
  variableName?: string;
  model?: OpenAIFormValues["model"];
  systemPrompt?: string;
  userPrompt?: string;
};

type OpenAINodeType = Node<OpenAINodeData>;

export const OpenAINode = memo((props: NodeProps<OpenAINodeType>) => {
  const { setNodes } = useReactFlow();

  const [dialogOpen, setDialogOpen] = useState(false);
  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: OpenAIFormValues) => {
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
    channel: "openai-channel-execution",
    topic: "status",
    refreshToken: fetchOpenAIRealtimeToken,
  });

  const nodeData = props.data as OpenAINodeData;
  const description = nodeData?.userPrompt 
    ? `gpt-4.1: ${nodeData.userPrompt.slice(0,50)}...`
    : "Not Configured";

  return (
    <>
      <OpenAIDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
        defaultVariableName={nodeData?.variableName || ""}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={"/logos/openai.svg"}
        name="OpenAI"
        description={description}
        status={nodeStatus}
        onDoubleClick={handleOpenSettings}
        onSettings={handleOpenSettings}
      />
    </>
  );
});

OpenAINode.displayName = "OpenAINode";
