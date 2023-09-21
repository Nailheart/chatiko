import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { pusherServer } from "@/lib/pusher";
import { PusherChannel, PusherEvent } from '@/enums/enums';

const POST = async (req: Request) => {
  try {
    const { id } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json('You need to authorize first.', { status: 401 });
    }

    const currentUser = await redis.get<User | null>(`user:${session.user.id}`);
    const friend = await redis.get<User | null>(`user:${id}`);

    // accept friend request
    await pusherServer.trigger(
      PusherChannel.INCOMING_FRIEND_REQUESTS_ID + session.user.id,
      PusherEvent.ACECEPT_FRIEND_REQUEST,
      'Friend request accepted!'
    );
    // await pusherServer.trigger(`incoming_friend_requests--${id}`, 'accept_friend_request', 'Friend request accepted!');
    
    // add new chat in sidebar
    await pusherServer.trigger(
      PusherChannel.FRIEND_LIST_ID + session.user.id,
      PusherEvent.NEW_FRIEND,
      friend
    );
    await pusherServer.trigger(
      PusherChannel.FRIEND_LIST_ID + id,
      PusherEvent.NEW_FRIEND,
      currentUser
    );
    
    // add users to friend list
    await redis.sadd(`user:${session.user.id}:friend_list`, id);
    await redis.sadd(`user:${id}:friend_list`, session.user.id);
    
    // delete friend request for both users
    await redis.srem(`user:${session.user.id}:incoming_friend_requests`, id);
    await redis.srem(`user:${id}:incoming_friend_requests`, session.user.id);

    return NextResponse.json('OK');
  } catch (error) {
    return NextResponse.json('Bad request', { status: 400 });
  }
}

export { POST };