"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const Client = () => {
    const trpc = useTRPC();
    const {data: users} = useSuspenseQuery(trpc.getUsers.queryOptions({text: ''}));

    return (
        <div>
            Client Components
        </div>
    )
}