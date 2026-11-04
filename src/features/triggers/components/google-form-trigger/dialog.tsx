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
import { generateGoogleFormScript } from "./utils";

interface GoogleFormTriggerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const GoogleFormTriggerDialog = ({ 
    open, 
    onOpenChange 
}: GoogleFormTriggerDialogProps) => {
    const params = useParams();

    const workflowId = params?.workflowId as string;

    // Construct the webhook URL using the workflowId
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = 
    `${baseURL}/api/webhooks/googleforms?workflowId=${workflowId}`


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
                    <DialogTitle>Google Form Trigger Configuration</DialogTitle>
                    <DialogDescription>
                        Use this webhook in your Google Form settings to trigger a workflow on form submission.
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
                            <li>Open your Google Form.</li>
                            <li>Click on the three dots menu ⇒ Script editor</li>
                            <li>Select "Responses" and then "Webhooks".</li>
                            <li>Click "Add Webhook".</li>
                            <li>Paste the webhook URL into the URL field.</li>
                            <li>Click "Save" then click "Triggers" ⇒ Add Trigger.</li>
                            <li>Choose the function to run and select "On form submit" as the event type.</li>
                        </ol>
                       
                    </div>
                    <div className="rounded-lg bg-muted p-4 space-y-3">
                        <h4 className="font-medium text-sm">
                            Google Apps Script
                        </h4>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={async ()=> {
                                const script =  generateGoogleFormScript(webhookUrl);
                                try{
                                    await navigator.clipboard.writeText(script);
                                    toast.success("Google Apps Script copied to clipboard");
                                } catch {
                                    toast.error("failed to copy script to clipboard");
                                }
                            }}
                        >
                            <CopyIcon className="size-4 mr-2"/>
                            Copy Google Apps Script
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            This script includes your webhook URL and sets up the trigger for your form submissions.
                        </p>
                    </div>
                    <div className="rounded-lg bg-muted p-4 space-y-3">
                            <h4 className="font-medium text-sm" > Available Variables  </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>
                                    <code className="bg-background px-1 py-0.5 rounded">
                                        {"{{googleForm.respondentEmail}}"}
                                    </code>
                                    - Respondent's email address (if collected)
                                </li>
                                <li>
                                    <code className="bg-background px-1 py-0.5 rounded">
                                        {"{{googleForm.responses['Question Name']}}"}
                                    </code>
                                    - Specific answer
                                </li>
                                <li>
                                    <code className="bg-background px-1 py-0.5 rounded">
                                        {"{{json.googleForm.responses}}"}
                                    </code>{""}
                                    - All responses in JSON format
                                </li>
                            </ul>
                    </div>
                </div>
            </DialogContent>

        </Dialog>
    )
}