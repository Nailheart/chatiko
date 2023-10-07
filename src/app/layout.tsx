import { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Toast } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chatiko",
  description: "Welcome to Chatiko realtime chat app",
  icons: {
    icon: [
      {
        url: "/favicon/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/favicon/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
    ],
    apple: {
      url: "/favicon/apple-touch-icon.png",
      sizes: "180x180",
    },
  },
  manifest: "/favicon/site.webmanifest",
  themeColor: "#fff",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main>{children}</main>
        <Toast />
      </body>
    </html>
  );
}
