import { Editor, EditorError, EditorLoading } from "@/features/editor/components/editor";
import { EditorHeader } from "@/features/editor/components/editor-header";
import { WorkflowsError, WorkflowsLoading } from "@/features/workflows/components/workflows";
import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils"
import { caller, HydrateClient } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
    params: Promise<{
        workflowId: string
    }>
}

const Page = async ({ params }: PageProps) => {
    await requireAuth(); 
    const { workflowId } = await params
    try {
        await caller.workflows.getOne({ id: workflowId });
    } catch (error) {
        if (error instanceof TRPCError && error.code === "NOT_FOUND") {
            notFound();
        }

        throw error;
    }

    prefetchWorkflow(workflowId);
    return(
        <HydrateClient>
            <ErrorBoundary  fallback={<EditorError/>}>
                <Suspense fallback={<EditorLoading/>}>
                    <EditorHeader workflowId={workflowId}/>
                    <main className="flex-1 ">
                        <Editor workflowId={workflowId}/>
                    </main>
                    
                </Suspense>
            </ErrorBoundary>
         </HydrateClient>
    )
}

export default Page;