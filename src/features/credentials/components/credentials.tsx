"use client";

import { EmptyView, EntityContainer, EntityHeader, EntityList, EntityListItem, EntityPagination, EntitySearch, ErrorView, LoadingView } from "@/components/entity-components";
import { useRouter } from "next/navigation";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { UseEntitySearch } from "../hooks/use-entity-search";

import { formatDistanceToNow } from "date-fns";
import { useRemoveCredential, useSuspenseCredentials } from "../hooks/use-credentials";
import { CredentialType } from "@/generated/prisma/enums";
import { Credential } from "@/generated/prisma/client";
import Image from "next/image";

export const CredentialsSearch = () => {
const [params, setParams] = useCredentialsParams();
const { searchValue, onSearchChange } = UseEntitySearch({
    params,
    setParams,
});

    return(
        <EntitySearch 
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search credentials..."
        />
    )
}

export const CredentialsList = () => {
    const credentials = useSuspenseCredentials();

    return(
        <EntityList 
        items={credentials.data.items}
        getKey={(credential) => credential.id}
         renderItem={(credential) => <CredentialItems data={credential} />}
         emptyView={<CredentialsEmpty />}
        />
    ) 
};

export const CredentialsHeader = ({ disabled }: { disabled: boolean } ) => {
       return (
        <>
        <EntityHeader 
        title="Credentials"
        description="Create and manage your credentials here."
        newButtonHref="/credentials/new"
        newButtonLabel="New credential"
        disabled={disabled}
        
        />

        </>
    )
}  


export const CredentialsPagination = () => {
    const credentials = useSuspenseCredentials();
    const [params, setParams] = useCredentialsParams();

    return (
        <EntityPagination 
        disabled={credentials.isPending}
        totalPages={credentials.data.totalPages}
        page={credentials.data.page}
        onPageChange={(page) => setParams({...params, page})}

        />
    )
}


export const CredentialsContainer = ({children}: {children: React.ReactNode}) => {
    return(
        <EntityContainer
            header={<CredentialsHeader disabled={false} />}
            search={<CredentialsSearch />}
            pagination={<CredentialsPagination />}
        >
            {children}
        </EntityContainer>
    ) 
}

export const CredentialsLoading = () => {
    return <LoadingView message="Loading credentials..." />;
} 

export const CredentialsError = () => {
    return <ErrorView message="Failed to load credentials." />;
} 

export const CredentialsEmpty = () => {
    const router = useRouter();

    const handleCreate = () => {
        router.push(`/credentials/new`);
    }

    return (
        <>
            <EmptyView 
            onNew={handleCreate}
            message="You haven't created any credentials yet. Create a workflow to get started."
            />
        </>
    )
}

const credentialLogos: Record<CredentialType, string> ={
    [CredentialType.OPENAI]: "/logos/openai.svg",
    [CredentialType.ANTHROPIC]: "/logos/anthropic.svg",
    [CredentialType.GEMINI]: "/logos/gemini.svg",
    
}

type CredentialListItem = Omit<Credential, "value" | "userId">;

export const CredentialItems = ({
    data
}: { data: CredentialListItem}) => {
    const removeCredential = useRemoveCredential();

    const handleRemove = () => {
        removeCredential.mutate({ id: data.id })
    }

    const logo = credentialLogos[data.type] || "/logos/openai.svg"

    return (
        <EntityListItem
        href={`/credentials/${data.id}`}
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
                <Image src={logo} alt={data.type} width={20} height={20}/>
            </div>
        }
        onRemove={handleRemove}
        isRemoving={removeCredential.isPending}
        >

        </EntityListItem>
    ) 
} 