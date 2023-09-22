"use client";

import { FC } from 'react';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button";

type Props = {
  chatId: string;
  chatPartner: User;
}

const ChatSettings: FC<Props> = ({ chatId, chatPartner }) => {
  const router = useRouter();

  const deleteChatHandler = async () => {
    await fetch('/api/chat/delete-chat', {
      method: 'DELETE',
      body: JSON.stringify({ chatId, chatPartnerId: chatPartner.id }),
    });
    router.push('/dashboard');
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <Settings />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Chat settings</SheetTitle>
          <SheetDescription>
            Make changes to chat here
          </SheetDescription>
        </SheetHeader>
        <div className="flex justify-between flex-wrap gap-4 bg-red-50 border-red-200 p-6 mt-4 rounded-lg">
          <div>
            <h2 className="text-lg font-semibold">
              Delete chat
            </h2>
            <p className="text-gray-600">
              Once you delete this chat, there is no going back. This will also remove <span className="text-destructive truncate">{chatPartner.name}</span> from your friends list.
            </p>
          </div>
          <SheetClose asChild>
            <Button
              className="ml-auto"
              variant="destructive"
              type="submit"
              onClick={deleteChatHandler}
            >
              Delete
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { ChatSettings };