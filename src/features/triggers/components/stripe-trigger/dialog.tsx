"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogHeader,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
interface StripeTriggerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const StripeTriggerDialog = ({ 
    open, 
    onOpenChange 
}: StripeTriggerDialogProps) => {
    const params = useParams();

    const workflowId = params?.workflowId as string;

    // Construct the webhook URL using the workflowId
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = 
    `${baseURL}/api/webhooks/stripe?workflowId=${workflowId}`


    const copyToClipboard = async () => {
        try{
            await navigator.clipboard.writeText(webhookUrl);
            toast.success("Webhook URL copied to clipboard");
        } catch (err) {
            toast.error("Failed to copy webhook URL");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Stripe Trigger Configuration</DialogTitle>
                    <DialogDescription>
                        Use this webhook in your Stripe settings to trigger a workflow on payment events.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="webhook-url">
                            Webhook URL
                        </label>
                        <div className="flex gap-2">
                            <Input
                            id="webhook-url"
                            value={webhookUrl}
                            readOnly
                            className="font-mono text-sm"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={copyToClipboard}
                            >
                                <CopyIcon className="size-4"/>
                            </Button>
                        </div>
                    </div>
                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm">Instructions</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                            <li>Open your Stripe dashboard.</li>
                            <li>Got to Developers ⇒ webHooks</li>
                            <li>Select "Responses" and then "Webhooks".</li>
                            <li>Click "Add endpoint".</li>
                            <li>Paste the webhook URL above into the URL field.</li>
                            <li>Select events to listen for.(e.g, payment_intent.succeeded)</li>
                            <li>Save and copy the webhook secret.</li>
                        </ol>
                       
                    </div>
    
                    <div className="rounded-lg bg-muted p-4 space-y-3">
                            <h4 className="font-medium text-sm" > Available Variables  </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li><code className="bg-background px-1 py-0.5 rounded">
                                    {"{{stripe.amount}}"}
                                    </code> - Payments amount
                                </li>
                                <li><code className="bg-background px-1 py-0.5 rounded">
                                    {"{{stripe.currency}}"}
                                    </code> - Payments currency
                                </li>
                                <li><code className="bg-background px-1 py-0.5 rounded">
                                    {"{{json stripe}}"}
                                    </code> - Stripe payload as JSON
                                </li>
                                <li><code className="bg-background px-1 py-0.5 rounded">
                                    {"{{stripe.eventType}}"}
                                    </code> - Stripe event type
                                </li>
                            </ul>
                    </div>
                </div>
            </DialogContent>

        </Dialog>
    )
}