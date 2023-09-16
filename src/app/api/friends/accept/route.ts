import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const redis = Redis.fromEnv();

const POST = async (req: Request) => {
  try {
    const { id } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json('You need to authorize first.', { status: 401 });
    }

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