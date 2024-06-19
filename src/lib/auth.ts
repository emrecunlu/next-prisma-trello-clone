import { createOrUpdate } from "@/actions/user.action";
import NextAuth from "next-auth";
import github from "next-auth/providers/github";
import google from "next-auth/providers/google";

export const { auth, handlers, signIn, signOut, unstable_update } = NextAuth({
  providers: [google, github],
  callbacks: {
    async signIn({ account, user }) {
      try {
        const credentials = await createOrUpdate({
          email: user?.email as string,
          fullName: user?.name as string,
          photoUrl: user?.image as string,
          provider: account?.provider as string,
        });

        user.id = credentials.id;

        return true;
      } catch (e) {
        return false;
      }
    },
    jwt({ token, user, account }) {
      if (account && user) {
        token.sub = user.id;
      }

      return token;
    },
    session({ token, session }) {
      if (token) {
        session.user.id = token.sub as string;
      }

      return session;
    },
  },
});
