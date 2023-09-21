import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const DELETE = async (req: Request) => {
  try {
    const { unseenMessage } = await req.json();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json('You need to authorize first.', { status: 401 });
    }

    await redis.srem(`user:${session.user.id}:unseen_messages`, unseenMessage);

    return NextResponse.json('OK');
  } catch (error) {
    return NextResponse.json('Bad request', { status: 400 });
  }
}

export { DELETE };