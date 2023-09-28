'use client';

import Link from "next/link";
import { UserIcon } from "lucide-react";
import { FC, useEffect, useState } from "react";

import { pusherClient } from "@/lib/pusher";
import { PusherChannel, PusherEvent } from '@/enums/enums';

type Props = {
  sessionId: string;
  requestsCount: number;
}

const FriendRequestLink: FC<Props> = ({ sessionId, requestsCount }) => {
  const [friendRequests, setFriendRequests] = useState(requestsCount);

  useEffect(() => {
    const incomingFriendRequest = pusherClient.subscribe(PusherChannel.INCOMING_FRIEND_REQUESTS_ID + sessionId);
  
    const incomingRequestHandler = () => {
      setFriendRequests(prev => prev + 1);
    }
    
    const removeFriendRequest = () => {
      setFriendRequests(prev => prev - 1);
    }

    incomingFriendRequest.bind(PusherEvent.INCOMING_FRIEND_REQUESTS, incomingRequestHandler);
    incomingFriendRequest.bind(PusherEvent.ACECEPT_FRIEND_REQUEST, removeFriendRequest);
    incomingFriendRequest.bind(PusherEvent.REJECT_FRIEND_REQUEST, removeFriendRequest);

    return () => {
      incomingFriendRequest.unsubscribe();
      incomingFriendRequest.unbind_all();
    }
  }, []);

  return (
    <Link
      className='flex items-center gap-3 group rounded-md p-2 text-sm leading-6 font-semibold duration-300 hover:text-secondary-foreground hover:bg-secondary'
      href='/dashboard/requests'
    >
      <span className='group-hover:text-current group-hover:border-current p-1 rounded-md border border-current'>
        <UserIcon className='h-4 w-4' />
      </span>
      <span className='truncate'>Friend requests</span>

      {friendRequests !== 0 && (
        <span className='flex items-center justify-center bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full min-w-[24px] min-h-[24px] leading-0'>
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