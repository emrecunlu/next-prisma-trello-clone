"use client";

import CreateBoardForm from "./create-board-form";
import { BoardCard } from "./board-card";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { DraggableType } from "@/types/enums";
import { useTranslations } from "next-intl";
import { updateOrder } from "@/actions/board.action";
import { reorder } from "@/lib/utils";
import { useOptimisticBoards } from "@/context/optimistic-boards-provider";
import { toast } from "sonner";
import _ from "lodash";

export default function BoardList() {
  const { boards, setBoards } = useOptimisticBoards();
  const t = useTranslations();

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !result.source) return;

    if (
      result.destination.index === result.source.index &&
      result.destination.droppableId === result.source.droppableId
    )
      return;

    if (result.type === DraggableType.BOARD) {
      setBoards(reorder(boards, result.source.index, result.destination.index));

      const response = await updateOrder({
        destination: result.destination.index,
        source: result.source.index,
      });

      if (!response.success) {
        setBoards(boards);

        toast(t("errors.error"), {
          description: response.message,
        });
      }
    } else if (result.type === DraggableType.TASK) {
      const list = Array.from(boards);
      const board = _.find(list, { id: result.source.droppableId });
      const toBoard = _.find(list, { id: result.destination.droppableId });

      if (!board || !toBoard) return;

      if (result.destination.droppableId === result.source.droppableId) {
        const ordered = reorder(
          board.tasks,
          result.source.index,
          result.destination.index
        );
        board.tasks = ordered;
        setBoards(list);

        return;
      }

      const [removed] = board.tasks.splice(result.source.index, 1);
      toBoard.tasks.splice(result.destination.index, 0, removed);

      setBoards(list);
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
            {boards.map((board, index) => (
              <Draggable
                key={board.id}
                index={index}
                draggableId={board.id}
                isDragDisabled={board.id === "-"}
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
