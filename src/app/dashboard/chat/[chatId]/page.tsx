import Image from "next/image";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";

import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ChatMessages } from "@/components/chat-messages/chat-messages";
import { ChatInput } from "@/components/chat-input/chat-input";
import { ChatSettings } from "@/components/chat-settings/chat-settings";

export const metadata: Metadata = {
  title: "Chatiko | Chat",
};

type Props = {
  params: {
    chatId: string;
  };
};

const Chat = async ({ params }: Props) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  const { chatId } = params;

  const chats = await redis.smembers<Chat[]>(`user:${session.user.id}:chats`);
  const chat = chats.filter((chat) => chat.id === chatId)[0];

  if (!session.user || !chat) {
    notFound();
  }

  const isGroupChat = chat.users.length > 1;

  const initialMessages = await redis.zrange<Message[]>(
    `chat:${chatId}:messages`,
    0,
    -1,
    {
      rev: true,
    },
  );

  // Remove all unseen messages from this chat
  const unseenMessages = await redis.lrange<UnseenMessage>(
    `user:${session.user.id}:unseen_messages`,
    0,
    -1,
  );
  const chatUnseenMessage = unseenMessages.filter(
    (msg) => msg.chatId === chatId,
  );

  const messagesToRemove: Promise<number>[] = [];
  chatUnseenMessage.forEach((unseenMessage) => {
    const req = redis.lrem(
      `user:${session.user.id}:unseen_messages`,
      0,
      unseenMessage,
    );
    messagesToRemove.push(req);
  });

  if (messagesToRemove.length) {
    await Promise.all(messagesToRemove);
  }

  return (
    <section className="flex h-full flex-col justify-between">
      <div className="sticky left-0 top-0 flex items-center border-b-2 bg-background p-4 pl-14 md:px-8">
        {isGroupChat && (
          <div className="grid grid-cols-1">
            <h1 className="truncate text-3xl font-bold">{chat.name}</h1>
          </div>
        )}
        {!isGroupChat && (
          <div className="flex items-center space-x-4">
            <Image
              className="rounded-full"
              src={chat.users[0].image}
              alt="Profile avatar"
              width={40}
              height={40}
              sizes="40px"
            />

            <div className="grid grid-cols-1 leading-tight">
              <span className="mr-3 truncate font-semibold">
                {chat.users[0].name}
              </span>
              <span className="truncate text-sm text-muted-foreground">
                {chat.users[0].email}
              </span>
            </div>
          </div>
        )}
        <div className="ml-auto">
          <ChatSettings chat={chat} isGroupChat={isGroupChat} />
        </div>
      </div>
      <ChatMessages
        chatId={chatId}
        chatPartners={chat.users}
        currentUser={session.user as User}
        initialMessages={initialMessages}
        isGroupChat={isGroupChat}
      />
      <ChatInput chatId={chatId} />
    </section>
  );
};

export default Chat;
