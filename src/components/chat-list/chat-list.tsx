'use client';

import Image from "next/image";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { pusherClient } from "@/lib/pusher";

type Props = {
  sessionId: string;
  friendList: User[];
}

const ChatList: FC<Props> = ({ sessionId, friendList }) => {
  const pathname = usePathname();
  const [chats, setChats] = useState(friendList);
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

  useEffect(() => {
    const friendList = pusherClient.subscribe(`friend_list--${sessionId}`);
    const chat = pusherClient.subscribe(`chat--${sessionId}`);

    const friendListHandler = (friend: User) => {
      setChats(prev => [...prev, friend]);
    }

    const unseenMessagesHandler = (message: Message) => {
      const chatId = [sessionId, message.senderId].sort().join('--');
      const isChatPage = pathname === `/dashboard/chat/${chatId}`;

      if (isChatPage) return;

      setUnseenMessages(prev => [...prev, message]);
    }

    friendList.bind('new_friend', friendListHandler);
    chat.bind('unseen_message', unseenMessagesHandler);

    return () => {
      friendList.unsubscribe();
      friendList.unbind_all();
      chat.unsubscribe();
      chat.unbind_all();
    }
  }, [pathname]);

  // reset unseen messages
  useEffect(() => {
    if (pathname.includes('chat')) {
      setUnseenMessages(prev => prev.filter(msg => !pathname.includes(msg.senderId)));
    }
  }, [pathname]);

  return (
    <ul className="space-y-1">
      {chats.map(chat => {
        // one chatId for both user
        const chatId = [sessionId, chat.id].sort().join('--');

        const unseenMessagesCount = unseenMessages.filter(msg => {
          return msg.senderId === chat.id;
        }).length;

        return (
          <li key={chatId}>
            <Link
              className="hover:text-secondary-foreground hover:bg-secondary group flex items-center gap-3 rounded-md p-2 text-sm leading-6 font-semibold duration-300"
              href={`/dashboard/chat/${chatId}`}
            >
              <Image
                className='rounded-full'
                width={32}
                height={32}
                sizes="32px"
                src={chat.image || ''}
                alt='Chat avatar'
              />

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