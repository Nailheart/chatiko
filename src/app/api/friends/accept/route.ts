import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { pusherServer } from "@/lib/pusher";
import { PusherChannel, PusherEvent } from '@/enums/enums';
import { nanoid } from "nanoid";

const POST = async (req: Request) => {
  try {
    const { id: friendId } = await req.json();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json('You need to authorize first.', { status: 401 });
    }

    const user = session.user as User;
    const friend = await redis.get<User | null>(`user:${friendId}`);
    
    if (!friend) {
      return NextResponse.json('Сannot find this user', { status: 400 });
    }

    // accept friend request
    await pusherServer.trigger(
      PusherChannel.INCOMING_FRIEND_REQUESTS_ID + user.id,
      PusherEvent.ACECEPT_FRIEND_REQUEST,
      'Friend request accepted!'
    );
    
    const chatId = nanoid();
    
    // add new chat in sidebar
    await pusherServer.trigger(
      PusherChannel.NEW_CHAT_ID + user.id,
      PusherEvent.NEW_CHAT,
      {
        id: chatId,
        users: [friend],
        name: friend.name,
      }
    );
    await pusherServer.trigger(
      PusherChannel.NEW_CHAT_ID + friendId,
      PusherEvent.NEW_CHAT,
      {
        id: chatId,
        users: [user],
        name: user.name,
      }
    );

    // add new chat
    await redis.sadd(`user:${user.id}:chats`, {
      id: chatId,
      users: [friend],
      name: friend.name,
    });
    await redis.sadd(`user:${friendId}:chats`, {
      id: chatId,
      users: [user],
      name: user.name,
    });
    
    // delete friend request for both users
    await redis.srem(`user:${user.id}:incoming_friend_requests`, friendId);
    await redis.srem(`user:${friendId}:incoming_friend_requests`, user.id);

    return NextResponse.json('OK');
  } catch (error) {
    return NextResponse.json('Bad request', { status: 400 });
  }
}

export { POST };