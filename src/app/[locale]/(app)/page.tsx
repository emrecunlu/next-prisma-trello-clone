import { getAll } from "@/actions/board.action";
import CreateBoardForm from "@/components/board/create-board-form";
import { Button } from "@/components/ui/button";
import { auth, signIn, signOut } from "@/lib/auth";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");

  return {
    title: t("title"),
  };
}

export default async function Home() {
  const boards = await getAll();

  return (
    <div className="p-4">
      <CreateBoardForm />

      <pre>{JSON.stringify(boards, null, 2)}</pre>
    </div>
  );
}
