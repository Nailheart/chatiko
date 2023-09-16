import NextAuth, { AuthOptions } from "next-auth";
import { Redis } from "@upstash/redis";
import { UpstashRedisAdapter } from '@next-auth/upstash-redis-adapter';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

const redis = Redis.fromEnv();

export const authOptions: AuthOptions = {
  adapter: UpstashRedisAdapter(redis),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
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

      return {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        picture: currentUser.image,
      }
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };