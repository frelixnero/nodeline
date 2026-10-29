// src/inngest/functions.ts
import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { generateText } from "ai";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/features/executions/componets/lib/executor-regitstry";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflow/execute.workflow" },
  async ({ event, step }) => {

    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("Workflow ID is required");
    }



    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workFLow.findUniqueOrThrow({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        }
      });


      return topologicalSort(workflow.nodes, workflow.connections);
    });

    // Initialize context with any initail data from the trigger
    let context = event.data.initialData || {}

    // execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        context,
        nodeId: node.id,
        step,
      })
    }

    return {
      workflowId,
      result: context,

    }
  }
);