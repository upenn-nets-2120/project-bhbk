"use client";

import { useUser } from "@/providers/UserProvider";
import { FaRegUserCircle } from "react-icons/fa";
import { IoMdLogOut } from "react-icons/io";
import { RiProgress8Line } from "react-icons/ri";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { ChatFriendOption } from "./ChatFriendOption";
import { ChatGroupCreateTrigger } from "./ChatGroupCreateTrigger";

export const ChatFriends = () => {
  const { friends } = useUser();

  return (
    <div className="flex max-w-full md:max-w-[40%] w-full flex-col max-h-screen">
      <ScrollArea className="h-full mx-2 rounded-md max-h-[calc(100vh-100px)] overflow-y-scroll overflow-visible">
        <div className="text-primary text-lg font-semibold">Your friends</div>
        <div className="py-2" />
        {friends.map((friend) => (
          <ChatFriendOption friend={friend} />
        ))}
        <div className="py-3" />
        <div className="flex justify-between items-center pb-2">
          <div className="text-primary text-lg font-semibold">
            Your group chats
          </div>
          <ChatGroupCreateTrigger />
        </div>
      </ScrollArea>
    </div>
  );
};
