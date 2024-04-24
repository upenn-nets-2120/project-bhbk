import Link from "next/link";
import { GoHome } from "react-icons/go";
import { FaUserCircle } from "react-icons/fa";
import { BsChatFill } from "react-icons/bs";
import { Button } from "@/components/ui/button";

export const toolBarLinks = [
  {
    name: "Home",
    href: "/",
    IconComponent: GoHome,
  },
  {
    name: "Profile",
    href: "/profile",
    IconComponent: FaUserCircle,
  },
  {
    name: "Chat",
    href: "/chat",
    IconComponent: BsChatFill,
  },
];

export const ToolBar = () => {
  return (
    <div className="flex items-center gap-4 text-sm lg:gap-6">
      {toolBarLinks.map((tool) => (
        <Link
          href={tool.href}
          className="transition-colors hidden md:flex items-center space-x-1 text-foreground hover:text-foreground/40"
        >
          <tool.IconComponent />
          <span>{tool.name}</span>
        </Link>
      ))}
      <Button className="text-xs h-fit py-2 px-3" variant="default">
        Log in
      </Button>
      <Button
        className="text-xs text-foreground h-fit py-2 px-3"
        variant="outline"
      >
        Sign up
      </Button>
    </div>
  );
};
