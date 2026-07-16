//  Hook to fetch all workflows using suspense

import { useTRPC } from "@/trpc/client";
import { TRPCClientError } from "@trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWorkflowsParams } from "./use-workflows-params";
import { tr } from "date-fns/locale";

export const useSuspenseWorkflows = () => {
    const trpc = useTRPC();
    const [ params] = useWorkflowsParams();

    return useSuspenseQuery(trpc.workflows.getMany.queryOptions(params));
}


export  const useCreateWorkflow = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(trpc.workflows.create.mutationOptions({
        onSuccess: (data) => {
             toast.success(`Workflow "${data.name}" created successfully`);  
             queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        },
        onError: (error) => {
            if (error instanceof TRPCClientError && error.data?.code === "FORBIDDEN") {
                return;
            }
            toast.error(`Error creating workflow: ${error.message}`);
        }
    }))
}


//  hook to remove a workflow
export const useRemoveWorkflow = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(
        trpc.workflows.remove.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Workflow "${data.name}" removed successfully`);
                queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({})); 
            }
        })
    )
}