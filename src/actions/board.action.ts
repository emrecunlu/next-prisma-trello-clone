"use server";
import { string, z } from "zod";
import prisma from "@/lib/prisma";
import { ActionResult, UpdateBoardDto } from "@/types/types";
import { tryCatch } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

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

      await tx.board.updateMany({
        where: {
          order: {
            gt: board.order,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      });

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
