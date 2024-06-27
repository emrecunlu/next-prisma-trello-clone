"use client";

import { Board } from "@/types/types";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Cross2Icon, DragHandleDots2Icon } from "@radix-ui/react-icons";
import { forwardRef, useEffect, useRef } from "react";
import { deleteById, update } from "@/actions/board.action";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import CreateTaskForm from "../task/create-task-form";
import { TaskCard } from "../task/task-card";
import {
  Draggable,
  Droppable,
  type DraggableProvided,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { DraggableType } from "@/types/enums";
import { useOptimisticBoards } from "@/context/optimistic-boards-provider";

type Props = {
  board: Board;
  isDragOver?: boolean;
} & Omit<DraggableProvided, "innerRef">;

export const BoardCard = forwardRef<HTMLDivElement, Props>(
  ({ board, dragHandleProps, draggableProps, isDragOver }, ref) => {
    const { setBoards, boards } = useOptimisticBoards();
    const t = useTranslations();

    const formRef = useRef<HTMLFormElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!inputRef.current) return;

      if (inputRef.current.value.length === 0) {
        inputRef.current.value = board.title;
        inputRef.current.blur();
        return;
      }

      inputRef.current.blur();

      const result = await update({
        id: board.id,
        title: inputRef.current.value,
      });

      if (!result.success) {
        inputRef.current.value = board.title;

        toast(t("errors.error"), {
          description: result.message ?? "",
        });
      }
    };

    const handleDelete = async () => {
      setBoards(boards.filter((x) => x.id !== board.id));

      const result = await deleteById(board.id);

      if (!result.success) {
        toast(t("errors.error"), {
          description: result.message ?? "",
        });
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        formRef.current?.requestSubmit();
      }
    };

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.value = board.title;
      }
    }, [board.title]);

    return (
      <Card
        className={cn("w-80 flex flex-col p-2 space-y-2 max-h-full", {
          "opacity-70": isDragOver,
        })}
        ref={ref}
        {...draggableProps}
      >
        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-1"
          ref={formRef}
        >
          <div {...dragHandleProps}>
            <DragHandleDots2Icon className="size-5" />
          </div>

          <Input
            className="flex-1 font-semibold border-0 cursor-pointer focus:cursor-auto shadow-none focus:bg-secondary"
            defaultValue={board.title}
            ref={inputRef}
            onKeyDown={handleKeyDown}
            onFocus={() => inputRef.current?.select()}
          />
          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={handleDelete}
          >
            <Cross2Icon />
          </Button>
        </form>

        <Droppable droppableId={board.id} type={DraggableType.TASK}>
          {(provided) => (
            <div
              className="flex-1 grid overflow-auto -mx-2 px-2 space-y-2"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {board.tasks.map((task, index) => (
                <Draggable
                  key={task.id}
                  index={index}
                  draggableId={task.id}
                  isDragDisabled={task.id === "-"}
                  shouldRespectForcePress
                >
                  {(provided, snapshot) => (
                    <TaskCard
                      isDragging={snapshot.isDragging}
                      dragHandleProps={provided.dragHandleProps}
                      draggableProps={provided.draggableProps}
                      boardId={board.id}
                      task={task}
                      ref={provided.innerRef}
                    />
                  )}
                </Draggable>
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <CreateTaskForm boardId={board.id} />
      </Card>
    );
  }
);

BoardCard.displayName = "BoardCard";

/* const BoardCard = async ({ board, dragHandleProps, draggableProps }: Props) => {
  const t = useTranslations();

  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!inputRef.current) return;

    if (inputRef.current.value.length === 0) {
      inputRef.current.value = board.title;
      inputRef.current.blur();
      return;
    }

    inputRef.current.blur();

    const result = await update({
      id: board.id,
      title: inputRef.current.value,
    });

    if (!result.success) {
      inputRef.current.value = board.title;

      toast(t("errors.error"), {
        description: result.message ?? "",
      });
    }
  };

  const handleDelete = async () => {
    const result = await deleteById(board.id);

    if (!result.success) {
      toast(t("errors.error"), {
        description: result.message ?? "",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      formRef.current?.requestSubmit();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = board.title;
    }
  }, [board.title]);

  return (
    <Card
      className="w-80 flex flex-col p-2 space-y-2 max-h-full"
      {...dragHandleProps}
      {...draggableProps}
    >
      <form
        onSubmit={handleSubmit}
        className="flex items-center space-x-1"
        ref={formRef}
      >
        <Input
          className="flex-1 font-semibold border-0 cursor-pointer focus:cursor-auto shadow-none focus:bg-secondary"
          defaultValue={board.title}
          ref={inputRef}
          onKeyDown={handleKeyDown}
          onFocus={() => inputRef.current?.select()}
        />
        <Button
          size="icon"
          variant="ghost"
          type="button"
          onClick={handleDelete}
        >
          <Cross2Icon />
        </Button>
      </form>

      {board.tasks.length > 0 && (
        <div className="overflow-y-auto flex flex-col space-y-2 px-2 -mx-2">
          {board.tasks.map((task, index) => (
            <TaskCard key={index} task={task} boardId={board.id} />
          ))}
        </div>
      )}

      <CreateTaskForm boardId={board.id} />
    </Card>
  );
};
 */
