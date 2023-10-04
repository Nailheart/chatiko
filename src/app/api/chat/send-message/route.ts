import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { pusherServer } from "@/lib/pusher";

const POST = async (req: Request) => {
  try {
    const { content, chatId } = await req.json();
  
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json('You need to authorize first.', { status: 401 });
    }

    const chats = await redis.smembers<Chat[]>(`user:${session.user.id}:chats`);
    const chat = chats.filter(chat => chat.id === chatId)[0];

    if (!chat) {
      return NextResponse.json('No such chat found.', { status: 400 });
    }

    const timestamp = Date.now();
    const message: Message = {
      id: nanoid(),
      senderId: session.user.id,
      content,
      timestamp,
    }

    const unseenMessage: UnseenMessage = {
      chatId,
      ...message,
    }

    // add message to unseen messages for each user
    const sendUnseenMessage: Promise<number>[] = [];
    chat.users.forEach(user => {
      const req = redis.lpush(`user:${user.id}:unseen_messages`, unseenMessage);
      sendUnseenMessage.push(req);
    });

    await Promise.all(sendUnseenMessage);

    // Trigger events using Pusher
    pusherServer.trigger(
      chatId,
      'new_message',
      message
    );
    pusherServer.trigger(
      chatId,
      'unseen_message',
      unseenMessage
    );

    // Store the message in database
    await redis.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: message,
    });

    return NextResponse.json('OK');
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
};

export { POST };