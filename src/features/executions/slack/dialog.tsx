"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

// The faster "flash-lite" model avoids the multi-minute waits that the
// larger thinking models can have on short prompts.

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
      message:
        "Variable name must start with a letter or underscore and can only contain letters, numbers, and underscores.",
    }),
    content: z
      .string()
      .min(1, "Message content is not specified"),
    webhookURL: z.string().min(1, "Webhook URL is required")
});

export type SlackFormValues = z.infer<typeof formSchema>;

interface SlackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<SlackFormValues>;
  defaultVariableName?: string;
}

export const SlackDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  defaultVariableName = "",
}: SlackDialogProps) => {
  

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || defaultVariableName,
      content: defaultValues.content || "",
      webhookURL: defaultValues.webhookURL || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
      variableName: defaultValues.variableName || defaultVariableName,
      content: defaultValues.content || "",
      webhookURL: defaultValues.webhookURL || "",
      });
    }
  }, [
    open,
    defaultVariableName,
    defaultValues.variableName,
    defaultValues.content,
    defaultValues.webhookURL,
    form,
  ]);

  const watchVariableName = form.watch("variableName") || "mySlackCall";

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Slack Config</DialogTitle>
          <DialogDescription>
            Configure the Slack node settings here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-2"
          >
            
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="mySlackCall" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use this name to reference the result in other nodes:{" "}
                    {`{{${watchVariableName}.text}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="webhookURL"
              render={({field}) => (
                  <FormItem>
                      <FormLabel>Webhook URL</FormLabel>
                      <FormControl>
                        <Input
                        placeholder="http://discord.com/api/webhooks/..."
                        {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Get this from Slack: Workspace Settings → 
                        Workflows →
                        Webhooks
                      </FormDescription>
                      <FormDescription>
                        Make sure "key" is set to "content"
                      </FormDescription>
                      <FormMessage/>
                  </FormItem>
              )}
            />
            <FormField
              name="content"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Summary: {{myGemini.text}}"
                      className="min-h-[96px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The message to send. Use {"{{Variables}}"} for simple
                    values
                    or {"{{json variable}}"} to stringify objects
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4">
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
