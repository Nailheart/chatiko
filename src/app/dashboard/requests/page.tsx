import { Redis } from "@upstash/redis";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { FriendRequest } from "@/components/friend-request/friend-request";

const redis = Redis.fromEnv();

const Requests = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  const userIds = await redis.smembers(`user:${session.user.id}:incoming_friend_requests`);
  
  const users = await Promise.all(
    userIds.map(async (id) => {
      const user = await redis.get<User | null>(`user:${id}`);
      return user;
    })
  );

  return (
    <section className="container py-8">
      <h1 className='font-bold text-5xl my-8'>Friend requests</h1>
      <div className='flex flex-col gap-4'>
        {Boolean(!users.length) ? (
          <p className='text-sm text-zinc-500'>You have no friend requests.</p>
        ) : (
          <FriendRequest users={users as User[]} />
        )}
      </div>
    </section>
  );
};

export default Requests;