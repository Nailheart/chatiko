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
  friendList: User[];
  initialUnseenMessages: Message[];
}

const ChatList: FC<Props> = ({ sessionId, friendList, initialUnseenMessages }) => {
  const pathname = usePathname();
  const [chats, setChats] = useState(friendList);
  const [unseenMessages, setUnseenMessages] = useState<Message[]>(initialUnseenMessages);

  useEffect(() => {
    const friendList = pusherClient.subscribe(PusherChannel.FRIEND_LIST_ID + sessionId);
    const chat = pusherClient.subscribe(PusherChannel.CHAT_ID + sessionId);
    const chatDelete = pusherClient.subscribe(PusherChannel.CHAT_DELETE_ID + sessionId);

    const friendListHandler = (friend: User) => {
      setChats(prev => [...prev, friend]);
    }

    const unseenMessagesHandler = (message: Message) => {
      const chatId = [sessionId, message.senderId].sort().join('--');
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

    const chatDeletehandler = (chatPartnerId: string) => {
      setChats(prev =>  prev.filter(user => user.id !== chatPartnerId));
    }

    friendList.bind(PusherEvent.NEW_FRIEND, friendListHandler);
    chat.bind(PusherEvent.UNSEEN_MESSAGE, unseenMessagesHandler);
    chatDelete.bind(PusherEvent.CHAT_DELETE, chatDeletehandler);

    return () => {
      friendList.unsubscribe();
      friendList.unbind_all();
      chat.unsubscribe();
      chat.unbind_all();
      chatDelete.unsubscribe();
      chatDelete.unbind_all();
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
        const isActive = pathname === `/dashboard/chat/${chatId}`;

        const unseenMessagesCount = unseenMessages.filter(msg => {
          return msg.senderId === chat.id;
        }).length;

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