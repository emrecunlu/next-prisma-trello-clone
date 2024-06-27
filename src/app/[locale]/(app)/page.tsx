import { getAll } from "@/actions/board.action";
import BoardList from "@/components/board/board-list";
import CreateBoardForm from "@/components/board/create-board-form";
import { OptimisticBoardsProvider } from "@/context/optimistic-boards-provider";
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
    <OptimisticBoardsProvider initialState={boards}>
      <div className="h-[calc(100vh-theme(spacing.12))] overflow-hidden">
        <BoardList />
      </div>
    </OptimisticBoardsProvider>
  );
}
