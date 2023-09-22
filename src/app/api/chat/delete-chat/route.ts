import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { pusherServer } from "@/lib/pusher";
import { PusherChannel, PusherEvent } from "@/enums/enums";

const DELETE = async (req: Request) => {
  try {
    const { chatId, chatPartnerId } = await req.json();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json('You need to authorize first.', { status: 401 });
    }

    // Delete chat
    await redis.del(`chat:${chatId}:messages`);

    await pusherServer.trigger(
      PusherChannel.CHAT_DELETE_ID + session.user.id,
      PusherEvent.CHAT_DELETE,
      chatPartnerId,
    );
    await pusherServer.trigger(
      PusherChannel.CHAT_DELETE_ID + chatPartnerId,
      PusherEvent.CHAT_DELETE,
      session.user.id,
    );
    
    // Delete users from friend list
    await redis.srem(`user:${session.user.id}:friend_list`, chatPartnerId);
    await redis.srem(`user:${chatPartnerId}:friend_list`, session.user.id);

    // Delete unseen messages
    const unseenMessagesPartner = await redis.smembers<Message[]>(`user:${chatPartnerId}:unseen_messages`);
    const messagesToRemove = unseenMessagesPartner.filter(msg => msg.senderId === session.user.id);
    if (messagesToRemove.length) {
      await redis.srem(`user:${chatPartnerId}:unseen_messages`, ...messagesToRemove);
    }

    return NextResponse.json('OK');
  } catch (error) {
    return NextResponse.json('Bad request', { status: 400 });
  }
}

export { DELETE };