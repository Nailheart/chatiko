'use client';

import { FC, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { toast } from "react-toastify";
import ReactSelect from "react-select";

import { newChat } from "@/lib/validations/new-chat";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  friends: User[];
}

const NewChat: FC<Props> = ({ friends }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof newChat>>({
    resolver: zodResolver(newChat),
    defaultValues: {
      name: '',
      members: [],
    }
  });

  const handleCloseDialog = () => setIsOpen(false);
  const handleOpenDialog = () => setIsOpen(true);

  const onSubmit = async (data: z.infer<typeof newChat>) => {
    setIsLoading(true);

    try {
      const req = await fetch('/api/chat/new-chat', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!req.ok) {
        const errorMessage = await req.json();
        toast.error(errorMessage);
        return;
      }

      toast.success('New chat successfully created!');
      form.reset();
    } catch (error) {
      toast.error('Uh oh! Something went wrong.');
    } finally {
      setIsLoading(false);
      handleCloseDialog();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <button
        className="w-full flex items-center gap-3 rounded-md p-2 text-sm leading-6 font-semibold duration-300 hover:text-accent-foreground hover:bg-accent"
        onClick={handleOpenDialog}
      >
        <MessageSquarePlus />
        <span className="truncate">New Chat</span>
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new chat</DialogTitle>
          <DialogDescription>
            Create a chat with at least one people.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex flex-col gap-6 mt-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="text-base font-medium cursor-pointer">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter chat name..."
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="absolute top-full" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="members"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="text-base font-medium cursor-pointer">
                    Freinds
                  </FormLabel>
                  <FormControl>
                    <ReactSelect
                      value={field.value}
                      isDisabled={isLoading}
                      closeMenuOnSelect={false}
                      options={friends.map(friend => ({
                        value: friend.id,
                        label: friend.name,
                      } as any))}
                      isMulti
                      onChange={value => field.onChange(value)}
                    />
                  </FormControl>
                  <FormMessage className="absolute top-full" />
                </FormItem>
              )}
            />
            <div className="flex justify-end flex-wrap gap-6 mt-4 pt-6 border-t">
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? <Loader2 className="animate-spin" />
                  : 'Create'
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { NewChat };