import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Sidebar } from "@/components/sidebar/sidebar";

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = {
  title: "Chatiko | Dashboard",
};

const Layout = async ({ children }: Props) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  const chats = await redis.smembers<Chat[]>(`user:${session.user.id}:chats`);
  const friends = await redis.smembers<User[]>(
    `user:${session.user.id}:friend_list`,
  );
  const friendRequests = await redis.smembers(
    `user:${session.user.id}:incoming_friend_requests`,
  );
  const unseenMessages = await redis.lrange<UnseenMessage>(
    `user:${session.user.id}:unseen_messages`,
    0,
    -1,
  );

  return (
    <div className="flex">
      <Sidebar
        user={session.user as User}
        initialChats={chats}
        initialFriends={friends}
        initialFriendRequests={friendRequests.length}
        initialUnseenMessages={unseenMessages}
      />

      <div className="min-h-screen w-full">{children}</div>
    </div>
  );
};

export default Layout;
