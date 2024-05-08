"use client";

import { chatApi } from "@/lib/api";
import { toast } from "@/lib/utils";
import { useChat } from "@/providers/ChatProvider";
import { useUser } from "@/providers/UserProvider";
import { User } from "@/types/user";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { BsPlus } from "react-icons/bs";
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

  const { setChatId } = useChat();

  const [groupName, setGroupName] = useState<string>();

  const [selectedFriends, setSelectedFriends] = useState<User[]>([]);

  const [isMakingRequest, setIsMakingRequest] = useState(false);

  const onGroupChange = (values: string[]) => {
    const selectedFriendIds = new Set(values.map((value) => parseInt(value)));

    const filteredSelectedFriends = friends.filter((friend) =>
      selectedFriendIds.has(friend.id || -1)
    );

    setSelectedFriends(filteredSelectedFriends);
  };

  const createGroup = async () => {
    setIsMakingRequest(true);
    const friendIds = selectedFriends.map((friend) => friend.id);
    const { data: chatId } = await chatApi.post("/groups/create", {
      friendIds,
      groupName,
    });

    setIsMakingRequest(false);
    setSelectedFriends([]);
    toast(`Created group ${groupName}`);
    setGroupName("");

    setChatId(chatId);
  };

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
          <InputForm
            label="Group name"
            placeholder="Name the group..."
            value={groupName}
            setValue={setGroupName}
          />
          <ScrollArea className="min-h-[100px] max-h-[300px] overflow-auto h-full border rounded-md">
            <div className="font-semibold p-3">Pick members</div>
            <ToggleGroup
              className="flex flex-col items-start justify-start"
              type="multiple"
              onValueChange={onGroupChange}
              value={selectedFriends.map(
                (friend) => friend.id?.toString() || ""
              )}
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
          {selectedFriends.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">Selected friends:</span>{" "}
              <div className="inline-flex flex-wrap gap-2">
                {selectedFriends.map((friend) => (
                  <div className="flex px-2 py-1 rounded-full bg-primary text-background">
                    {friend.username}
                  </div>
                ))}
              </div>
            </div>
          )}
          {groupName && groupName.length > 0 && selectedFriends.length > 0 && (
            <Button className="flex space-x-2" onClick={createGroup}>
              {isMakingRequest ? (
                <AiOutlineLoading className="animate-spin" />
              ) : (
                <BsPlus />
              )}
              <span>Create group</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
