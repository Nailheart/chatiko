'use client';

import Image from "next/image";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";

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
    const newChat = pusherClient.subscribe(sessionId);
    
    // subscribe for unseen message
    chats.forEach(chat => {
      pusherClient.subscribe(chat.id);
    });

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

    newChat.bind('new_chat', newChatHandler);
    pusherClient.bind('unseen_message', unseenMessagesHandler);

    // const chatDeletehandler = (chatPartnerId: string) => {
    //   setChats(prev =>  prev.filter(user => user.id !== chatPartnerId));
    // }
    // chatDelete.bind(PusherEvent.CHAT_DELETE, chatDeletehandler);

    return () => {
      chats.forEach(chat => {
        pusherClient.unsubscribe(chat.id);
      });
      pusherClient.unbind('unseen_message', unseenMessagesHandler);

      newChat.unsubscribe();
      newChat.unbind_all();
      // chatDelete.unsubscribe();
      // chatDelete.unbind_all();
    }
  }, [pathname, chats]);

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
    <div>
      {Boolean(chats.length) && (
        <h2 className="text-xs font-semibold leading-6 text-muted-foreground">
          Your chats
        </h2>
      )}
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
                  <div className="flex items-center justify-center text-lg w-8 h-8 bg-orange-400 rounded-full">
                    <span className="text-white">
                      {chat.name.charAt(0)}
                    </span>
                  </div>
                ) : (
                  <Image
                    className="rounded-full"
                    width={32}
                    height={32}
                    sizes="32px"
                    src={chat.users[0].image}
                    alt="Chat avatar"
                  />
                )}

                {chat.name}
                {unseenMessagesCount > 0 && (
                  <span className="flex items-center justify-center bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full min-w-[24px] min-h-[24px] leading-0">
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
    </div>
  );
};

export { ChatList };