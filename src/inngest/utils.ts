import toposort from "toposort";
import type { Node } from "@xyflow/react";
import { Connection } from "@/generated/prisma/client";
import { boolean } from "zod";

export const topologicalSort = <T extends { id: string }>(
    nodes: T[],
    connections: Connection[]
): T[] => {

    // If no connection, return as-is (they're all independent)
    if (connections.length === 0) {
        return nodes;
    }

    //  Create edgews array for topo sort
    const edges: [string, string][] = connections.map((conn) => [
        conn.fromNodeId,
        conn.toNodeId
    ]);

    //  Add nodes with no connecions as self edges to ensure they're included
    const connectedNodeIds = new Set<string>();
    for (const conn of connections) {
        connectedNodeIds.add(conn.fromNodeId)
        connectedNodeIds.add(conn.toNodeId)
    }

    for (const node of nodes) {
        if (!connectedNodeIds.has(node.id)) {
            edges.push([node.id, node.id])
        }
    }

    // perform topological sort
    let sortedNodeIds: string[]
    try {
        sortedNodeIds = toposort(edges);

        // remove duplicates
        sortedNodeIds = [...new Set(sortedNodeIds)];
    } catch (error) {
        if (error instanceof Error && error.message.includes("Cyclic dependencies detected")) {
            throw new Error("Workflow has a cycle!")
        }
        throw error;
    }

    const nodeMap = new Map(nodes.map((node) => [node.id, node]));

    return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean)
}   