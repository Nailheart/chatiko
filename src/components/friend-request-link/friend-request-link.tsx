'use client';

import Link from "next/link";
import { UserIcon } from "lucide-react";
import { FC, useEffect, useState } from "react";

import { pusherClient } from "@/lib/pusher";

type Props = {
  sessionId: string;
  requestsCount: number;
}

const FriendRequestLink: FC<Props> = ({ sessionId, requestsCount }) => {
  const [friendRequests, setFriendRequests] = useState(requestsCount);

  useEffect(() => {
    const incomingFriendRequest = pusherClient.subscribe(sessionId);
  
    const incomingRequestHandler = () => {
      setFriendRequests(prev => prev + 1);
    }
    
    const removeFriendRequest = () => {
      setFriendRequests(prev => prev - 1);
    }

    incomingFriendRequest.bind('incoming_friend_requests', incomingRequestHandler);
    incomingFriendRequest.bind('accept_friend_request', removeFriendRequest);
    incomingFriendRequest.bind('reject_friend_request', removeFriendRequest);

    return () => {
      incomingFriendRequest.unsubscribe();
      incomingFriendRequest.unbind_all();
    }
  }, [friendRequests]);

  return (
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
  );
};

export { FriendRequestLink };