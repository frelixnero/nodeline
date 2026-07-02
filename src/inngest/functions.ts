// src/inngest/functions.ts
import prisma from "@/lib/db";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const result = await step.run("handle-task", async () => {
      return { processed: true, id: event.data.id };
    });

    await step.sleep("pause", "1s");

    await step.sleep("pause", "12s");

    await step.run("create workflow", ()=> {
                return prisma.workFLow.create({
                    data:{
                        name: "test-workflow"
                    }
                })
            });
  }
);