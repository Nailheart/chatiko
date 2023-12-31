"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

import { inviteFriend } from "@/lib/validations/invite-friend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const InviteFriend = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof inviteFriend>>({
    resolver: zodResolver(inviteFriend),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof inviteFriend>) => {
    setIsLoading(true);

    try {
      const req = await fetch("/api/friends/invite", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!req.ok) {
        const errorMessage = await req.json();
        toast.error(errorMessage);
        return;
      }

      toast.success("Friend request successfully sent!");
      form.reset();
    } catch (error) {
      toast.error("Uh oh! Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel className="cursor-pointer text-base font-medium text-gray-900">
                Invite a friend by email
              </FormLabel>
              <FormControl>
                <Input
                  className="max-w-xs"
                  type="email"
                  placeholder="Enter your friend's email"
                  required
                  {...field}
                />
              </FormControl>
              <FormMessage className="absolute top-full" />
            </FormItem>
          )}
        />
        <Button className="mt-6" type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export { InviteFriend };
