"use client";

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const LogoutButton = () => {
    const router = useRouter()
    const handleLogout = async () => {
        const result = await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login");
                },
            },
        });

        if (result?.error) {
            toast.error(result.error.message || "Unable to sign out");
        }
    };

    return (
        <div>
            <Button onClick={handleLogout}>
                Logout
            </Button>
        </div>
    )
}