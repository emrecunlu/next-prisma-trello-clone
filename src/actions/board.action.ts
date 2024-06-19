"use server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ActionResult } from "@/types/types";
import { tryCatch } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

const createSchema = z.object({
  title: z.string().min(1).max(30),
});

export async function getAll() {
  const session = await auth();

  return prisma.board.findMany({
    include: {
      tasks: true,
    },
    where: {
      userId: session?.user?.id,
    },
    orderBy: {
      order: "asc",
    },
  });
}

export async function create(title: string): Promise<ActionResult> {
  return tryCatch(() => {
    return prisma.$transaction(async (tx): Promise<ActionResult> => {
      const t = await getTranslations();
      const session = await auth();

      if (!session) throw new Error(t("errors.userNotFound"));

      const { data, error } = await createSchema.safeParseAsync({ title });

      if (error) {
        const message = error.errors.flatMap((x) => x.message).join("\n");

        throw new Error(message);
      }

      const lastRecord = await tx.board.findFirst({
        orderBy: {
          order: "desc",
        },
      });

      await tx.board.create({
        data: {
          userId: session.user?.id as string,
          order: lastRecord ? lastRecord.order + 1 : 1,
          title: data.title,
        },
      });

      revalidatePath("/");

      return {
        success: true,
      };
    });
  });
}
