import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ChatInput } from "@/components/chat-input/chat-input";
import { ChatMessages } from "@/components/chat-messages/chat-messages";

const Dashboard = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  const chatId = "global_chat";
  const users = await redis.smembers<User[]>("all_users");
  const initialMessages = await redis.zrange<Message[]>(
    `chat:${chatId}:messages`,
    0,
    -1,
    {
      rev: true,
    },
  );

  return (
    <section className="flex h-full flex-col justify-between">
      <div className="sticky left-0 top-0 border-b-2 bg-background py-4 pl-14 md:px-8">
        <h1 className="text-3xl font-bold">Global chat</h1>
      </div>

      <ChatMessages
        chatId={chatId}
        chatPartners={users}
        currentUser={session.user as User}
        initialMessages={initialMessages}
        isGroupChat
      />
      <ChatInput chatId={chatId} />
    </section>
  );
};

export default Dashboard;
