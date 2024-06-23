"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { tryCatch } from "@/lib/utils";
import { ActionResult, CreateTaskDto, UpdateTaskDto } from "@/types/types";
import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createSchema = z.object({
  description: z.string().min(1).max(100),
  boardId: z.string().cuid(),
});

const deleteSchema = z.object({
  id: z.string().cuid(),
});

const updateSchema = z.object({
  id: z.string().cuid(),
  description: z.string().min(1).max(100),
});

const reorder = async (boardId: string, tx: Prisma.TransactionClient) => {
  const tasks = await tx.task.findMany({
    where: {
      boardId,
    },
  });

  for (let i = 0; i < tasks.length; i++) {
    await tx.task.update({
      where: tasks[i],
      data: {
        order: i + 1,
      },
    });
  }
};

export async function create(createTaskDto: CreateTaskDto) {
  return tryCatch(() => {
    return prisma.$transaction(async (tx): Promise<ActionResult> => {
      const t = await getTranslations();
      const session = await auth();

      if (!session) throw new Error(t("errors.userNotFound"));

      const { data, error } = await createSchema.safeParseAsync(createTaskDto);

      if (error) {
        const message = error.errors.flatMap((x) => x.message).join(",\n");

        throw new Error(message);
      }

      const board = await tx.board.findFirst({
        where: {
          id: data.boardId,
          userId: session.user?.id,
        },
      });

      if (!board) throw new Error(t("errors.boardNotFound"));

      const lastRecord = await tx.task.findFirst({
        orderBy: {
          order: "desc",
        },
        where: {
          boardId: board.id,
          userId: session.user?.id,
        },
      });

      await tx.task.create({
        data: {
          boardId: board.id,
          userId: session.user?.id as string,
          description: data.description,
          order: lastRecord ? lastRecord.order + 1 : 1,
        },
      });

      revalidatePath("/");

      return {
        success: true,
      };
    });
  });
}

export async function deleteById(id: string) {
  return tryCatch(() => {
    return prisma.$transaction(async (tx): Promise<ActionResult> => {
      const t = await getTranslations();
      const session = await auth();

      if (!session) throw new Error(t("errors.userNotFound"));

      const { data, error } = await deleteSchema.safeParseAsync({ id });

      if (error) {
        const message = error.errors.flatMap((x) => x.message).join(",\n");

        throw new Error(message);
      }

      const task = await tx.task.findFirst({
        where: {
          id: data.id,
          userId: session.user?.id,
        },
      });

      if (!task) throw new Error(t("errors.taskNotFound"));

      await tx.task.delete({
        where: task,
      });

      await reorder(task.boardId, tx);

      revalidatePath("/");

      return {
        success: true,
      };
    });
  });
}

export const updateById = (updateTaskDto: UpdateTaskDto) => {
  return tryCatch(() => {
    return prisma.$transaction(async (tx): Promise<ActionResult> => {
      const t = await getTranslations();
      const session = await auth();

      if (!session) throw new Error(t("errors.userNotFound"));

      const { data, error } = await updateSchema.safeParseAsync(updateTaskDto);

      if (error) {
        const message = error.errors.flatMap((x) => x.message).join(",\n");

        throw new Error(message);
      }

      const task = await tx.task.findFirst({
        where: {
          id: data.id,
          userId: session.user?.id,
        },
      });

      if (!task) throw new Error(t("errors.taskNotFound"));

      await tx.task.update({
        where: task,
        data: {
          description: updateTaskDto.description,
        },
      });

      revalidatePath("/");

      return {
        success: true,
      };
    });
  });
};
