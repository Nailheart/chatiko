import { nanoid } from "nanoid";
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

    const user = session.user as User;
    const friend = await redis.get<User | null>(`user:${id}`);
    
    if (!friend) {
      return NextResponse.json('Сannot find this user', { status: 400 });
    }
    
    const friendRequests = await redis.smembers(`user:${friend.id}:incoming_friend_requests`);
    const hasRequestFromUser = friendRequests.filter(reqId => reqId === user.id)[0];

    if (hasRequestFromUser) {
      pusherServer.trigger(
        friend.id,
        'accept_friend_request',
        user
      );
    }

    // Update friend request count
    pusherServer.trigger(
      user.id,
      'accept_friend_request',
      friend
    );
    
    // add new friend to select
    pusherServer.trigger(
      user.id,
      'add_new_friend',
      friend
    );
    pusherServer.trigger(
      friend.id,
      'add_new_friend',
      user
    );
    
    const chatId = nanoid();
    
    // add new chat to sidebar
    pusherServer.trigger(
      user.id,
      'new_chat',
      {
        id: chatId,
        users: [friend],
        name: friend.name,
      }
    );
    pusherServer.trigger(
      friend.id,
      'new_chat',
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
    await redis.sadd(`user:${friend.id}:chats`, {
      id: chatId,
      users: [user],
      name: user.name,
    });

    // add new friend
    await redis.sadd(`user:${user.id}:friend_list`, friend);
    await redis.sadd(`user:${friend.id}:friend_list`, user);
    
    // delete friend request for both users
    await redis.srem(`user:${user.id}:incoming_friend_requests`, friend.id);
    await redis.srem(`user:${friend.id}:incoming_friend_requests`, user.id);

    return NextResponse.json('OK');
  } catch (error) {
    return NextResponse.json('Bad request', { status: 400 });
  }
}

export { POST };