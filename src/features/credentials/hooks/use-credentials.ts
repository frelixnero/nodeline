//  Hook to fetch all workflows using suspense

import { useTRPC } from "@/trpc/client";
import { TRPCClientError } from "@trpc/client";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCredentialsParams } from "./use-credentials-params";
import { CredentialType } from "@/generated/prisma/enums";

export const useSuspenseCredentials = () => {
    const trpc = useTRPC();
    const [ params] = useCredentialsParams();

    return useSuspenseQuery(trpc.credentials.getMany.queryOptions(params));
}


export  const useCreateCredential = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(trpc.credentials.create.mutationOptions({
        onSuccess: (data) => {
             toast.success(`Credential "${data.name}" created successfully`);  
             queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
        },
        onError: (error) => {
            if (error instanceof TRPCClientError && error.data?.code === "FORBIDDEN") {
                return;
            }
            toast.error(`Error creating Credential: ${error.message}`);
        }
    }))
}


//  hook to remove a credential
export const useRemoveCredential = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(
        trpc.credentials.remove.mutationOptions({
            onSuccess: (data) => {
                toast.success(`Credential "${data.name}" removed successfully`);
                queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({})); 
            }
        })
    )
}


// Hook to fecth a single credential
export const useSuspenseCredential = (id: string) => {
    const trpc = useTRPC();
    return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id }));
};


// Hook to update credential
export  const useUpdateCredential = () => {
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    return useMutation(trpc.credentials.update.mutationOptions({
        onSuccess: (data) => {
             toast.success(`Credential "${data.name}" saved successfully`);  
             queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}),
            
            );
            queryClient.invalidateQueries(trpc.credentials.getOne.queryOptions({ id: data.id }));
        },
        onError: (error) => {
            if (error instanceof TRPCClientError && error.data?.code === "FORBIDDEN") {
                return;
            }
            toast.error(`Failed to save Credential: ${error.message}`);
        }
    }))
}


export const useCredentialsType = (type: CredentialType) => {
    const trpc = useTRPC();

    return useQuery(trpc.credentials.getByType.queryOptions({ type }));

}
