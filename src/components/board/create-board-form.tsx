"use client";

import { FormVisibility } from "@/types/types";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { Card } from "../ui/card";
import { useOnClickOutside } from "usehooks-ts";
import { Input } from "../ui/input";
import { create } from "@/actions/board.action";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function CreateBoardForm() {
  const t = useTranslations();
  const [formVisibility, setFormVisibility] =
    useState<FormVisibility>("hidden");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const title = inputRef.current?.value;

    if (!title || title?.length === 0) return;

    formRef.current?.reset();

    const result = await create(title);

    if (!result.success) {
      toast(t("errors.error"), {
        description: result.message,
      });
    }
  };

  useOnClickOutside(formRef, () => setFormVisibility("hidden"));

  if (formVisibility === "hidden") {
    return (
      <Button
        className="w-80 bg-background border"
        size="lg"
        variant="secondary"
        onClick={() => setFormVisibility("visible")}
      >
        <PlusIcon className="me-2" />
        Add another list
      </Button>
    );
  }

  return (
    <Card className="w-80 p-2">
      <form onSubmit={handleSubmit} ref={formRef} className="grid space-y-2">
        <Input placeholder="Enter list title..." ref={inputRef} autoFocus />

        <div className="flex items-center space-x-1">
          <Button type="submit">Add list</Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => setFormVisibility("hidden")}
          >
            <Cross2Icon />
          </Button>
        </div>
      </form>
    </Card>
  );
}
