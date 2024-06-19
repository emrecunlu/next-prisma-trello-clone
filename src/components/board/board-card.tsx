"use client";

import { Board } from "@/types/types";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useRef } from "react";
import { deleteById, update } from "@/actions/board.action";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import CreateTaskForm from "../task/create-task-form";

type Props = {
  board: Board;
};

export default function BoardCard({ board }: Props) {
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

  return (
    <Card className="w-80 p-2 grid space-y-2">
      <form
        onSubmit={handleSubmit}
        className="flex items-center space-x-1"
        ref={formRef}
      >
        <Input
          className="flex-1 font-semibold border-0 cursor-pointer focus:cursor-auto shadow-none"
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

      <CreateTaskForm />
    </Card>
  );
}
