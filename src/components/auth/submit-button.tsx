"use client";

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { FaSpinner } from "react-icons/fa";

type Props = {
  icon: React.ReactNode;
} & React.PropsWithChildren;

export default function SubmitButton({ icon, children }: Props) {
  const { pending } = useFormStatus();

  return (
    <Button variant="outline" className="w-full gap-x-2" disabled={pending}>
      {pending ? <FaSpinner className="animate-spin" /> : icon}
      {children}
    </Button>
  );
}
