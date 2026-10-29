import type { GetStepTools, Inngest } from "inngest";

export type WorkflowContext = Record<string, unknown>

export type StepTools = GetStepTools<Inngest.Any>;

export interface NodeExecutorParams<TData = any> {
    data: TData;
    context: WorkflowContext;
    nodeId: string;
    step: StepTools
}

export type NodeExecutor<TData = any> = (
    params: NodeExecutorParams<TData>
) => Promise<WorkflowContext>;