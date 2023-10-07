"use client";

import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "react-toastify";

import { pusherClient } from "@/lib/pusher";

type Props = {
  users: User[];
};

const FriendRequest: FC<Props> = ({ users }) => {
  const [friendRequests, setFriendRequests] = useState(users);

  useEffect(() => {
    const addFriendRequest = (user: User) => {
      setFriendRequests((prev) => [...prev, user]);
    };

    const removeFriendRequest = (user: User) => {
      setFriendRequests((prev) => prev.filter((req) => req.id !== user.id));
    };

    pusherClient.bind("incoming_friend_requests", addFriendRequest);
    pusherClient.bind("accept_friend_request", removeFriendRequest);

    return () => {
      pusherClient.unbind("incoming_friend_requests", addFriendRequest);
      pusherClient.unbind("accept_friend_request", removeFriendRequest);
    };
  }, []);

  const removeFriendRequest = (userId: string) => {
    setFriendRequests((prev) => {
      if (!prev) return [];

      return prev.filter((request) => request.id !== userId);
    });
  };

  const acceptFriend = async (userId: string) => {
    try {
      const req = await fetch("/api/friends/accept", {
        method: "POST",
        body: JSON.stringify({ id: userId }),
      });

      if (!req.ok) {
        const errorMessage = await req.json();
        toast.error(errorMessage);
        return;
      }

      removeFriendRequest(userId);
      toast.success("Friend request accepted.");
    } catch (error) {
      toast.error("Uh oh! Something went wrong.");
    }
  };

  const rejectFriend = async (userId: string) => {
    try {
      const req = await fetch("/api/friends/reject", {
        method: "POST",
        body: JSON.stringify({ id: userId }),
      });

      if (!req.ok) {
        const errorMessage = await req.json();
        toast.error(errorMessage);
        return;
      }

      removeFriendRequest(userId);
      toast.success("Friend request declined.");
    } catch (error) {
      toast.error("Uh oh! Something went wrong.");
    }
  };

  if (!friendRequests.length) {
    return (
      <p className="text-sm text-zinc-500">You have no friend requests.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {friendRequests.map((user) => (
        <div key={user.id} className="flex items-center gap-4">
          <div className="flex flex-1 items-center gap-x-4">
            <Image
              className="rounded-full"
              width={40}
              height={40}
              sizes="40px"
              src={user.image}
              alt="Profile avatar"
            />

            <div className="flex max-w-screen-sm flex-col text-sm font-semibold leading-tight">
              <span className="truncate">{user.name}</span>
              <span className="truncate text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>

          <button
            className="grid h-8 w-8 place-items-center rounded-sm border border-[--green] text-[--green] transition-all hover:bg-[--green] hover:text-white"
            aria-label="accept friend"
            onClick={() => acceptFriend(user.id)}
          >
            <Check />
          </button>
          <button
            className="grid h-8 w-8 place-items-center rounded-sm border border-destructive text-destructive transition-all hover:bg-destructive hover:text-white"
            aria-label="reject friend"
            onClick={() => rejectFriend(user.id)}
          >
            <X />
          </button>
        </div>
      ))}
    </div>
  );
};

export { FriendRequest };
