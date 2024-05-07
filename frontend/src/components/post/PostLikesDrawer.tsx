"use client";

import { User } from "@/types/user";
import { FC } from "react";
import { FriendOption } from "../friends/FriendOption";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "../ui/drawer";
import { ScrollArea } from "../ui/scroll-area";

interface PostLikesDrawerProps {
  likedUsers: User[];
}

export const PostLikesDrawer: FC<PostLikesDrawerProps> = ({ likedUsers }) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <span className="underline cursor-pointer">
          {likedUsers.length - 1} other
          {likedUsers.length - 1 > 1 && "s"}
        </span>
      </DrawerTrigger>
      <DrawerContent className="mx-auto w-full max-w-3xl">
        <DrawerHeader className="font-semibold">Liked users</DrawerHeader>
        <div className="pb-2">
          <ScrollArea className="min-h-[150px] max-h-[400px] overflow-auto">
            {likedUsers.map((likedUser) => (
              <FriendOption user={likedUser} />
            ))}
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
