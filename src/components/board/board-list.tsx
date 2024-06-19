"use client";
import { Board } from "@/types/types";
import CreateBoardForm from "./create-board-form";
import BoardCard from "./board-card";
import { useOptimistic } from "react";

type Props = {
  boards: Board[];
};

export default function BoardList({ boards }: Props) {
  return (
    <div className="flex flex-row flex-nowrap overflow-x-auto items-start *:flex-shrink-0 h-full p-4 space-x-4">
      {boards.map((board, index) => (
        <BoardCard key={index} board={board} />
      ))}
      <CreateBoardForm />
    </div>
  );
}
