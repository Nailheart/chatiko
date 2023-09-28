'use client';

import Image from "next/image";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";
import { PusherChannel, PusherEvent } from '@/enums/enums';

type Props = {
  sessionId: string;
  initialChats: Chat[];
  initialUnseenMessages: UnseenMessage[];
}

const ChatList: FC<Props> = ({ sessionId, initialChats, initialUnseenMessages }) => {
  const pathname = usePathname();
  const [chats, setChats] = useState(initialChats);
  const [unseenMessages, setUnseenMessages] = useState(initialUnseenMessages);

  useEffect(() => {
    const newChat = pusherClient.subscribe(PusherChannel.NEW_CHAT_ID + sessionId);
    const chatUnseenMessages = pusherClient.subscribe(PusherChannel.CHAT_UNSEEN_MESSAGE);
    // const chatDelete = pusherClient.subscribe(PusherChannel.CHAT_DELETE_ID + sessionId);

    const newChatHandler = (chat: Chat) => {
      setChats(prev => [...prev, chat]);
    }

    const unseenMessagesHandler = (message: UnseenMessage) => {
      const chatId = message.chatId;
      const isChatPage = pathname === `/dashboard/chat/${chatId}`;

      if (isChatPage) {
        // Remove message from unseen messages
        fetch('/api/chat/remove-unseen-message', {
          method: 'DELETE',
          body: JSON.stringify({ unseenMessage: message }),
        });
        return;
      };

      setUnseenMessages(prev => [...prev, message]);
    }

    // const chatDeletehandler = (chatPartnerId: string) => {
    //   setChats(prev =>  prev.filter(user => user.id !== chatPartnerId));
    // }

    newChat.bind(PusherEvent.NEW_CHAT, newChatHandler);
    chatUnseenMessages.bind(PusherEvent.UNSEEN_MESSAGE, unseenMessagesHandler);
    // chatDelete.bind(PusherEvent.CHAT_DELETE, chatDeletehandler);

    return () => {
      chatUnseenMessages.unsubscribe();
      chatUnseenMessages.unbind_all();
      newChat.unsubscribe();
      newChat.unbind_all();
      // chatDelete.unsubscribe();
      // chatDelete.unbind_all();
    }
  }, [pathname]);

  // reset unseen messages
  useEffect(() => {
    if (pathname.includes('chat')) {
      const chat = chats.filter(chat => pathname.includes(chat.id))[0];

      setUnseenMessages(prev => {
        return prev.filter(msg => msg.chatId !== chat.id);
      });
    }
  }, [pathname]);

  return (
    <ul className="space-y-1">
      {chats.map(chat => {
        const chatId = chat.id;
        const isActive = pathname === `/dashboard/chat/${chatId}`;
        const isGroupChat = chat.users.length > 1;
        const unseenMessagesCount = unseenMessages.filter(msg => msg.chatId === chat.id).length;

        return (
          <li key={chatId}>
            <Link
              className={cn(
                'flex items-center gap-3 rounded-md p-2 text-sm leading-6 font-semibold duration-300',
                isActive && 'bg-secondary text-secondary-foreground',
                !isActive && 'hover:text-secondary-foreground hover:bg-secondary',
              )}
              href={`/dashboard/chat/${chatId}`}
            >
              {isGroupChat ? (
                <div className="w-8 h-8 bg-orange-400 rounded-full">
                  <span className="text-white">
                    {chat.name.charAt(0)}
                  </span>
                </div>
              ) : (
                <Image
                  className='rounded-full'
                  width={32}
                  height={32}
                  sizes="32px"
                  src={chat.users[0].image}
                  alt='Chat avatar'
                />
              )}

              {chat.name}
              {unseenMessagesCount > 0 && (
                <span className='flex items-center justify-center bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full min-w-[24px] min-h-[24px] leading-0'>
                  {unseenMessagesCount > 99 
                    ? "99+"
                    : unseenMessagesCount
                  }
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export { ChatList };