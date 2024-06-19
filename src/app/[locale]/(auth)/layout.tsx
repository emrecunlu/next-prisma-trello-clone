import { auth } from "@/lib/auth";
import { redirect } from "@/lib/navigation";

export default async function Layout({ children }: React.PropsWithChildren) {
  const session = await auth();

  if (session) redirect("/");

  return <div>{children}</div>;
}
