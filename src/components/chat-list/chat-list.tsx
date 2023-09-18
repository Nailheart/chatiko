'use client';

import Image from "next/image";
import Link from "next/link";
import { FC, useEffect, useState } from "react";

import { pusherClient } from "@/lib/pusher";

type Props = {
  sessionId: string;
  friendList: User[];
}

const ChatList: FC<Props> = ({ sessionId, friendList }) => {
  const [chats, setChats] = useState(friendList);
  const [unseenMessages, setUnseenMessages] = useState(0);

  useEffect(() => {
    const friendList = pusherClient.subscribe(`friend_list--${sessionId}`);

    const friendListHandler = (friend: User) => {
      setChats(prev => [...prev, friend]);
    }

    friendList.bind('new_friend', friendListHandler);

    return () => {
      friendList.unsubscribe();
      friendList.unbind_all();
    }
  }, []);


  return (
    <ul className="space-y-1">
      {chats.map(chat => {
        // one chatId for both user
        const chatId = [sessionId, chat.id].sort().join('--');

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
              {unseenMessages > 0 && (
                <span className='flex items-center justify-center bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full min-w-[24px] min-h-[24px] leading-0'>
                  {unseenMessages > 99 
                    ? "99+"
                    : unseenMessages
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