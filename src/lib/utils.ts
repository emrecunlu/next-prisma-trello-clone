import { ActionResult } from "@/types/types";
import { type ClassValue, clsx } from "clsx";
import { getTranslations } from "next-intl/server";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function tryCatch<T>(
  cb: () => Promise<ActionResult<T>> | ActionResult<T>
): Promise<ActionResult<T>> {
  const t = await getTranslations();

  try {
    return await cb();
  } catch (e) {
    let message = t("errors.unknown");

    if (e instanceof Error) {
      message = e.message;
    }

    return {
      message,
      success: false,
    };
  }
}
