// src/inngest/functions.ts
import prisma from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {generateText} from "ai";

const google = createGoogleGenerativeAI();

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {

    console.warn("Something is wrong")

     const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
        model: google("gemini-2.5-flash"),
        system: "You are a helpful assistant that generates text based on the given prompt.",
        prompt: "what is 2 + 2",
        experimental_telemetry: {
          isEnabled: true,
          functionId: "joke_agent",
          recordInputs: true,
          recordOutputs: true,
        },

      })

    return steps;
  }
);