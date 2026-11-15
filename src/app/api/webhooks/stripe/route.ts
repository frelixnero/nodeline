import { sendWorkflowExecution } from "@/inngest/utils";
import { raw } from "@prisma/client/runtime/library";
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

        const stripeData = {
            eventId: body.eventId,
            eventType: body.eventType,
            timestamp: body.timestamp,
            livemode: body.livemode,
            raw: body.data?.object,
        }

        // Trigger an Inngest event for the Stripe event
        await sendWorkflowExecution({
            workflowId: workflowid,
            initialData: {
                stripe: stripeData,
                
            }
        });

        return NextResponse.json(
            {
                success: true,
            },
            { status: 200  }
        );

    } catch (error){
        console.error("Stripe webhook error", error);
        return NextResponse.json(
            {
                success: false,
                error: "An error occurred while processing the Stripe event.",
            },
            { status: 500 }
        );
    }
}