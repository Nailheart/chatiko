'use client';

import Image from "next/image";
import { FC, useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Props = {
  users: User[];
}

const FriendRequest: FC<Props> = ({ users }) => {
  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<User[] | null>(users);

  const removeFriendRequest = (userId: string) => {
    setFriendRequests(prev => {
      if(!prev) return [];
      
      return prev.filter((request) => request.id !== userId);
    });
  }

  const acceptFriend = async (userId: string) => {
    try {
      const req = await fetch('/api/friends/accept', {
        method: 'POST',
        body: JSON.stringify({ id: userId })
      });
  
      if (!req.ok) {
        const errorMessage = await req.json();
        toast.error(errorMessage);
        return;
      }
  
      removeFriendRequest(userId);
      toast.success('Friend request accepted.');
      router.refresh(); 
    } catch (error) {
      toast.error('Uh oh! Something went wrong.');
    }
  }

  const rejectFriend = async (userId: string) => {
    try {
      const req = await fetch('/api/friends/reject', {
        method: 'POST',
        body: JSON.stringify({ id: userId })
      });
  
      if (!req.ok) {
        const errorMessage = await req.json();
        toast.error(errorMessage);
        return;
      }
  
      removeFriendRequest(userId);
      toast.success('Friend request declined.');
      router.refresh();
    } catch (error) {
      toast.error('Uh oh! Something went wrong.');
    } 
  }

  if (!friendRequests) {
    return null;
  }

  return (
    <>
      {friendRequests.map((user) => (
        <div key={user.id} className='flex items-center gap-4'>
          <div className='flex flex-1 items-center gap-x-4'>
            <Image
              className='rounded-full'
              width={40}
              height={40}
              sizes="40px"
              src={user.image || ''}
              alt='Your profile avatar'
            />

            <div className='flex flex-col max-w-screen-sm text-sm font-semibold leading-tight'>
              <span className='truncate'>{user.name}</span>
              <span className='text-muted-foreground truncate'>{user.email}</span>
            </div>
          </div>
          
          <button
            className='text-[--green] w-8 h-8 grid place-items-center rounded-sm border border-[--green] hover:bg-[--green] hover:text-white transition-all'
            aria-label='accept friend'
            onClick={() => acceptFriend(user.id)}
          >
            <Check />
          </button>
          <button
            className='text-destructive w-8 h-8 grid place-items-center rounded-sm border border-destructive hover:bg-destructive hover:text-white transition-all'
            aria-label='reject friend'
            onClick={() => rejectFriend(user.id)}
          >
            <X />
          </button>
        </div>
      ))}
    </>
  );
};

export { FriendRequest };