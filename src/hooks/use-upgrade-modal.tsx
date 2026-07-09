import { TRPCClientError} from "@trpc/client";
import { useState } from "react";
import { UpgradeModal } from "../components/upgrade-modal";


export const useUpgradeModal = () => {
    const [open, setOpen] =  useState(false);

    const handleError = (error: unknown) => {
        if (error instanceof TRPCClientError) {
            const isForbidden = error.data?.code === "FORBIDDEN";
            const isPremiumGateFallback =
                error.data?.code === "INTERNAL_SERVER_ERROR" &&
                error.message.includes("validate subscription status");

            if (isForbidden || isPremiumGateFallback) {
                setOpen(true);
                return true;

            } 
        }
        return false;
    }
    const modal = <UpgradeModal open={open} onOpenChange={setOpen} />

    return { handleError, modal };
}