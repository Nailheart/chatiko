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
  title: 'Chatiko | Chat',
}

type Props = {
  params: {
    chatId: string;
  }
}

const Chat = async ({ params }: Props) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }
  
  const { chatId } = params;
  
  const chats = await redis.smembers<Chat[]>(`user:${session.user.id}:chats`);
  const chat = chats.filter(chat => chat.id === chatId)[0];

  if (!session.user || !chat) {
    notFound();
  }

  const isGroupChat = chat.users.length > 1;

  const initialMessages = await redis.zrange<Message[]>(`chat:${chatId}:messages`, 0, -1, {
    rev: true,
  });
  
  // Remove all unseen messages from this chat
  const unseenMessages = await redis.lrange<UnseenMessage>(`user:${session.user.id}:unseen_messages`, 0, -1);
  const chatUnseenMessage = unseenMessages.filter(msg => msg.chatId === chatId);

  const messagesToRemove: Promise<number>[] = [];
  chatUnseenMessage.forEach(unseenMessage => {
    const req = redis.lrem(`user:${session.user.id}:unseen_messages`, 0, unseenMessage);
    messagesToRemove.push(req);
  });

  if (messagesToRemove.length) {
    await Promise.all(messagesToRemove);
  }

  return (
    <section className='flex flex-col justify-between h-full'>
      <div className='flex justify-between gap-4 sticky left-0 top-0 bg-background px-8 py-4 border-b-2'>
        {isGroupChat && (
          <div>
            <h1 className="font-bold text-3xl">{chat.name}</h1>
          </div>
        )}
        {!isGroupChat && (
          <div className='flex items-center space-x-4'>
            <Image
              className="rounded-full"
              src={chat.users[0].image}
              alt="Profile avatar"
              width={40}
              height={40}
              sizes="40px"
            />

            <div className='flex flex-col leading-tight'>
              <span className='font-semibold mr-3'>
                {chat.users[0].name}
              </span>
              <span className='text-muted-foreground text-sm'>
                {chat.users[0].email}
              </span>
            </div>
          </div>
        )}
        <ChatSettings
          chat={chat}
          isGroupChat={isGroupChat}
        />
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