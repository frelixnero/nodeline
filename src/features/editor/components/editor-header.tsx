"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SaveIcon } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbList,
} from "@/components/ui/breadcrumb";

import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSuspenseWorkflow, useUpdateWorkflow, useUpdateWorkflowName } from "@/features/workflows/hooks/use-workflow";
import { useAtomValue } from "jotai";
import { editorAtom } from "../store/atoms";
import { NodeType } from "@/generated/prisma/browser";

const isWorkflowNodeType = (type: string | undefined): type is NodeType => {
    return (
        type === NodeType.INITIAL ||
        type === NodeType.MANUAL_TRIGGER ||
        type === NodeType.HTTP_REQUEST
    );
};



export const EditorBreadCrumbs = ({workflowId}: { workflowId: string }) => {
     return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/workflows" prefetch>
                        Workflows
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator/>
                <EditorNameInput workflowId={workflowId}/>
            </BreadcrumbList>
        </Breadcrumb>
    )
}

export const EditorNameInput = ({workflowId}: { workflowId: string }) => {
    const { data: workflow } = useSuspenseWorkflow(workflowId);
    const updateWorkflow = useUpdateWorkflowName();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(workflow.name);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (workflow.name) {
            setName(workflow.name);
        }
    }, [workflow.name]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (name === workflow.name) {
            setIsEditing(false);
            return;
        }

        setIsEditing(false);

        try {
            await updateWorkflow.mutateAsync({
                id: workflowId,
                name,
            })
        } catch {
            setName(workflow.name);
        } finally {
            setIsEditing(false);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            setName(workflow.name);
            setIsEditing(false);
            
        }
    }

    if (isEditing) {
        return(
            <Input
            disabled={updateWorkflow.isPending}
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="h-7 w-auto min-w-[1000px] px-2"
            />
        )
    }

    return(
        <BreadcrumbItem onClick={() => setIsEditing(true)} className="cursor-pointer hover:text-foreground transition-colors">
             {workflow.name}
        </BreadcrumbItem>
    )
}

export const EditorSaveButton = ({workflowId}: { workflowId: string }) => {
    const editor = useAtomValue(editorAtom);
    const  saveWorkflow = useUpdateWorkflow();

    const handleSave = () => {
        if (!editor){
            return;
        }

        const nodes = editor.getNodes().reduce<
            Array<{
                id: string;
                type: NodeType;
                position: { x: number; y: number };
                data?: Record<string, any>;
            }>
        >((acc, node) => {
            if (!isWorkflowNodeType(node.type)) {
                return acc;
            }

            acc.push({
                id: node.id,
                type: node.type,
                position: node.position,
                data: (node.data ?? {}) as Record<string, any>,
            });

            return acc;
        }, []);

        const edges = editor.getEdges().map((edge) => ({
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
        }));

        saveWorkflow.mutate({
            id: workflowId,
            nodes,
            edges,
        })
    }

    
    
    return (
        <div className="ml-auto">
            <Button size="sm"
             className="gap-2" onClick={handleSave}
             disabled={saveWorkflow.isPending}
             >
                <SaveIcon className="size-4"/>
                Save
            </Button>
        </div>
    )
}

export const EditorHeader = ({workflowId}: 
    { workflowId: string }) => {
    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
            <SidebarTrigger />
            <div className="flex flex-row items-center
             justify-between gap-x-4 w-full">
                <EditorBreadCrumbs workflowId={workflowId}/>
                <EditorSaveButton workflowId={workflowId}/>
            </div>
        </header>
    )
}