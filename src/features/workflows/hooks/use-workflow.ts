//  Hook to fetch all workflows using suspense

import { useTRPC } from "@/trpc/client";
import { TRPCClientError } from "@trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useSuspenseWorkflows = () => {
    const trpc = useTRPC();

    return useSuspenseQuery(trpc.workflows.getMany.queryOptions());
}


export  const useCreateWorkflow = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(trpc.workflows.create.mutationOptions({
        onSuccess: (data) => {
             toast.success(`Workflow "${data.name}" created successfully`);  
             queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions());
        },
        onError: (error) => {
            if (error instanceof TRPCClientError && error.data?.code === "FORBIDDEN") {
                return;
            }
            toast.error(`Error creating workflow: ${error.message}`);
        }
    }))
}