"use server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  ActionResult,
  Board,
  ReoderBoardDto,
  UpdateBoardDto,
} from "@/types/types";
import { tryCatch } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

const createSchema = z.object({
  title: z.string().min(1).max(30),
});

const deleteSchema = z.object({
  boardId: z.string().cuid(),
});

const updateSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(30),
});

const orderSchema = z.object({
  id: z.string().cuid(),
  order: z.number(),
});

const reorder = async (userId: string, tx: Prisma.TransactionClient) => {
  const boards = await tx.board.findMany({
    where: {
      userId,
    },
  });

  for (let i = 0; i < boards.length; i++) {
    await tx.board.update({
      where: boards[i],
      data: {
        order: i + 1,
      },
    });
  }
};

export async function getAll(): Promise<Board[]> {
  const session = await auth();

  const boards = await prisma.board.findMany({
    include: {
      tasks: {
        select: {
          id: true,
          order: true,
          description: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    where: {
      userId: session?.user?.id,
    },
    orderBy: {
      order: "asc",
    },
  });

  return boards.map((x) => ({
    id: x.id,
    order: x.order,
    tasks: x.tasks,
    title: x.title,
  }));
}

export async function create(title: string): Promise<ActionResult> {
  return tryCatch(() => {
    return prisma.$transaction(async (tx): Promise<ActionResult> => {
      const t = await getTranslations();
      const session = await auth();

      if (!session) throw new Error(t("errors.userNotFound"));

      const { data, error } = await createSchema.safeParseAsync({ title });

      if (error) {
        const message = error.errors.flatMap((x) => x.message).join(",\n");

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

export async function deleteById(boardId: string): Promise<ActionResult> {
  return tryCatch(() => {
    return prisma.$transaction(async (tx): Promise<ActionResult> => {
      const t = await getTranslations();
      const session = await auth();

      if (!session) throw new Error(t("errors.userNotFound"));

      const { error, data } = await deleteSchema.safeParseAsync({ boardId });

      if (error) {
        const message = error.errors.flatMap((x) => x.message).join(",\n");

        throw new Error(message);
      }

      const board = await tx.board.findFirst({
        where: {
          userId: session.user?.id as string,
          id: data.boardId,
        },
      });

      if (!board) throw new Error(t("errors.boardNotFound"));

      await tx.board.delete({ where: board });

      await reorder(session.user?.id as string, tx);

      revalidatePath("/");

      return {
        success: true,
      };
    });
  });
}

export async function update(updateBoardDto: UpdateBoardDto) {
  return tryCatch(() => {
    return prisma.$transaction(async (tx): Promise<ActionResult> => {
      const t = await getTranslations();
      const session = await auth();

      if (!session) throw new Error(t("errors.userNotFound"));

      const { error, data } = await updateSchema.safeParseAsync(updateBoardDto);

      if (error) {
        const message = error.errors.flatMap((x) => x.message).join(",\n");

        throw new Error(message);
      }

      const board = await tx.board.findFirst({
        where: {
          id: data.id,
          userId: session.user?.id,
        },
      });

      if (!board) throw new Error(t("errors.boardNotFound"));

      await tx.board.update({
        where: {
          userId: session.user?.id as string,
          id: data.id,
        },
        data: {
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

export async function updateOrder(reorderBoardDto: ReoderBoardDto) {
  return tryCatch(() => {
    return prisma.$transaction(async (tx): Promise<ActionResult> => {
      const t = await getTranslations();
      const session = await auth();

      if (!session) throw new Error(t("errors.userNotFound"));

      const { error, data } = await orderSchema.safeParseAsync(reorderBoardDto);

      if (error) {
        const message = error.errors.flatMap((x) => x.message).join(",\n");

        throw new Error(message);
      }

      const from = await tx.board.findFirst({
        where: { userId: session.user?.id, id: data.id },
      });

      const to = await tx.board.findFirst({
        where: { userId: session.user?.id, order: data.order },
      });

      if (!from || !to) throw new Error(t("errors.boardNotFound"));

      await tx.board.update({ where: from, data: { order: to.order } });
      await tx.board.update({ where: to, data: { order: from.order } });

      revalidatePath("/");

      return {
        success: true,
      };
    });
  });
}
