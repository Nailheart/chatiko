"use client";

import { signOut } from "next-auth/react";
import { Loader2, LogOut } from "lucide-react";
import { ButtonHTMLAttributes, FC, useState } from "react";

import { Button } from "@/components/ui/button";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

const SignOutButton: FC<Props> = ({ ...props }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Button
      variant="ghost"
      disabled={isLoading}
      aria-label="Sign out"
      onClick={() => {
        setIsLoading(true);
        signOut({ callbackUrl: "/" });
      }}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
    </Button>
  );
};

export { SignOutButton };
