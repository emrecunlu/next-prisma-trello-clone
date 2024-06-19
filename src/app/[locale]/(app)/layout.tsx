import Header from "@/components/header/header";
import { auth } from "@/lib/auth";
import { redirect } from "@/lib/navigation";
import Image from "next/image";

export default async function Layout({ children }: React.PropsWithChildren) {
  const session = await auth();

  if (!session) redirect("/signin");

  return (
    <div className="relative h-screen overflow-hidden">
      <Header />
      {children}
      <Image
        src="/images/background.jpg"
        alt="Background"
        fill
        priority
        className="object-cover object-center -z-10 dark:brightness-50 brightness-75"
      />
    </div>
  );
}
