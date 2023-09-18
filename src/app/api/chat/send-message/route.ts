import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { pusherServer } from "@/lib/pusher";

const POST = async (req: Request) => {
  try {
    const { text, chatId } = await req.json();
  
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json('You need to authorize first.', { status: 401 });
    }

    const [userId1, userId2] = chatId.split('--');

    if (session.user.id !== userId1 && session.user.id !== userId2) {
      return NextResponse.json('No such chat found.', { status: 401 });
    }

    const friendId = session.user.id === userId1 ? userId2 : userId1;
    const friendList = await redis.smembers(`user:${session.user.id}:friend_list`);
    const isFriend = friendList.includes(friendId);

    if (!isFriend) {
      return NextResponse.json('This user is not on your friends list.', { status: 401 });
    }

    const timestamp = Date.now();

    const message: Message = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp,
    }

    await pusherServer.trigger(
      `chat--${chatId}`,
      'send_message',
      message,
    );

    await redis.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    });

    return NextResponse.json('OK');
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
};

export { POST };