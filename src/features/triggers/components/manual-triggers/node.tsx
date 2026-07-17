import { memo } from "react";
import { MousePointerIcon } from "lucide-react";
import { BaseTriggerNode } from "../base-trigger-node"
import type { NodeProps } from "@xyflow/react";


export const ManualTriggerNode = memo((props: NodeProps) => {
   return(
    <>
        <BaseTriggerNode
        {...props}
        icon={MousePointerIcon}
        name="Manual Trigger"
        description="Click to execute workflow"
        // status={nodeStatus}
        // onSettings={handleSettings}
        // onDoubleClick={handleDoubleClick}
        />
    </>
   )

})