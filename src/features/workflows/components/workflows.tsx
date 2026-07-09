"use client";


import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useCreateWorkflow, useSuspenseWorkflows } from "../hooks/use-workflow"
import { EntityContainer, EntityHeader } from "@/components/entity-components";
import { useRouter } from "next/navigation";

export const WorkflowsList = () => {
    const workflows = useSuspenseWorkflows();

    return (
        <p>
            {JSON.stringify(workflows.data, null, 2)}
        </p>
    )
}

export const WorkflowsHeader = ({ disabled }: { disabled: boolean } ) => {
    
    const createWorkFlow = useCreateWorkflow();
    const { handleError, modal } = useUpgradeModal()
    const router = useRouter();

    const handleCreateWorkflow = () => {
        createWorkFlow.mutate(undefined, {
            onSuccess: (data) => {
                router.push(`/worlflows/${data.id}`)
            },
            onError: (error) => {

                //  TO DO: Handle error properly, maybe show a toast notification or something
                handleError(error);
            }
        });
    }

    return (
        <>
        {modal}
        <EntityHeader 
        title="Workflows"
        description="Create and manage your workflows here."
        onNew={handleCreateWorkflow}
        newButtonLabel="New Workflow"
        disabled={disabled}
        isCreating={createWorkFlow.isPending}
        
        />

        </>
    )
}  

export const WorkflowsContainer = ({children}: {children: React.ReactNode}) => {
    return(
        <EntityContainer
            header={<WorkflowsHeader disabled={false} />}
            search={<></>}
            pagination={<></>}
        >
            {children}
        </EntityContainer>
    ) 
}