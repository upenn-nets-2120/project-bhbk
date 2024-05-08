"use client";

import { useUser } from "@/providers/UserProvider";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { FaRegUserCircle } from "react-icons/fa";
import { InputForm } from "../common/forms/InputForm";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

export const ChatGroupCreateTrigger = () => {
  const { friends } = useUser();

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="w-fit text-xs">Create group chats</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-primary">
            Create a group chat
          </DialogTitle>
          <DialogDescription>
            Form a group chat with your friends!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-3">
          <InputForm label="Group name" placeholder="Name the group..." />
          <ScrollArea className="min-h-[100px] max-h-[300px] overflow-auto h-full border rounded-md">
            <div className="font-semibold p-3">Pick members</div>
            <ToggleGroup
              className="flex flex-col items-start justify-start"
              type="multiple"
            >
              {friends.map((friend) => (
                <ToggleGroupItem
                  value={friend.id?.toString() || ""}
                  className="w-full flex space-x-2 justify-start px-2 py-8 data-[state=on]:bg-primary/15"
                >
                  <Avatar>
                    {friend.profileUrl ? (
                      <AvatarImage src={friend.profileUrl} />
                    ) : (
                      <FaRegUserCircle className="w-full h-full text-primary" />
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="font-semibold">{friend.username}</div>
                  </div>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
