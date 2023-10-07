import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { pusherServer } from "@/lib/pusher";

const DELETE = async (req: Request) => {
  try {
    const { chat, isGroupChat } = await req.json();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json("You need to authorize first.", { status: 401 });
    }

    // Delete chat from sidebar
    pusherServer.trigger(session.user.id, "chat_delete", chat.id);

    // Delete chat from chats
    await redis.srem(`user:${session.user.id}:chats`, chat);

    const allUsersChats: Chat[] = [];
    await Promise.all(
      chat.users.map(async (user: User) => {
        const chats = await redis.smembers<Chat[]>(`user:${user.id}:chats`);
        allUsersChats.push(...chats);
        return chats;
      }),
    );

    const chatCount = allUsersChats.filter(
      (item) => item.id === chat.id,
    ).length;

    // if no one has this chat delete chat messages
    if (chatCount === 0) {
      await redis.del(`chat:${chat.id}:messages`);
    }

    if (!isGroupChat) {
      // Delete friend from select
      pusherServer.trigger(session.user.id, "delete_friend", chat.users[0]);

      // Delete user from friend list
      await redis.srem(`user:${session.user.id}:friend_list`, chat.users[0]);
    }

    return NextResponse.json("OK");
  } catch (error) {
    return NextResponse.json("Bad request", { status: 400 });
  }
};

export { DELETE };
