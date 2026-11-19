"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/executions/componets/base-execution-node"; 
import { useNodeStatus } from "../hooks/use-node-status";
import { DiscordDialog, DiscordFormValues, } from "./dialog";
import { fetchDiscordRealtimeToken, } from "./actions";

type DiscordNodeData = {
  variableName?: string,
  webhookURL?: string;
  content: string;
  username?: string;
};

type DiscordNodeType = Node<DiscordNodeData>;

export const DiscordNode = memo((props: NodeProps<DiscordNodeType>) => {
  const { setNodes } = useReactFlow();

  const [dialogOpen, setDialogOpen] = useState(false);
  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: DiscordFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              variableName: values.variableName,
              username: values.username,
              webhookURL: values.webhookURL,
              content: values.content,
            },
          };
        }
        return node;
      }),
    );
  };

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "discord-channel-execution",
    topic: "status",
    refreshToken: fetchDiscordRealtimeToken,
  });

  const nodeData = props.data as DiscordNodeData;
  const description = nodeData?.content 
    ? `Send: ${nodeData.content.slice(0,50)}...`
    : "Not Configured";

  return (
    <>
      <DiscordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
        defaultVariableName={nodeData?.variableName || ""}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={"/logos/discord.svg"}
        name="Discord"
        description={description}
        status={nodeStatus}
        onDoubleClick={handleOpenSettings}
        onSettings={handleOpenSettings}
      />
    </>
  );
});

DiscordNode.displayName = "DiscordNode";
