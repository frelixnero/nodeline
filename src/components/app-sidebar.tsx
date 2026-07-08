"use client";

import {
    CreditCardIcon,
    FolderOpenIcon,
    HistoryIcon,
    KeyIcon,
    LogOutIcon,
    StarIcon
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "./ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subsciprion";

const menuItems = [{
    title: "Home",
    items: [
        {
            title: "Workflows",
            icon: FolderOpenIcon,
            url: "/workflows"
        },
        {
            title: "Credentials",
            icon: KeyIcon,
            url: "/credentials"
        },
        {
            title: "Executions",
            icon: HistoryIcon,
            url: "/executions"
        }
    ]
}]

export const AppSidebar = () => {
    const router = useRouter();
    const pathName = usePathname();
    const { hasActiveSubscription } = useHasActiveSubscription();

    return (
        <Sidebar collapsible="icon" className="w-64">
            <SidebarHeader>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild className="gap-x-4 h-10 px-4">
                        <Link prefetch href="/">
                            <Image src="/logos/nodeflow svg.svg" alt="Nodeflow Logo" width={100} height={50}/>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarHeader>
            <SidebarContent>
                {menuItems.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton tooltip={item.title} isActive={item.url === "/" 
                                        ? pathName === "/"
                                        : pathName.startsWith(item.url)
                                    } asChild className="gap-x-4 h-10 px-4">
                                            <Link href={item.url} prefetch>
                                            <item.icon className="size-4"/>
                                            <span>
                                                {item.title}
                                            </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    {!hasActiveSubscription &&(
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Upgrade to Pro" className="gap-x-4 h-10 px-4" onClick={()=> authClient.checkout({slug: "Nodeflow-Pro"})}>
                            <StarIcon className="h-4 w-4"/>
                            <span>Upgrade to Pro</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    )}
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Billing Portal" className="gap-x-4 h-10 px-4" onClick={()=> authClient.customer.portal()}>
                            <CreditCardIcon className="h-4 w-4"/>
                            <span>Billing Portal</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Log Out" className="gap-x-4 h-10 px-4" onClick={()=> authClient.signOut({
                            fetchOptions: {
                                onSuccess: () =>{
                                    router.push("/login");
                                }
                            }
                        })}>
                            <LogOutIcon className="h-4 w-4"/>
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

