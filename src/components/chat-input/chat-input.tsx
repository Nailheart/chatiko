"use client";

import { FC, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  chatId: string;
}

const ChatInput: FC<Props> = ({ chatId }) => {
  const textareaRef = useRef<HTMLInputElement | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if(!input) return;
    setIsLoading(true);

    try {
      const req = await fetch('/api/chat/send-message', {
        method: 'POST',
        body: JSON.stringify({ text: input, chatId }),
      });

      if (!req.ok) {
        const errorMessage = await req.json();
        toast.error(errorMessage);
        return;
      }

      setInput('');
      textareaRef.current?.focus();
    } catch {
      toast.error('Uh oh! Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="sticky left-0 bottom-0 bg-background px-8 py-6 border-t">
      <div className='flex justify-between rounded-lg'>
        <Input
          ref={textareaRef}
          value={input}
          placeholder="Type your message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button
          className="ml-2 min-w-[70px]"
          type="submit"
          disabled={isLoading}
          onClick={handleSendMessage}
        >
          {isLoading
            ? <Loader2 className="animate-spin" />
            : "Send"
          }
        </Button>
      </div>
    </div>
  );
};

export { ChatInput };