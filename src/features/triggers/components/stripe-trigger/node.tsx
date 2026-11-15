import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node"
import type { NodeProps } from "@xyflow/react";
import { StripeTriggerDialog, } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { GOOGLE_FORM_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/google-form-trigger";
import { fetchStripeTriggerRealtimeToken } from "./actions";
import { STRIPE_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/stripe-trigger";


export const StripeTriggerNode = memo((props: NodeProps) => {

    const [dialogOpen, setDialogOpen ] = useState(false);
    const handleOpenSettings = () => setDialogOpen(true);

    const nodeStatus = useNodeStatus({
            nodeId: props.id,
            channel: STRIPE_TRIGGER_CHANNEL_NAME,
            topic: "status",
            refreshToken: fetchStripeTriggerRealtimeToken,
        });

   return(
    <>  <StripeTriggerDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        />
        <BaseTriggerNode
        {...props}
        icon="/logos/stripe.svg"
        name="Stripe"
        description="When stripe events occur, trigger a workflow"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        // onDoubleClick={handleDoubleClick}
        />
    </>
   )

})
