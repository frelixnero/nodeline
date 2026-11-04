import { sendWorkflowExecution } from "@/inngest/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function POST (request: NextRequest) {
    try {
        const url = new URL(request.url);
        const workflowid = url.searchParams.get("workflowId");

        if (!workflowid) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing required parameter: workflowId",
                },
                { status: 400 }
            );
        }

        const body = await request.json();

        const formData = {
            formId: body.formId,
            formTitle: body.formTitle,
            responseId: body.responseId,
            timestamp: body.timestamp,
            respondentEmail: body.respondentEmail,
            responses: body.responses,
            raw: body.raw,
        }

        // Trigger an Inngest event for the Google Form submission
        await sendWorkflowExecution({
            workflowId: workflowid,
            initialData: {
                googleForm: formData,
                
            }
        });

        return NextResponse.json(
            {
                success: true,
            },
        );

    } catch (error){
        console.error("Google form error", error);
        return NextResponse.json(
            {
                success: false,
                error: "An error occurred while processing the Google Form submission.",
            },
            { status: 500 }
        );
    }
}