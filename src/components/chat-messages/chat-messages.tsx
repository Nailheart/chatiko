'use client';

import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";

type Props = {
  chatId: string;
  chatPartners: User[];
  currentUser: User;
  initialMessages: Message[];
  isGroupChat: boolean;
}

const ChatMessages: FC<Props> = ({
  chatId,
  chatPartners,
  currentUser,
  initialMessages,
  isGroupChat,
}) => {
  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    const chat = pusherClient.subscribe(chatId);

    const messageHandler = (message: Message) => {
      setMessages(prev => [message, ...prev]);
    }

    chat.bind('new_message', messageHandler);

    return () => {
      chat.unsubscribe();
      chat.unbind_all();
    }
  }, []);

  useEffect(() => {
    // Scroll to the last message
    window.scrollTo({
      top: document.documentElement.scrollHeight,
    });
  }, [messages]);

  return (
    <div className='flex h-full flex-1 flex-col-reverse gap-4 py-4 px-8'>
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === currentUser.id;
        const isFirstMessage = messages[index].senderId !== messages[index + 1]?.senderId;

        const chatPartner = isGroupChat 
          ? chatPartners.filter(partner => partner.id === message.senderId)[0]
          : chatPartners[0]

        const currDate = format(messages[index].timestamp, 'd');
        const nextDate = index !== messages.length - 1 ? format(messages[index + 1]?.timestamp, 'd') : '';
        const isNextDay = parseInt(nextDate) !== parseInt(currDate);

        return (
          <div key={message.id}>
            {isNextDay && (
              <time className="block text-muted-foreground text-xs text-center mb-2">
                {format(message.timestamp, 'dd/MM/yy')}
              </time>
            )}
            {isFirstMessage && isGroupChat && (
              <p className={cn(
                'text-xs mb-1',
                isCurrentUser && 'text-right'
              )}>
                {chatPartner.name}
              </p>
            )}
            <div className={cn(
              'flex items-start',
              isCurrentUser && 'justify-end',
            )}>
              <div className={cn(
                'w-10 h-10 shrink-0',
                isCurrentUser && 'order-2',
              )}>
                {isFirstMessage && (
                  <Image
                    className="rounded-full"
                    src={isCurrentUser ? currentUser.image : chatPartner.image}
                    width={40}
                    height={40}
                    sizes="40px"
                    alt='Profile picture'
                  />
                )}
              </div>

              <p className={cn(
                'bg-secondary text-secondary-foreground flex items-baseline flex-wrap gap-2 break-all mx-2 px-4 py-2 rounded-lg',
                isCurrentUser && 'bg-primary text-primary-foreground',
                isCurrentUser && isFirstMessage && 'rounded-tr-none',
                !isCurrentUser && isFirstMessage && 'rounded-tl-none',
              )}>
                <span>{message.content}</span>
                <span className={cn(
                  'text-muted-foreground text-xs shrink-0 ml-auto',
                  isCurrentUser && 'text-primary-foreground'
                )}>
                  {format(message.timestamp, 'HH:mm')}
                </span>
              </p>  
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { ChatMessages };