"use client";

import { Task } from "@/types/types";
import { Textarea } from "../ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { deleteById, updateById } from "@/actions/task.action";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { DraggableProvided } from "@hello-pangea/dnd";
import { useOptimisticBoards } from "@/context/optimistic-boards-provider";
import { cn } from "@/lib/utils";

type Props = {
  task: Task;
  boardId: string;
  isDragging: boolean;
} & Omit<DraggableProvided, "innerRef">;

export const TaskCard = forwardRef<HTMLDivElement, Props>(
  ({ task, dragHandleProps, draggableProps, boardId, isDragging }, ref) => {
    const { boards, setBoards } = useOptimisticBoards();
    const t = useTranslations();

    const [hasEdit, setHasEdit] = useState<boolean>(false);

    const formRef = useRef<HTMLFormElement | null>(null);
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!textAreaRef.current || textAreaRef.current.value.length === 0) {
        return;
      }

      const list = Array.from(boards);
      const board = boards.find((x) => x.id === boardId);

      if (board) {
        board.tasks = board.tasks.map((x) =>
          x.id === task.id
            ? { ...x, description: textAreaRef.current?.value ?? "" }
            : x
        );
      }

      setBoards(list);
      setHasEdit(false);

      const result = await updateById({
        description: textAreaRef.current.value,
        id: task.id,
      });

      if (!result.success) {
        toast(t("errors.error"), {
          description: result.message ?? "",
        });
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    const handleDelete = async () => {
      const list = Array.from(boards);
      const board = list.find((x) => x.id === boardId);

      if (board) {
        board.tasks = board.tasks.filter((x) => x.id !== task.id);
      }

      setBoards(list);

      const result = await deleteById(task.id);

      if (!result.success) {
        toast(t("errors.error"), {
          description: result.message ?? "",
        });
      }
    };

    useOnClickOutside(formRef, () => setHasEdit(false));

    useEffect(() => {
      if (hasEdit) {
        textAreaRef.current?.select();

        textAreaRef.current?.setSelectionRange(
          textAreaRef.current.value.length,
          textAreaRef.current.value.length
        );
      }
    }, [hasEdit]);

    if (!hasEdit)
      return (
        <div
          className={cn(
            "bg-secondary px-3 py-2 rounded-md shadow-sm relative group text-wrap",
            {
              "opacity-70": isDragging,
            }
          )}
          ref={ref}
          {...dragHandleProps}
          {...draggableProps}
        >
          <span className="text-sm break-all">{task.description}</span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full size-7 absolute top-1 right-1 invisible group-hover:visible"
              >
                <DotsVerticalIcon />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setHasEdit(true)}>
                  {t("edit")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete}>
                  {t("delete")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );

    return (
      <div
        ref={ref}
        {...dragHandleProps}
        {...draggableProps}
        className="w-full"
      >
        <form onSubmit={handleSubmit} ref={formRef}>
          <Textarea
            ref={textAreaRef}
            onKeyDown={handleKeyDown}
            defaultValue={task.description}
            className="bg-secondary resize-none !ring-0"
            autoFocus
          />
        </form>
      </div>
    );
  }
);

TaskCard.displayName = "TaskCard";
