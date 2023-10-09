"use client";

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
  isGroupChat?: boolean;
};

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
      setMessages((prev) => [message, ...prev]);
    };

    chat.bind("new_message", messageHandler);

    return () => {
      chat.unsubscribe();
      chat.unbind_all();
    };
  }, [chatId]);

  useEffect(() => {
    // Scroll to the last message
    window.scrollTo({
      top: document.documentElement.scrollHeight,
    });
  }, [messages]);

  return (
    <div className="flex h-full flex-1 flex-col-reverse gap-4 p-4 md:px-8">
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === currentUser.id;
        const isFirstMessage =
          messages[index].senderId !== messages[index + 1]?.senderId;

        const chatPartner = isGroupChat
          ? chatPartners.filter((partner) => partner.id === message.senderId)[0]
          : chatPartners[0];

        const currDate = format(messages[index].timestamp, "d");
        const nextDate =
          index !== messages.length - 1
            ? format(messages[index + 1]?.timestamp, "d")
            : "";
        const isNextDay = parseInt(nextDate) !== parseInt(currDate);

        return (
          <div key={message.id}>
            {isNextDay && (
              <time className="mb-2 block text-center text-xs text-muted-foreground">
                {format(message.timestamp, "dd/MM/yy")}
              </time>
            )}
            {isFirstMessage && isGroupChat && (
              <p className={cn("mb-1 text-xs", isCurrentUser && "text-right")}>
                {chatPartner.name}
              </p>
            )}
            <div
              className={cn("flex items-start", isCurrentUser && "justify-end")}
            >
              <div
                className={cn("h-10 w-10 shrink-0", isCurrentUser && "order-2")}
              >
                {isFirstMessage && (
                  <Image
                    className="rounded-full"
                    src={isCurrentUser ? currentUser.image : chatPartner.image}
                    width={40}
                    height={40}
                    sizes="40px"
                    alt="Profile picture"
                  />
                )}
              </div>

              <p
                className={cn(
                  "mx-2 flex flex-wrap items-baseline gap-2 break-all rounded-lg bg-secondary px-4 py-2 text-secondary-foreground",
                  isCurrentUser && "bg-primary text-primary-foreground",
                  isCurrentUser && isFirstMessage && "rounded-tr-none",
                  !isCurrentUser && isFirstMessage && "rounded-tl-none",
                )}
              >
                <span>{message.content}</span>
                <span
                  className={cn(
                    "ml-auto shrink-0 text-xs text-muted-foreground",
                    isCurrentUser && "text-primary-foreground",
                  )}
                >
                  {format(message.timestamp, "HH:mm")}
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
