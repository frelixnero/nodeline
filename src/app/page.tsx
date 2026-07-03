"use client"

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-utils"
import { caller } from "@/trpc/server";
import { LogoutButton } from "./logout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

const Page =  () => {
  
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const {data} = useQuery(trpc.getWorkFlows.queryOptions())

  const testAi = useMutation(trpc.testAi.mutationOptions({
    onSuccess: () => {
      toast.success("Job queued successfully")
      // queryClient.invalidateQueries(trpc.getWorkFlows.queryOptions())
    }
  }))

  const create = useMutation(trpc.createWorkFlows.mutationOptions({
    onSuccess: () => {
      toast.success("Job queued successfully")
      // queryClient.invalidateQueries(trpc.getWorkFlows.queryOptions())
    }
  }))

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-y-6">
      Welcome
      <div>
        {JSON.stringify(data, null, 2)}
      </div>
      <Button disabled={testAi.isPending} onClick={()=> testAi.mutate()}>
        Test AI
      </Button>
      <LogoutButton />
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        Create Workflow
      </Button>
      
    </div>
  )
}

export default Page