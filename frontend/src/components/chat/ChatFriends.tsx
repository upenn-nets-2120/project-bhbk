"use client";

import { useUser } from "@/providers/UserProvider";
import { FaRegUserCircle } from "react-icons/fa";
import { IoMdLogOut } from "react-icons/io";
import { RiProgress8Line } from "react-icons/ri";
import { Avatar, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { ChatFriendOption } from "./ChatFriendOption";

export const ChatFriends = () => {
  const { friends } = useUser();

  return (
    <div className="flex max-w-full md:max-w-[40%] w-full flex-col max-h-screen">
      <ScrollArea className="h-full mx-2 rounded-md overflow-auto overflow-visible">
        <div className="text-primary text-lg font-semibold">Your friends</div>
        <div className="py-2" />
        {friends.map((friend) => (
          <ChatFriendOption friend={friend} />
        ))}
      </ScrollArea>
    </div>
  );
};
