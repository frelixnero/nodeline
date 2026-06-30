import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";

const Page = async () => {
  const users = await prisma.user.findMany()

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      <Button>
        CLick me
      </Button>
      {JSON.stringify(users)}
    </div>
  )
}

export default Page