"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GlobeIcon,
  MenuSquareIcon,
  UserIcon,
  UserPlusIcon,
  XSquareIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";
import { NewChat } from "@/components/new-chat/new-chat";
import { SignOutButton } from "@/components/sign-out-button/sign-out-button";
import { Button } from "@/components/ui/button";

type Props = {
  user: User;
  initialChats: Chat[];
  initialFriends: User[];
  initialFriendRequests: number;
  initialUnseenMessages: UnseenMessage[];
};

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
  const [navIsOpen, setNavIsOpen] = useState(false);

  useEffect(() => {
    pusherClient.subscribe(user.id);

    // subscribe for unseen message
    chats.forEach((chat) => {
      pusherClient.subscribe(chat.id);
    });

    const updateFriendRequestCount = () => {
      setFriendRequests((prev) => prev + 1);
    };

    const acceptFriendRequest = () => {
      setFriendRequests((prev) => prev - 1);
    };

    const rejectFriendRequest = () => {
      setFriendRequests((prev) => prev - 1);
    };

    const addNewFriendHandler = (newFriend: User) => {
      setFriends((prev) => [...prev, newFriend]);
    };

    const deleteFriendHandler = (friend: User) => {
      setFriends((prev) => prev.filter((item) => item.id !== friend.id));
    };

    const newChatHandler = (chat: Chat) => {
      setChats((prev) => [...prev, chat]);
    };

    const unseenMessagesHandler = (message: UnseenMessage) => {
      const chatId = message.chatId;
      const isChatPage = pathname === `/dashboard/chat/${chatId}`;

      if (isChatPage) {
        // Remove message from unseen messages
        fetch("/api/chat/remove-unseen-message", {
          method: "DELETE",
          body: JSON.stringify({ unseenMessage: message }),
        });
        return;
      }

      setUnseenMessages((prev) => [...prev, message]);
    };

    const chatDeleteHandler = (chatId: string) => {
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    };

    pusherClient.bind("incoming_friend_requests", updateFriendRequestCount);
    pusherClient.bind("accept_friend_request", acceptFriendRequest);
    pusherClient.bind("reject_friend_request", rejectFriendRequest);

    pusherClient.bind("add_new_friend", addNewFriendHandler);
    pusherClient.bind("delete_friend", deleteFriendHandler);

    pusherClient.bind("new_chat", newChatHandler);
    pusherClient.bind("unseen_message", unseenMessagesHandler);
    pusherClient.bind("chat_delete", chatDeleteHandler);

    return () => {
      pusherClient.unsubscribe(user.id);
      chats.forEach((chat) => {
        pusherClient.unsubscribe(chat.id);
      });

      pusherClient.unbind("incoming_friend_requests", updateFriendRequestCount);
      pusherClient.unbind("accept_friend_request", acceptFriendRequest);
      pusherClient.unbind("reject_friend_request", rejectFriendRequest);

      pusherClient.unbind("add_new_friend", addNewFriendHandler);
      pusherClient.unbind("delete_friend", deleteFriendHandler);

      pusherClient.unbind("new_chat", newChatHandler);
      pusherClient.unbind("unseen_message", unseenMessagesHandler);
      pusherClient.unbind("chat_delete", chatDeleteHandler);
    };
  }, [user.id, pathname, chats]);

  // reset unseen messages
  useEffect(() => {
    setNavIsOpen(false);

    if (pathname.includes("chat")) {
      const chat = chats.filter((chat) => pathname.includes(chat.id))[0];

      setUnseenMessages((prev) => {
        return prev.filter((msg) => msg.chatId !== chat.id);
      });
    }
  }, [pathname]);

  const toggleSidebar = () => setNavIsOpen(!navIsOpen);

  return (
    <div
      className={cn(
        "sidebar fixed left-0 top-0 z-50 h-screen w-full max-w-xs -translate-x-full bg-background duration-300 ease-in-out md:sticky md:translate-x-0",
        navIsOpen && "translate-x-0",
      )}
    >
      <Button
        className="absolute -right-12 top-4 px-2 py-1 md:hidden"
        variant="ghost"
        onClick={toggleSidebar}
      >
        {navIsOpen ? (
          <XSquareIcon className="bg-white" />
        ) : (
          <MenuSquareIcon className="bg-white" />
        )}
      </Button>
      <div className="scrollbar-thin flex h-full flex-col overflow-auto border-r px-6 py-3">
        <Link
          className="mb-4 flex shrink-0 items-center self-start"
          href="/dashboard"
        >
          <Image
            className="block"
            src="/img/chatiko.webp"
            width={50}
            height={50}
            alt="Chatiko logo"
          />
          <span className="ml-1 text-2xl font-semibold text-[--orange]">
            Chatiko
          </span>
        </Link>

        <nav className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-y-4">
            <div>
              <h2 className="text-xs font-semibold leading-6 text-muted-foreground">
                Overview
              </h2>
              <ul className="-mx-2 space-y-1">
                <li>
                  <Link
                    className="flex items-center gap-3 rounded-md p-2 text-sm font-semibold leading-6 duration-300 hover:bg-accent hover:text-accent-foreground"
                    href="/dashboard/invite"
                  >
                    <UserPlusIcon className="ml-1" />
                    <span className="-ml-1 truncate">Invite friend</span>
                  </Link>
                </li>
                <li>
                  <Link
                    className="flex items-center gap-3 rounded-md p-2 text-sm font-semibold leading-6 duration-300 hover:bg-accent hover:text-accent-foreground"
                    href="/dashboard/requests"
                  >
                    <UserIcon />
                    <span className="truncate">Friend requests</span>

                    {friendRequests !== 0 && (
                      <span className="leading-0 flex min-h-[24px] min-w-[24px] items-center justify-center rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                        {friendRequests > 99 ? "99+" : friendRequests}
                      </span>
                    )}
                  </Link>
                </li>
                <li>
                  <NewChat friends={friends} />
                </li>
                <li>
                  <Link
                    className="flex items-center gap-3 rounded-md p-2 text-sm font-semibold leading-6 duration-300 hover:bg-accent hover:text-accent-foreground"
                    href="/dashboard/global-chat"
                  >
                    <GlobeIcon />
                    <span className="truncate">Global Chat</span>
                  </Link>
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
                {chats.map((chat) => {
                  const chatId = chat.id;
                  const isActive = pathname === `/dashboard/chat/${chatId}`;
                  const isGroupChat = chat.users.length > 1;
                  const unseenMessagesCount = unseenMessages.filter(
                    (msg) => msg.chatId === chat.id,
                  ).length;

                  return (
                    <li key={chatId}>
                      <Link
                        className={cn(
                          "flex items-center gap-3 rounded-md p-2 text-sm font-semibold leading-6 duration-300",
                          isActive && "bg-secondary text-secondary-foreground",
                          !isActive &&
                            "hover:bg-secondary hover:text-secondary-foreground",
                        )}
                        href={`/dashboard/chat/${chatId}`}
                      >
                        {isGroupChat ? (
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-400 text-lg">
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
                        <span className="truncate">{chat.name}</span>
                        {unseenMessagesCount > 0 && (
                          <span className="leading-0 flex min-h-[24px] min-w-[24px] items-center justify-center rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                            {unseenMessagesCount > 99
                              ? "99+"
                              : unseenMessagesCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="mt-auto flex items-center pt-6">
            <div className="flex flex-1 items-center gap-x-4">
              <Image
                className="rounded-full"
                width={32}
                height={32}
                sizes="32px"
                src={user.image}
                alt="Your profile avatar"
              />

              <div className="flex max-w-[175px] flex-col text-sm font-semibold leading-tight">
                <span className="truncate">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>

            <SignOutButton />
          </div>
        </nav>
      </div>
    </div>
  );
};

export { Sidebar };
