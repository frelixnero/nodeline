"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "@/features/executions/componets/base-execution-node"; 
import { useNodeStatus } from "../hooks/use-node-status";
import { SlackDialog, SlackFormValues, } from "./dialog";
import { fetchSlackRealtimeToken } from "./actions";


type SlackNodeData = {
  variableName?: string,
  webhookURL?: string;
  content: string;
};

type SlackNodeType = Node<SlackNodeData>;

export const SlackNode = memo((props: NodeProps<SlackNodeType>) => {
  const { setNodes } = useReactFlow();

  const [dialogOpen, setDialogOpen] = useState(false);
  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: SlackFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              variableName: values.variableName,
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
    channel: "slack-channel-execution",
    topic: "status",
    refreshToken: fetchSlackRealtimeToken,
  });

  const nodeData = props.data as SlackNodeData;
  const description = nodeData?.content 
    ? `Send: ${nodeData.content.slice(0,50)}...`
    : "Not Configured";

  return (
    <>
      <SlackDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
        defaultVariableName={nodeData?.variableName || ""}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={"/logos/slack.svg"}
        name="Slack"
        description={description}
        status={nodeStatus}
        onDoubleClick={handleOpenSettings}
        onSettings={handleOpenSettings}
      />
    </>
  );
});

SlackNode.displayName = "SlackNode";
