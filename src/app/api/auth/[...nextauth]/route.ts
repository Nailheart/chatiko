import NextAuth, { AuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import GoogleProvider from "next-auth/providers/google";

import { redis } from "@/lib/redis";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !NEXTAUTH_SECRET) {
  throw new Error(
    "Missing environment variables. Please check your configuration.",
  );
}

export const authOptions: AuthOptions = {
  adapter: UpstashRedisAdapter(redis),
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }

      return session;
    },
    async jwt({ token, user }) {
      const currentUser = await redis.get<User | null>(`user:${token.id}`);

      if (!currentUser) {
        if (user) {
          token.id = user.id;
        }

        return token;
      }

      // add a new user or ignore if it already exists
      await redis.sadd("all_users", currentUser);

      return {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        picture: currentUser.image,
      };
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
  secret: NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
