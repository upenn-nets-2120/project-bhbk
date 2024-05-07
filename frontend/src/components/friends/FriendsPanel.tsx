"use client";

import { useUser } from "@/providers/UserProvider";
import { User } from "@/types/user";
import { useEffect, useState } from "react";
import { BsPlusCircle } from "react-icons/bs";
import { FaUser, FaUserCircle } from "react-icons/fa";
import { Avatar, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Toggle } from "../ui/toggle";
import { FriendOption } from "./FriendOption";

export const FriendsPanel = () => {
  const { users } = useUser();
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);

  useEffect(() => {
    if (users) {
      setDisplayedUsers(users);
    }
  }, [users]);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:space-y-2">
        <div className="text-primary text-2xl md:text-[2rem] font-semibold">
          Your friends
        </div>
        <div className="text-foreground text-sm text-opacity-40">
          Manage your connections here! Making friends with others means you can
          get updated on their posts
        </div>
      </div>
      <div className="flex">
        {displayedUsers.length > 0 && (
          <ScrollArea className="border rounded-md min-h-[200px] max-h-[500px] overflow-auto h-full w-full">
            <div className="font-semibold px-3 pt-5">
              People across InstaLite
            </div>
            {displayedUsers.map((user) => (
              <FriendOption key={user.username} user={user} />
            ))}
          </ScrollArea>
        )}
      </div>
    </div>
  );
};
