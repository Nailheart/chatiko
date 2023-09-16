'use client';

import Image from "next/image";
import Link from "next/link";
import { FC, useState } from "react";

type Props = {
  sessionId: string;
  friendList: User[];
}

const ChatList: FC<Props> = ({ sessionId, friendList }) => {
  const [unseenMessages, setUnseenMessages] = useState(0);

  return (
    <ul className="space-y-1">
      {friendList.map(friend => {
        // one chatId for both user
        const chatId = [sessionId, friend.id].sort().join('--');

        return (
          <li key={friend.id}>
            <Link
              className="hover:text-secondary-foreground hover:bg-secondary group flex items-center gap-3 rounded-md p-2 text-sm leading-6 font-semibold duration-300"
              href={`/dashboard/chat/${chatId}`}
            >
              <Image
                className='rounded-full'
                width={32}
                height={32}
                sizes="32px"
                src={friend.image || ''}
                alt='Your profile avatar'
              />

              {friend.name}
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