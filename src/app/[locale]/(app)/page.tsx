import { getAll } from "@/actions/board.action";
import BoardCard from "@/components/board/board-card";
import BoardList from "@/components/board/board-list";
import CreateBoardForm from "@/components/board/create-board-form";
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
    <div className="h-[calc(100vh-theme(spacing.12))] overflow-hidden">
      <BoardList boards={boards} />
    </div>
  );
}
