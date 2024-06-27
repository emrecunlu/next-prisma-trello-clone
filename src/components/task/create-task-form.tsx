"use client";

import { FormVisibility } from "@/types/types";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { Textarea } from "../ui/textarea";
import { useOnClickOutside } from "usehooks-ts";
import { create } from "@/actions/task.action";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useOptimisticBoards } from "@/context/optimistic-boards-provider";

type Props = {
  boardId: string;
};

export default function CreateTaskForm({ boardId }: Props) {
  const { boards, setBoards } = useOptimisticBoards();
  const t = useTranslations();

  const [formVisibility, setFormVisibility] =
    useState<FormVisibility>("hidden");

  const formRef = useRef<HTMLFormElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!textAreaRef.current || textAreaRef.current?.value.length === 0) return;

    const description = textAreaRef.current.value;

    formRef.current?.reset();

    const list = Array.from(boards);
    const board = list.find((x) => x.id === boardId);

    if (board)
      board.tasks.push({
        id: "-",
        order: board.tasks.length + 1,
        description,
      });

    setBoards(list);

    const result = await create({
      boardId,
      description,
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

  useOnClickOutside(formRef, () => setFormVisibility("hidden"));

  if (formVisibility === "hidden") {
    return (
      <Button
        onClick={() => setFormVisibility("visible")}
        variant="ghost"
        className="flex items-center gap-x-1.5 justify-start"
      >
        <PlusIcon />
        Add a card
      </Button>
    );
  }

  return (
    <form className="grid space-y-2" ref={formRef} onSubmit={handleSubmit}>
      <Textarea
        className="bg-secondary !ring-0 resize-none"
        autoFocus
        ref={textAreaRef}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center space-x-1">
        <Button type="submit">Add card</Button>
        <Button
          size="icon"
          variant="ghost"
          type="button"
          onClick={() => setFormVisibility("hidden")}
        >
          <Cross2Icon />
        </Button>
      </div>
    </form>
  );
}
