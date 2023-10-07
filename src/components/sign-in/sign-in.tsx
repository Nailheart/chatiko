"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { GithubIcon, ChromeIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const SignIn = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

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
        disabled={isGoogleLoading || isGithubLoading}
        onClick={() => {
          setIsGoogleLoading(true);
          signIn("google", { callbackUrl: "/dashboard" });
        }}
      >
        {isGoogleLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <ChromeIcon />
        )}
        <span className="ml-2">Google</span>
      </Button>
      <Button
        className="w-full max-w-xs text-lg"
        variant="outline"
        disabled={isGoogleLoading || isGithubLoading}
        onClick={() => {
          setIsGithubLoading(true);
          signIn("github", { callbackUrl: "/dashboard" });
        }}
      >
        {isGithubLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <GithubIcon />
        )}
        <span className="ml-2">Github</span>
      </Button>
    </div>
  );
};

export { SignIn };
