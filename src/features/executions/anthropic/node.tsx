"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/executions/componets/base-execution-node"; 
import { useNodeStatus } from "../hooks/use-node-status";

import { fetchAnthropicRealtimeToken,} from "./actions";
import { AnthropicDialog, AnthropicFormValues,} from "./dialog";

type AnthropicNodeData = {
  variableName?: string;
  credentialId: string;
  model?: AnthropicFormValues["model"];
  systemPrompt?: string;
  userPrompt?: string;
};

type AnthropicNodeType = Node<AnthropicNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {
  const { setNodes } = useReactFlow();

  const [dialogOpen, setDialogOpen] = useState(false);
  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: AnthropicFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              variableName: values.variableName,
              credentialId: values.credentialId,
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
    channel: "anthropic-channel-execution",
    topic: "status",
    refreshToken: fetchAnthropicRealtimeToken,
  });

  const nodeData = props.data as AnthropicNodeData;
  const description = nodeData?.userPrompt 
    ? `${nodeData.model || "claude-sonnet-4-5"}: ${nodeData.userPrompt.slice(0,50)}...`
    : "Not Configured";

  return (
    <>
      <AnthropicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
        defaultVariableName={nodeData?.variableName || ""}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={"/logos/anthropic.svg"}
        name="Anthropic"
        description={description}
        status={nodeStatus}
        onDoubleClick={handleOpenSettings}
        onSettings={handleOpenSettings}
      />
    </>
  );
});

AnthropicNode.displayName = "AnthropicNode";
