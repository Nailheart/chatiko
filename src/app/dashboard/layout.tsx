import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { UserIcon, UserPlusIcon } from 'lucide-react';

import { redis } from "@/lib/redis";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SignOutButton } from '@/components/sign-out-button/sign-out-button';
import { ChatList } from '@/components/chat-list/chat-list';
import { FriendRequestLink } from '@/components/friend-request-link/friend-request-link';

type Props = {
  children: ReactNode;
}

export const metadata = {
  title: 'Chatiko | Dashboard',
  description: 'Your dashboard',
}

const Layout = async ({ children }: Props) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }

  const friendRequests = await redis.smembers(`user:${session.user.id}:incoming_friend_requests`);
  
  const friendIds = await redis.smembers(`user:${session.user.id}:friend_list`);
  const friendList = await Promise.all(
    friendIds.map(async (friendId) => {
      const friend = await redis.get<User | null>(`user:${friendId}`);
      return friend;
    })
  );
  
  return (
    <div className='flex'>
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
                    className='flex items-center gap-3 group rounded-md p-2 text-sm leading-6 font-semibold duration-300 hover:text-accent-foreground hover:bg-accent'
                    href="/dashboard/invite"
                  >
                    <span className='p-1 rounded-md border border-current group-hover:text-current group-hover:border-current'>
                      <UserPlusIcon className="w-4 h-4" />
                    </span>
                    <span className='truncate'>Invite friend</span>
                  </Link>
                </li>
                <li>
                  <FriendRequestLink
                    sessionId={session.user.id}
                    requestsCount={friendRequests.length}
                  />
                </li>
              </ul>
            </div>
            <div>
              {Boolean(friendList.length) && (
                <h2 className='text-xs font-semibold leading-6 text-muted-foreground'>
                  Your chats
                </h2>
              )}
              <ChatList
                sessionId={session.user.id}
                friendList={friendList as User[]}
              />
            </div>
          </div>
          <div className='flex items-center mt-auto pt-6'>
            <div className='flex flex-1 items-center gap-x-4'>
              <Image
                className='rounded-full'
                width={32}
                height={32}
                sizes="32px"
                src={session.user.image || ''}
                alt='Your profile avatar'
              />

              <div className='flex flex-col max-w-[175px] text-sm font-semibold leading-tight'>
                <span className='truncate'>
                  {session?.user.name}
                </span>
                <span className='text-xs text-muted-foreground truncate'>
                  {session?.user.email}
                </span>
              </div>
            </div>
            
            <SignOutButton />
          </div>
        </nav>
      </div>
      
      <div className="w-full min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default Layout;
