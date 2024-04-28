"use client";

import Link from "next/link";
import { GoHome } from "react-icons/go";
import { FaUserCircle } from "react-icons/fa";
import { BsChatFill } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { useUser } from "@/providers/UserProvider";

export const toolBarLinks = [
  {
    name: "Home",
    href: "/",
    IconComponent: GoHome,
  },
  {
    name: "Chat",
    href: "/chat",
    IconComponent: BsChatFill,
  },
];

export const toolBarGraphicSize = 16;

export const ToolBar = () => {
  const { isLoggedIn } = useUser();

  console.log(isLoggedIn);

  return (
    <div className="flex items-center gap-4 text-sm lg:gap-6">
      {toolBarLinks.map((tool) => (
        <Link
          href={tool.href}
          className="transition-colors hidden md:flex items-center space-x-1.5 text-foreground hover:text-primary"
        >
          <tool.IconComponent
            size={toolBarGraphicSize}
            className="text-primary"
          />
          <span className="text-sm">{tool.name}</span>
        </Link>
      ))}

      <div className="flex space-x-2">
        {isLoggedIn ? (
          <>
            <Link
              href="/profile"
              className="transition-colors hidden md:flex items-center space-x-1.5 text-foreground hover:text-primary"
            >
              <FaUserCircle
                size={toolBarGraphicSize}
                className="text-primary"
              />
              <span className="text-sm">Profile</span>
            </Link>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};
