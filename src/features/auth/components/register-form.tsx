"use client"

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import Link from "next/link";
import {useRouter} from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
// import { authClient } from "@/lib/auth-client"

const registerSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterForm(){
    const router = useRouter();
    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues:{
            email: "",
            password: "",
            confirmPassword:""
        }
    });

    const onSubmit = async(values: RegisterFormValues)=>{
        const derivedName = values.email.split("@")[0] || values.email;

        try {
            const result = await authClient.signUp.email({
                name: derivedName,
                email: values.email,
                password: values.password,
                callbackURL: '/workflows',
            });

            if (result?.error) {
                toast.error(result.error.message || "Unable to create account");
                return;
            }

            toast.success("Account created successfully");
            router.replace('/workflows');
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to create account";
            toast.error(message);
        }
    }

    const onInvalid = () => {
        toast.error("Please fix the highlighted form errors");
    };

    const isPending = form.formState.isSubmitting;

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>
                        Get Started
                    </CardTitle>
                    <CardDescription>
                        Create Your Account to Get Started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
                            <div className="grid gap-6">
                                <div className='flex flex-col gap-4'>
                                    <Button variant="outline" 
                                    className="w-full" type="button" disabled={isPending}>
                                        <Image src="/logos/github.svg" width={20} height={20} alt="GitHub Logo" />
                                        Contiue with Github
                                    </Button>
                                    <Button variant="outline" 
                                    className="w-full" type="button" disabled={isPending}>
                                        <Image src="/logos/google.svg" width={20} height={20} alt="Google Logo" />
                                        Contiue with Google
                                    </Button>
                                </div>
                                <div className="grid gap-6"> 
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="m@example.com"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="*********"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Confirm Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="*********"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isPending}>
                                        Register
                                    </Button>
                                </div>
                                <div className="text-center text-sm">
                                    Already have an account?{" "}
                                    <Link href="/login" className="underline underline-offset-4 font-medium">
                                    Login
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}