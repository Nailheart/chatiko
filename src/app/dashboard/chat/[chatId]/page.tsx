import Image from "next/image";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";

import { redis } from "@/lib/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ChatMessages } from "@/components/chat-messages/chat-messages";
import { ChatInput } from "@/components/chat-input/chat-input";

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
  const [userId1, userId2] = chatId.split('--');

  if (session.user.id !== userId1 && session.user.id !== userId2) {
    notFound();
  }

  const chatPartnerId = session.user.id === userId1 ? userId2 : userId1;
  const chatPartner = await redis.get<User>(`user:${chatPartnerId}`);

  const initialMessages = await redis.zrange<Message[]>(`chat:${chatId}:messages`, 0, -1, {
    rev: true,
  });

  return (
    <section className='flex flex-col justify-between h-full'>
      <div className='sticky left-0 top-0 bg-background px-8 py-4 border-b-2'>
        <div className='flex items-center space-x-4'>
          <Image
            className="rounded-full"
            src={chatPartner?.image || ''}
            alt="Profile avatar"
            width={40}
            height={40}
            sizes="40px"
          />

          <div className='flex flex-col leading-tight'>
            <span className='font-semibold mr-3'>
              {chatPartner?.name}
            </span>
            <span className='text-muted-foreground text-sm'>
              {chatPartner?.email}
            </span>
          </div>
        </div>
      </div>

      <ChatMessages
        chatId={chatId}
        chatPartner={chatPartner as User}
        currentUser={session.user as User}
        initialMessages={initialMessages}
      />
      <ChatInput chatId={chatId} />
    </section>
  );
};

export default Chat;