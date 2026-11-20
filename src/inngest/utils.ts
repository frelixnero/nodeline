import toposort from "toposort";
import { NonRetriableError } from "inngest";
import { Connection } from "@/generated/prisma/client";
import { inngest } from "./client";
import { createId } from "@paralleldrive/cuid2";

export const topologicalSort = <T extends { id: string }>(
    nodes: T[],
    connections: Connection[]
): T[] => {
    const nodeIds = nodes.map((node) => node.id);
    const nodeIdSet = new Set(nodeIds);

    // Keep only edges between nodes that actually exist in this workflow.
    // Drop self-loops (a node depending on itself is not a valid dependency)
    // and duplicate edges.
    const seen = new Set<string>();
    const edges: [string, string][] = [];

    for (const conn of connections) {
        if (!nodeIdSet.has(conn.fromNodeId) || !nodeIdSet.has(conn.toNodeId)) {
            continue;
        }
        if (conn.fromNodeId === conn.toNodeId) {
            continue;
        }
        const key = `${conn.fromNodeId}->${conn.toNodeId}`;
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        edges.push([conn.fromNodeId, conn.toNodeId]);
    }

    // No dependency constraints: keep the original order (nodes can run in any order).
    if (edges.length === 0) {
        return nodes;
    }

    let sortedNodeIds: string[];
    try {
        // `toposort.array` accepts a full node list, so unconnected nodes are
        // included in the result without needing fake self-edges (which the
        // library treats as a cycle).
        sortedNodeIds = toposort.array(nodeIds, edges);
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes("Cyclic dependency")
        ) {
            throw new NonRetriableError(
                `Workflow has a cycle: ${error.message}. Remove the loop and try again.`,
                { cause: error },
            );
        }
        throw error;
    }

    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
};

export const sendWorkflowExecution = async ( data: {
    workflowId: string;
    [key: string]: any;
}) => {
    return inngest.send({
        name: "workflow/execute.workflow",
        data,
        id: createId(),
    });
};
