"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { tryCatch } from "@/lib/utils";
import {
  ActionResult,
  CreateTaskDto,
  ReorderTaskDto,
  UpdateTaskDto,
} from "@/types/types";
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

const updateOrderSchema = z.object({
  boardId: z.string().cuid(),
  taskId: z.string().cuid(),
  order: z.number().nonnegative(),
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

export const updateOrder = (reorderTaskDto: ReorderTaskDto) => {
  return tryCatch(() => {
    return prisma.$transaction(async (tx): Promise<ActionResult> => {
      const t = await getTranslations();
      const session = await auth();

      if (!session) throw new Error(t("errors.userNotFound"));

      const { data, error } = await updateOrderSchema.safeParseAsync(
        reorderTaskDto
      );

      if (error) {
        const message = error.errors.flatMap((x) => x.message).join(",\n");

        throw new Error(message);
      }

      const board = await tx.board.findFirst({
        where: { userId: session.user?.id, id: data.boardId },
        include: {
          tasks: true,
        },
      });

      if (!board) throw new Error(t("errors.boardNotFound"));

      const taskBoard = await tx.board.findFirst({
        where: {
          tasks: {
            some: {
              id: data.taskId,
            },
          },
        },
        include: {
          tasks: true,
        },
      });

      if (!taskBoard) throw new Error(t("errors.taskNotFound"));

      const boards = await tx.board.findMany({
        where: { userId: session.user?.id },
        include: {
          tasks: true,
        },
      });

      if (board.id === taskBoard.id) {
        const boardIndex = boards.findIndex((x) => x.id === data.boardId);
        const sourceIndex = taskBoard.tasks.findIndex(
          (x) => x.id === data.taskId
        );
        const destinationIndex = taskBoard.tasks.findIndex(
          (x) => x.order === data.order
        );

        const [removed] = boards[boardIndex].tasks.splice(sourceIndex, 1);
        boards[boardIndex].tasks.splice(destinationIndex, 0, removed);

        await Promise.all(
          boards[boardIndex].tasks.map(
            async (x, index) =>
              await tx.task.update({
                where: x,
                data: {
                  order: index + 1,
                },
              })
          )
        );
      } else {
        const boardIndex = boards.findIndex((x) => x.id === board.id);
        const removed = taskBoard.tasks.find((x) => x.id === data.taskId);

        if (!removed) throw new Error(t("errors.taskNotFound"));

        await tx.task.delete({
          where: {
            id: removed.id,
          },
        });

        await tx.task.updateMany({
          where: {
            boardId: taskBoard.id,
            order: {
              gt: removed.order,
            },
          },
          data: {
            order: {
              decrement: 1,
            },
          },
        });

        const newTask = await tx.task.create({
          data: {
            ...removed,
            boardId: board.id,
          },
        });

        boards[boardIndex].tasks.splice(data.order - 1, 0, newTask);

        await Promise.all(
          boards[boardIndex].tasks.map(
            async (x, index) =>
              await tx.task.update({
                where: {
                  id: x.id,
                },
                data: {
                  boardId: x.boardId,
                  order: index + 1,
                },
              })
          )
        );
      }

      revalidatePath("/");

      return {
        success: true,
      };
    });
  });
};
