"use client";

import { FormVisibility } from "@/types/types";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { Textarea } from "../ui/textarea";
import { useOnClickOutside } from "usehooks-ts";

export default function CreateTaskForm() {
  const [formVisibility, setFormVisibility] =
    useState<FormVisibility>("hidden");

  const formRef = useRef<HTMLFormElement | null>(null);

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
    <form className="grid space-y-2" ref={formRef}>
      <Textarea className="bg-secondary !ring-0 resize-none" autoFocus />
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
