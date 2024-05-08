"use client";

import Link from "next/link";
import { GoHome } from "react-icons/go";
import { FaUserCircle } from "react-icons/fa";
import { BsChatFill } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { useUser } from "@/providers/UserProvider";
import { IoCreateOutline } from "react-icons/io5";
import { FaUserFriends } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { ThemeToggle } from "./ThemeToggle";

export const toolBarLinks = [
  {
    name: "Home",
    href: "/",
    IconComponent: GoHome,
  },
];

export const loggedIntoolBarLinks = [
  {
    name: "Create",
    href: "/create-post",
    IconComponent: IoCreateOutline,
  },
  {
    name: "Friends",
    href: "/friends",
    IconComponent: FaUserFriends,
  },
  {
    name: "Chat",
    href: "/chat",
    IconComponent: BsChatFill,
  },
  {
    name: "Profile",
    href: "/profile",
    IconComponent: FaUserCircle,
  },
];

export const toolBarGraphicSize = 16;

export const ToolBar = () => {
  const { isLoggedIn, user } = useUser();

  return (
    <div className="flex items-center gap-4 text-sm lg:gap-6">
      {toolBarLinks.map((tool) => (
        <Link
          href={tool.href}
          className={cn(
            "transition-colors hidden md:flex items-center space-x-1.5 text-foreground hover:text-primary"
          )}
        >
          <tool.IconComponent
            size={toolBarGraphicSize}
            className="text-primary"
          />
          <span className="text-sm">{tool.name}</span>
        </Link>
      ))}
      {isLoggedIn ? (
        <>
          {loggedIntoolBarLinks.map((tool) => (
            <Link
              href={tool.href}
              className={cn(
                "transition-colors hidden md:flex items-center space-x-1.5 text-foreground hover:text-primary"
              )}
              key={tool.name}
            >
              {tool.href === "/profile" &&
              isLoggedIn &&
              user &&
              user.profileUrl ? (
                <Avatar className="w-[17px] h-[17px] border-primary border-1">
                  <AvatarImage src={user?.profileUrl} />
                </Avatar>
              ) : (
                <tool.IconComponent
                  size={toolBarGraphicSize}
                  className="text-primary"
                />
              )}
              <span className="text-sm">{tool.name}</span>
            </Link>
          ))}
        </>
      ) : (
        <div className="flex space-x-2">
          <Link href="/log-in">
            <Button className="text-xs h-fit py-2 px-3" variant="default">
              Log in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button
              className="text-xs text-foreground h-fit py-2 px-3"
              variant="outline"
            >
              Sign up
            </Button>
          </Link>
        </div>
      )}
      <ThemeToggle />
    </div>
  );
};
