import Link from "next/link";

import Image from "next/image";

export const AuthLayout = ({children}: { children: React.ReactNode}) => {
    return(
        <div className="bg-muted flex min-h-svh flex-col jsutify-center gap-6 p-6 md:pd-10 items-center">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Link href="/" className="flex items-center gap-2 self-center font-medium">
                    <Image src="/logos/nodeFlow svg.svg" alt="NodeFlow Logo" width={100} height={100} />
                </Link>
                {children} 
            </div> 
        </div>
    )
}