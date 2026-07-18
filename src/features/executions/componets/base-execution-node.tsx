"use client";

import { type NodeProps, Position } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, type ReactNode, useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { BaseNode, BaseNodeContent} from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { WorkflowNode } from "@/components/workflow-node";
import { NodeStatus, NodeStatusIndicator  } from "@/components/react-flow/node-status-indicator";

interface BaseExecutionNodeProps extends NodeProps {
    icon: LucideIcon | string;
    name: string;
    description: string;
    children?: ReactNode;
    status?: NodeStatus;
    onSettings?: () => void;
    onDoubleClick?: () => void;
}

export const BaseExecutionNode = memo(
    ({
        id,
        icon: Icon,
        name,
        description,
        status = "initial",
        children,
        onSettings,
        onDoubleClick,
    }: BaseExecutionNodeProps) => {

        const { setNodes, setEdges } = useReactFlow();
        const executionNodeShapeClass = "rounded-md";

        const nodeStatus = status  // Replace with actual status logic if need
        
        //  remebder to add delete metjod
        const handleDelete = () => {
            setNodes((currentNodes) => {
                const updateNodes = currentNodes.filter((node) => node.id !== id);
                return updateNodes;
            })
            setEdges((currentEdges) => {
                const updatedEdges = currentEdges.filter((edge) => edge.source !== id && edge.target !== id);
                return updatedEdges;
            })
        }

        return (
            <WorkflowNode 
            name={name}
            description={description}
            onDelete={handleDelete}
            onSettings={onSettings}

            >

                <NodeStatusIndicator status={nodeStatus} variant="border" className={executionNodeShapeClass}>
                <BaseNode onDoubleClick={onDoubleClick} status={nodeStatus} className={executionNodeShapeClass}>
                   <BaseNodeContent>
                      {typeof Icon === "string" ? (
                        <Image src={Icon} alt={name} width={20} height={20} />
                      ):(
                        <Icon className="size-4 text-muted-foreground" />
                      )}
                      {children}
                      <BaseHandle
                      id="target-1"
                      type="target"
                      position={Position.Left}
                      />
                      <BaseHandle
                      id="source-1"
                      type="source"
                      position={Position.Right}
                      />
                   </BaseNodeContent>
                </BaseNode>
            </NodeStatusIndicator>
            </WorkflowNode>
        )
    }
)

BaseExecutionNode.displayName = "BaseExecutionNode";