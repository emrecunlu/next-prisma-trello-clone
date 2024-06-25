"use client";

import CreateBoardForm from "./create-board-form";
import { BoardCard } from "./board-card";
import { Board } from "@/types/types";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { DraggableType } from "@/types/enums";
import { updateOrder } from "@/actions/board.action";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type Props = {
  boards: Board[];
};

export default function BoardList({ boards }: Props) {
  const [optimisticBoards, setOptimisticBoards] = useState<Board[]>(boards);

  const t = useTranslations();

  const handleDragEnd = async (dropResult: DropResult) => {
    const { destination, source } = dropResult;

    if (!destination || !source) return;

    if (destination.index === source.index) return;

    if (dropResult.type === DraggableType.BOARD) {
      const from = optimisticBoards.at(source.index);
      const to = optimisticBoards.at(destination.index);

      if (!from || !to) return;

      const list = Array.from(optimisticBoards);
      const [reorder] = list.splice(source.index, 1);

      list.splice(destination.index, 0, reorder);
      setOptimisticBoards(list);

      const result = await updateOrder({
        destination: destination.index,
        source: source.index,
      });

      if (!result.success) {
        setOptimisticBoards(boards);

        toast(t("errors.error"), {
          description: result.message ?? "",
        });
      }
    } else if (dropResult.type === DraggableType.TASK) {
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable
        droppableId="board"
        direction="horizontal"
        type={DraggableType.BOARD}
      >
        {(provided) => (
          <div
            className="h-full flex flex-nowrap *:flex-shrink-0 space-x-4 p-4 items-start overflow-x-auto overflow-y-hidden"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {optimisticBoards.map((board, index) => (
              <Draggable
                key={index}
                index={index}
                draggableId={index.toString()}
                disableInteractiveElementBlocking
              >
                {(provided, snapshot) => (
                  <BoardCard
                    ref={provided.innerRef}
                    board={board}
                    isDragOver={snapshot.isDragging}
                    dragHandleProps={provided.dragHandleProps}
                    draggableProps={provided.draggableProps}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            <CreateBoardForm />
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
