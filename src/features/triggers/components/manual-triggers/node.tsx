import { memo, useState } from "react";
import { MousePointerIcon } from "lucide-react";
import { BaseTriggerNode } from "../base-trigger-node"
import type { NodeProps } from "@xyflow/react";
import { ManualTriggerDialog } from "./dialog";


export const ManualTriggerNode = memo((props: NodeProps) => {

    const [dialogOpen, setDialogOpen ] = useState(false);
    const handleOpenSettings = () => setDialogOpen(true);

    const nodeStatus = "initial"; // Replace with actual status logic if need

   return(
    <>  <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        <BaseTriggerNode
        {...props}
        icon={MousePointerIcon}
        name="Manual Trigger"
        description="Click to execute workflow"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        // onDoubleClick={handleDoubleClick}
        />
    </>
   )

})