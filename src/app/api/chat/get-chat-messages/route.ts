import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const POST = async (req: Request) => {
  try {
    const { chatId } = await req.json();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json("You need to authorize first.", { status: 401 });
    }

    const initialMessages = await redis.zrange<Message[]>(
      `chat:${chatId}:messages`,
      0,
      -1,
      {
        rev: true,
      },
    );

    return NextResponse.json(initialMessages);
  } catch (error) {
    return NextResponse.json("Bad request", { status: 500 });
  }
};

export { POST };
