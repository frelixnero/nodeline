// import LoginForm from "@/features/auth/components/login-form";
// import { requireUnAuth } from "@/lib/auth-utils";
// import Link from "next/link";

// import Image from "next/image";
import { AuthLayout } from "@/features/auth/components/auth-layout";
const Layout = ({children}: { children: React.ReactNode}) => {
    return(
        <AuthLayout>
                {children} 
        </AuthLayout>
    )
}

export default Layout;