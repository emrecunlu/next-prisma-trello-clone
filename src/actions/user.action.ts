"use server";

import { signOut } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CreateUserDto, User } from "@/types/types";

export async function createOrUpdate(data: CreateUserDto): Promise<User> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: {
        email: data.email,
        provider: data.provider,
      },
    });

    if (user) {
      Object.assign(user, data);

      await tx.user.update({
        where: {
          id: user.id,
        },
        data: user,
      });

      return user;
    }

    const newUser = tx.user.create({ data });

    return newUser;
  });
}

export async function logout() {
  await signOut();
}
