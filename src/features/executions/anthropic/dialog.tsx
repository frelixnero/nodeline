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

import Image from "next/image";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CredentialType } from "@/generated/prisma/enums";
import { useCredentialsType } from "@/features/credentials/hooks/use-credentials";

const AVAILABLE_MODELS = [
  "claude-sonnet-4-5",
  "claude-haiku-4-5",
  "claude-opus-4-1",
] as const;

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
      message:
        "Variable name must start with a letter or underscore and can only contain letters, numbers, and underscores.",
    }),
  model: z.enum(AVAILABLE_MODELS),
  credentialId: z.string().min(1, "Credential is required"),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, { message: "User Prompt is required" }),
});

export type AnthropicFormValues = z.infer<typeof formSchema>;

interface AnthropicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<AnthropicFormValues>;
  defaultVariableName?: string;
}

export const AnthropicDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  defaultVariableName = "",
}: AnthropicDialogProps) => {
  const {  
    data: credentials, 
    isLoading: isLoadingCredentials
  } = useCredentialsType(CredentialType.ANTHROPIC)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || defaultVariableName,
      credentialId: defaultValues.credentialId || "",
      model: defaultValues.model || AVAILABLE_MODELS[0],
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || defaultVariableName,
        model: defaultValues.model || AVAILABLE_MODELS[0],
        credentialId: defaultValues.credentialId || "",
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",
      });
    }
  }, [
    open,
    defaultVariableName,
    defaultValues.variableName,
    defaultValues.model,
    defaultValues.credentialId,
    defaultValues.systemPrompt,
    defaultValues.userPrompt,
    form,
  ]);

  const watchVariableName = form.watch("variableName") || "myAnthropic";

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Anthropic</DialogTitle>
          <DialogDescription>
            Configure the Anthropic node settings here.
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
                    <Input placeholder="myAnthropic call" {...field} />
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
              name="credentialId"
              render={({field}) => (
                  <FormItem>
                      <FormLabel>Anthropic Credential</FormLabel>
                      <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingCredentials
                        || !credentials?.length
                      }
                      >
                        <FormControl>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a credential"/>
                            </SelectTrigger>
                        </FormControl>   
                        <SelectContent>
                            {credentials?.map((credential) => 
                                <SelectItem
                                key={credential.id}
                                value={credential.id}
                                >
                                  <div className="flex items-center gap-2">
                                      <Image
                                      src="/logos/anthropic.svg"
                                      alt="Anthropic"
                                      width={16}
                                      height={16}
                                      /> 
                                      {credential.name}                                                   
                                  </div>
                                </SelectItem>
                            )}
                        </SelectContent>
                      </Select>
                      <FormMessage/>
                  </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The Anthropic model used to generate the response.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="systemPrompt"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="You are a helpful assistant..."
                      className="min-h-[96px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="userPrompt"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write the prompt you want to send to the model..."
                      className="min-h-[96px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The prompt the selected model will respond to. Use {"{{variable}}"} for
                    simple values or {"{{json variable}}"} to stringify objects.
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
