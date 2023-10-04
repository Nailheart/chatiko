import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { pusherServer } from "@/lib/pusher";

const POST = async (req: Request) => {
  try {
    const { name, members } = await req.json();
  
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json('You need to authorize first.', { status: 401 });
    }
  
    const chatId = nanoid();
    const user = session.user as User;
    
    const friends: User[] = await Promise.all(
      members.map(async (member: any) => {
        const friend = await redis.get<User>(`user:${member.value}`);
        return friend;
      })
    );
    friends.push(user);
  
    const chat: Chat = {
      id: chatId,
      users: friends,
      name,
    }

    // add new chat in sidebar for each user
    friends.map((friend: User) => (
      pusherServer.trigger(
        friend.id,
        'new_chat',
        chat
      )
    ));
  
    // add new chat in db for each user
    await Promise.all(
      friends.map(async (friend: User) => (
        await redis.sadd(`user:${friend.id}:chats`, chat)
      ))
    );
  
    return NextResponse.json('OK');
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}

export { POST };