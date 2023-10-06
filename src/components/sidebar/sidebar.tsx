'use client';

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserIcon, UserPlusIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";
import { NewChat } from "@/components/new-chat/new-chat";
import { SignOutButton } from "@/components/sign-out-button/sign-out-button";

type Props ={
  user: User;
  initialChats: Chat[];
  initialFriends: User[];
  initialFriendRequests: number;
  initialUnseenMessages: UnseenMessage[];
}

const Sidebar: FC<Props> = ({
  user,
  initialChats,
  initialFriends,
  initialFriendRequests,
  initialUnseenMessages,
}) => {
  const pathname = usePathname();
  const [chats, setChats] = useState(initialChats);
  const [friends, setFriends] = useState(initialFriends);
  const [friendRequests, setFriendRequests] = useState(initialFriendRequests);
  const [unseenMessages, setUnseenMessages] = useState(initialUnseenMessages);

  useEffect(() => {
    pusherClient.subscribe(user.id);
    
    // subscribe for unseen message
    chats.forEach(chat => {
      pusherClient.subscribe(chat.id);
    });

    const updateFriendRequestCount = () => {
      setFriendRequests(prev => prev + 1);
    }

    const acceptFriendRequest = (newFriend: User) => {
      setFriends(prev => [...prev, newFriend]);
      setFriendRequests(prev => prev - 1);
    }

    const rejectFriendRequest = () => {
      setFriendRequests(prev => prev - 1);
    }

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

    pusherClient.bind('incoming_friend_requests', updateFriendRequestCount);
    pusherClient.bind('accept_friend_request', acceptFriendRequest);
    pusherClient.bind('reject_friend_request', rejectFriendRequest);

    pusherClient.bind('new_chat', newChatHandler);
    pusherClient.bind('unseen_message', unseenMessagesHandler);

    return () => {
      pusherClient.unsubscribe(user.id);
      chats.forEach(chat => {
        pusherClient.unsubscribe(chat.id);
      });

      pusherClient.unbind('incoming_friend_requests', updateFriendRequestCount);
      pusherClient.unbind('accept_friend_request', acceptFriendRequest);
      pusherClient.unbind('reject_friend_request', rejectFriendRequest);
      
      pusherClient.unbind('new_chat', newChatHandler);
      pusherClient.unbind('unseen_message', unseenMessagesHandler);
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
    <div className='hidden md:flex w-full h-screen max-w-xs py-3 px-6 flex-col gap-y-5 border-r bg-background overflow-auto scrollbar-thin sticky top-0 left-0'>
      <Link
        className='flex items-center shrink-0 self-start'
        href='/dashboard'
      >
        <Image
          className="block"
          src="/img/chatiko.webp"
          width={50}
          height={50}
          alt="Chatiko logo"
        />
        <span className="ml-1 text-2xl text-[--orange] font-semibold">
          Chatiko
        </span>
      </Link>

      <nav className='flex flex-1 flex-col'>
        <div className='flex flex-1 flex-col gap-y-7'>
          <div>
            <h2 className='text-xs font-semibold leading-6 text-muted-foreground'>
              Overview
            </h2>
            <ul className='-mx-2 space-y-1'>
              <li>
                <Link
                  className='flex items-center gap-3 rounded-md p-2 text-sm leading-6 font-semibold duration-300 hover:text-accent-foreground hover:bg-accent'
                  href="/dashboard/invite"
                > 
                  <UserPlusIcon className="ml-1" />
                  <span className='-ml-1 truncate'>Invite friend</span>
                </Link>
              </li>
              <li>
                <Link
                  className="flex items-center gap-3 rounded-md p-2 text-sm leading-6 font-semibold duration-300 hover:text-accent-foreground hover:bg-accent"
                  href="/dashboard/requests"
                >
                  <UserIcon />
                  <span className="truncate">Friend requests</span>

                  {friendRequests !== 0 && (
                    <span className="flex items-center justify-center bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full min-w-[24px] min-h-[24px] leading-0">
                      {friendRequests > 99 
                        ? "99+"
                        : friendRequests
                      }
                    </span>
                  )} 
                </Link>
              </li>
              <li>
                <NewChat friends={friends} />
              </li>
            </ul>
          </div>
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
        </div>
        <div className='flex items-center mt-auto pt-6'>
          <div className='flex flex-1 items-center gap-x-4'>
            <Image
              className='rounded-full'
              width={32}
              height={32}
              sizes="32px"
              src={user.image}
              alt='Your profile avatar'
            />

            <div className='flex flex-col max-w-[175px] text-sm font-semibold leading-tight'>
              <span className='truncate'>
                {user.name}
              </span>
              <span className='text-xs text-muted-foreground truncate'>
                {user.email}
              </span>
            </div>
          </div>
          
          <SignOutButton />
        </div>
      </nav>
    </div>
  );
};

export { Sidebar };