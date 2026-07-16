"use client";

import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useCreateWorkflow, useRemoveWorkflow, useSuspenseWorkflows } from "../hooks/use-workflow"
import { EmptyView, EntityContainer, EntityHeader, EntityList, EntityListItem, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { UseEntitySearch } from "../hooks/use-entity-search";
import router from "next/router";
import { WorkFLowModel } from "@/generated/prisma/models";
import { WorkflowIcon } from "lucide-react";

import { formatDistanceToNow } from "date-fns";

export const WorkflowsSearch = () => {
const [params, setParams] = useWorkflowsParams();
const { searchValue, onSearchChange } = UseEntitySearch({
    params,
    setParams,
});

    return(
        <EntitySearch 
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search workflows..."
        />
    )
}

export const WorkflowsList = () => {
    const workflows = useSuspenseWorkflows();

    return(
        <EntityList 
        items={workflows.data.items}
        getKey={(workflow) => workflow.id}
         renderItem={(workflow) => <WorkflowsItems data={workflow} />}
         emptyView={<WorkflowsEmpty />}
        />
    ) 
};

export const WorkflowsHeader = ({ disabled }: { disabled: boolean } ) => {
    
    const createWorkFlow = useCreateWorkflow();
    const { handleError, modal } = useUpgradeModal()
    const router = useRouter();

    const handleCreateWorkflow = () => {
        createWorkFlow.mutate(undefined, {
            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`)
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


export const WorkflowsPagination = () => {
    const workflows = useSuspenseWorkflows();
    const [params, setParams] = useWorkflowsParams();

    return (
        <EntityPagination 
        disabled={workflows.isPending}
        totalPages={workflows.data.totalPages}
        page={workflows.data.page}
        onPageChange={(page) => setParams({...params, page})}

        />
    )
}


export const WorkflowsContainer = ({children}: {children: React.ReactNode}) => {
    return(
        <EntityContainer
            header={<WorkflowsHeader disabled={false} />}
            search={<WorkflowsSearch />}
            pagination={<WorkflowsPagination />}
        >
            {children}
        </EntityContainer>
    ) 
}

export const WorkflowsLoading = () => {
    return <LoadingView message="Loading workflows..." />;
} 

export const WorkflowsError = () => {
    return <ErrorView message="Failed to load workflows." />;
} 

export const WorkflowsEmpty = () => {
    const router = useRouter();
    const createWorkFlow = useCreateWorkflow();
    const { handleError, modal } = useUpgradeModal();

    const handleCreate = () => {
        createWorkFlow.mutate(undefined,{
            onError: (error) => {
                handleError(error);
            },
            onSuccess: (data) => {
                router.push(`/workflows/${data.id}`);
            }
        });
    }

    return (
        <>
            <EmptyView 
            onNew={handleCreate}
            message="No workflows found. Create  a workflow to get started."
            />
        </>
    )
}

export const WorkflowsItems = ({
    data
}: { data: WorkFLowModel}) => {
    const removeWorkflow = useRemoveWorkflow();

    const handleRemove = () => {
        removeWorkflow.mutate({ id: data.id })
    }

    return (
        <EntityListItem
        href={`/workflows/${data.id}`}
        title={data.name}
        subtitle={
            <>
             Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
             &bull; Created{" "}
             {formatDistanceToNow(data.createdAt, { addSuffix: true }) }
            </>
        }
        image={
            <div className="size-8 flex items-center justify-center">
                <WorkflowIcon className="size-5 text-muted-foreground"/>
            </div>
        }
        onRemove={handleRemove}
        isRemoving={removeWorkflow.isPending}
        >

        </EntityListItem>
    )
} 