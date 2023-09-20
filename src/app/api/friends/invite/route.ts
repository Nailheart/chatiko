import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { redis } from "@/lib/redis";
import { pusherServer } from "@/lib/pusher";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const POST = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json('You need to authorize first.', { status: 401 });
    }

    const { email } = await req.json();

    const userId = await redis.get<string>(`user:email:${email}`);
    if (!userId) {
      return NextResponse.json('This user does not exist.', { status: 400 });
    }

    if (userId === session?.user.id) {
      return NextResponse.json('You cannot add yourself as a friend.', { status: 400, });
    }

    const isAlreadyRequested = await redis.sismember(`user:${userId}:incoming_friend_requests`, session.user.id);
    if (isAlreadyRequested) {
      return NextResponse.json('You already requested this user.', { status: 400 });
    }

    const isAlreadyAdded = await redis.sismember(`user:${session.user.id}:friend_list`, userId);
    if (isAlreadyAdded) {
      return NextResponse.json('This user is already on your friends list.', { status: 400 })
    }

    const currentUser = await redis.get<User | null>(`user:${session.user.id}`);

    // Send friend request using Pusher
    await pusherServer.trigger(
      `incoming_friend_requests--${userId}`,
      'incoming_friend_requests',
      currentUser,
    );

    // Add friend request to db
    await redis.sadd(`user:${userId}:incoming_friend_requests`, session.user.id);
    
    return NextResponse.json('OK', { status: 200 });
  } catch (error) {
    return NextResponse.json('Invalid request', { status: 400 });
  }
}

export { POST };