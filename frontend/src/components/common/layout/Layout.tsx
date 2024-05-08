"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { FC, PropsWithChildren } from "react";

interface LayoutProps extends PropsWithChildren {}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const isChat = pathname === "/chat";

  return (
    <div
      className={cn(
        "relative flex h-full md:w-full mx-3.5 md:mx-auto",
        isChat ? "max-w-screen-xl" : "max-w-screen-md"
      )}
    >
      {children}
    </div>
  );
};
