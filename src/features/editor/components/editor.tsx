"use client";

import { useState, useCallback } from 'react';
import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflow";
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, type Node, type Edge, NodeChange, EdgeChange, Connection, Background, Controls, MiniMap, Panel } from '@xyflow/react';
import { nodeComponents } from '@/config/node-components';
import { AddNodeButton } from './add-node-button';
import { useSetAtom } from 'jotai';
import { editorAtom } from '../store/atoms';

const normalizeEdges = (edges: Edge[]): Edge[] => {
    return edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
        data: edge.data,
        animated: edge.animated,
    }));
};


export const EditorLoading = () => {
    return <LoadingView message="Loading editor..." />;
}

export const EditorError = () => {
    return <ErrorView message="Error loading editor." />
}




export const Editor = ({workflowId}: {workflowId: string}) => {
    const { data: workflow } = useSuspenseWorkflow(workflowId);

    const setEditorState = useSetAtom(editorAtom);


    const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
    const [edges, setEdges] = useState<Edge[]>(normalizeEdges(workflow.edges as Edge[]));

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );
    const onConnect = useCallback(
        (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );

    return (
        <div className="size-full">
            <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeComponents}
            onInit={setEditorState}
            fitView
            snapToGrid
            snapGrid={[10,10]}
            selectionOnDrag
            panOnScroll
            panOnDrag={false}

            proOptions={{
                hideAttribution: true
            }}
            >
            <Background/>
            <Controls/>
            <MiniMap/>
            <Panel position="top-right">
                <AddNodeButton/>
            </Panel>
            </ReactFlow>
        </div>
    );
}