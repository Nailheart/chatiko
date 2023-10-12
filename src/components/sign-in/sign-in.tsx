"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { ChromeIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <Image
        className="mb-2 mt-[7%] block"
        src="/img/chatiko.webp"
        width={150}
        height={150}
        alt="Face of the dog Chatiko"
      />

      <h1 className="text-4xl font-bold text-[--orange]">Chatiko</h1>
      <p className="text-xl font-semibold">waiting for your messages!</p>

      <Button
        className="mb-4 mt-6 w-full max-w-xs text-lg"
        variant="outline"
        disabled={isLoading}
        onClick={() => {
          setIsLoading(true);
          signIn("google", { callbackUrl: "/dashboard" });
        }}
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <ChromeIcon />}
        <span className="ml-2">Google</span>
      </Button>
    </div>
  );
};

export { SignIn };
