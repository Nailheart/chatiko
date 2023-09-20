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

    await pusherServer.trigger(
      `incoming_friend_requests--${session.user.id}`,
      'reject_friend_request',
      'Friend request rejected!',
    );

    // Remove friend request from db
    await redis.srem(`user:${session.user.id}:incoming_friend_requests`, id);
    
    return NextResponse.json('OK');
  } catch (error) {
    return NextResponse.json('Bad request', { status: 400 });
  }
}

export { POST };