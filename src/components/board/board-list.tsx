"use client";

import CreateBoardForm from "./create-board-form";
import BoardCard from "./board-card";
import { Board } from "@/types/types";

type Props = {
  boards: Board[];
};

export default function BoardList({ boards }: Props) {
  return (
    <div className="h-full flex flex-nowrap *:flex-shrink-0 space-x-4 p-4 overflow-x-auto">
      {boards.map((board, index) => (
        <BoardCard key={index} board={board} />
      ))}
      <CreateBoardForm />
    </div>
  );
}
