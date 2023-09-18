import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { pusherServer } from "@/lib/pusher";

const POST = async (req: Request) => {
  try {
    const { id } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json('You need to authorize first.', { status: 401 });
    }

    const currentUser = await redis.get<User | null>(`user:${session.user.id}`);
    const friend = await redis.get<User | null>(`user:${id}`);

    // TODO: wrap all in await Promise.all([]);
    // add number of requests in sidebar
    await pusherServer.trigger(
      `incoming_friend_requests--${session.user.id}`,
      'accept_friend_request',
      'Friend request accepted!',
    );
    
    // add new chats in sidebar
    await pusherServer.trigger(
      `friend_list--${session.user.id}`,
      'new_friend',
      friend,
    );
    await pusherServer.trigger(
      `friend_list--${id}`,
      'new_friend',
      currentUser,
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