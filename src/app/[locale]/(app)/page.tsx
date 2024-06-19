import { getAll } from "@/actions/board.action";
import BoardList from "@/components/board/board-list";
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
    <main className="h-[calc(100vh-theme(spacing.12))] overflow-hidden">
      <BoardList boards={boards} />
    </main>
  );
}
