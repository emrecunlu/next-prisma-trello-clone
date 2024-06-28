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
import { useOptimisticBoards } from "@/context/optimistic-boards-provider";
import { updateOrder } from "@/actions/board.action";
import { updateOrder as updateTaskOrder } from "@/actions/task.action";
import { toast } from "sonner";

export default function BoardList() {
  const { boards, setBoards } = useOptimisticBoards();
  const t = useTranslations();

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!source || !destination) return;

    if (
      source.index === destination.index &&
      source.droppableId === destination.droppableId
    )
      return;

    if (result.type === DraggableType.BOARD) {
      const boardId = result.draggableId;
      const order = destination.index + 1;

      const reorderList = Array.from(boards);
      const [removed] = reorderList.splice(source.index, 1);
      reorderList.splice(destination.index, 0, removed);

      setBoards(reorderList);

      const response = await updateOrder({
        id: boardId,
        order,
      });

      if (!response.success) {
        toast(t("errors.error"), {
          description: response.message ?? "",
        });
      }
    } else if (result.type === DraggableType.TASK) {
      const isSameBoard = source.droppableId === destination.droppableId;

      if (isSameBoard) {
        const boardIndex = boards.findIndex((x) => x.id === source.droppableId);

        if (boardIndex === -1) return;

        const reorderList = Array.from(boards);
        const [removed] = reorderList[boardIndex].tasks.splice(source.index, 1);
        reorderList[boardIndex].tasks.splice(destination.index, 0, removed);

        setBoards(reorderList);

        const response = await updateTaskOrder({
          boardId: source.droppableId,
          order: destination.index + 1,
          taskId: result.draggableId,
        });

        if (!response.success) {
          toast(t("errors.error"), {
            description: response.message ?? "",
          });
        }
      } else {
        const boardIndex = boards.findIndex((x) => x.id === source.droppableId);
        const destinationBoardIndex = boards.findIndex(
          (x) => x.id === destination.droppableId
        );

        if (boardIndex === -1 || destinationBoardIndex === -1) return;

        const reorderList = Array.from(boards);
        const [removed] = reorderList[boardIndex].tasks.splice(source.index, 1);
        reorderList[destinationBoardIndex].tasks.splice(
          destination.index,
          0,
          removed
        );

        setBoards(reorderList);

        const response = await updateTaskOrder({
          boardId: destination.droppableId,
          order: destination.index + 1,
          taskId: result.draggableId,
        });

        if (!response.success) {
          toast(t("errors.error"), {
            description: response.message ?? "",
          });
        }
      }
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
