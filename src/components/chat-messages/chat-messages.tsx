'use client';

import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";

type Props = {
  chatPartner: User;
  currentUser: User;
  initialMessages: Message[];
}

const ChatMessages: FC<Props> = ({
  chatPartner,
  currentUser,
  initialMessages,
}) => {
  const [messages, setMessages] = useState(initialMessages);

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
        const hasNextMessageFromSameUser = messages[index - 1]?.senderId === messages[index].senderId;
        
        const currDate = format(messages[index].timestamp, 'd');
        const nextDate = index !== messages.length - 1 ? format(messages[index + 1]?.timestamp, 'd') : '';
        const isNextDay = parseInt(nextDate) !== parseInt(currDate);

        return (
          <div key={message.id}>
            {isNextDay && (
              <p className="text-muted-foreground text-xs text-center mb-2">
                {format(message.timestamp, 'dd/MM/yy')}
              </p>
            )}

            <div className={cn(
              'flex items-start',
              isCurrentUser && 'justify-end',
            )}>
              <Image
                className={cn(
                  'shrink-0 rounded-full',
                  isCurrentUser && 'order-2',
                )}
                src={isCurrentUser ? currentUser.image : chatPartner.image}
                width={40}
                height={40}
                sizes="40px"
                alt='Profile picture'
              />

              <p className={cn(
                'bg-secondary text-secondary-foreground flex items-baseline flex-wrap gap-2 break-all mx-2 px-4 py-2 rounded-lg',
                isCurrentUser && 'bg-primary text-primary-foreground',
                isCurrentUser && !hasNextMessageFromSameUser && 'rounded-tr-none',
                !isCurrentUser && !hasNextMessageFromSameUser && 'rounded-tl-none',
              )}>
                <span>{message.text}</span>
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