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
    username: z.string().optional(),
    content: z
      .string()
      .min(1, "Message content is not specified")
      .max(2000, "Discord messages are limited to 2000 characters"),
    webhookURL: z.string().min(1, "Webhook URL is required")
});

export type DiscordFormValues = z.infer<typeof formSchema>;

interface DiscordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<DiscordFormValues>;
  defaultVariableName?: string;
}

export const DiscordDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  defaultVariableName = "",
}: DiscordDialogProps) => {
  

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: defaultValues.username|| "",
      variableName: defaultValues.variableName || defaultVariableName,
      content: defaultValues.content || "",
      webhookURL: defaultValues.webhookURL || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
      username: defaultValues.username|| "",
      variableName: defaultValues.variableName || defaultVariableName,
      content: defaultValues.content || "",
      webhookURL: defaultValues.webhookURL || "",
      });
    }
  }, [
    open,
    defaultVariableName,
    defaultValues.username,
    defaultValues.variableName,
    defaultValues.content,
    defaultValues.webhookURL,
    form,
  ]);

  const watchVariableName = form.watch("variableName") || "myDiscordCall";

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Discord Config</DialogTitle>
          <DialogDescription>
            Configure the Discord node settings here.
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
                    <Input placeholder="myDiscordCall" {...field} />
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
                        Get this from Discord: Channel Settings → 
                        Integrations →
                        Webhooks
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
            <FormField
              control={form.control}
              name="username"
              render={({field}) => (
                  <FormItem>
                      <FormLabel>Bot username (Optional)</FormLabel>
                      <FormControl>
                        <Input
                        placeholder="Workflow Bot"
                        {...field}
                        />
                      </FormControl>
                      <FormDescription>
                       Override default bot username
                      </FormDescription>
                      <FormMessage/>
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
