import { chatApi } from "@/lib/api";
import { toast } from "@/lib/utils";
import { useChat } from "@/providers/ChatProvider";
import { useUser } from "@/providers/UserProvider";
import { User } from "@/types/user";
import { useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { BsPlus } from "react-icons/bs";
import { FaRegUserCircle } from "react-icons/fa";
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
import { ScrollArea } from "../ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

export const ChatInviteTrigger = () => {
  const { chatUsers, chatId, getGroups, setChatUsers } = useChat();

  const { friends } = useUser();

  const [isMakingRequest, setIsMakingRequest] = useState(false);

  const chatUserIds = new Set(chatUsers.map((user) => user.id));

  const unInvitedUsers = friends.filter(
    (friend) => !chatUserIds.has(friend.id)
  );

  const [selectedFriends, setSelectedFriends] = useState<User[]>([]);

  const onGroupChange = (values: string[]) => {
    const selectedFriendIds = new Set(values.map((value) => parseInt(value)));

    setSelectedFriends(
      unInvitedUsers.filter((user) => selectedFriendIds.has(user.id || -1))
    );
  };

  const createInvite = async () => {
    setIsMakingRequest(true);
    await chatApi.post(`/groups/${chatId}/invite`, {
      friendIds: selectedFriends.map((friend) => friend.id),
    });
    await getGroups();
    setChatUsers([...chatUsers, ...selectedFriends]);
    toast(
      `Added ${selectedFriends
        .map((friend) => friend.username)
        .join(", ")} to the group!`
    );
    setIsMakingRequest(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="text-xs px-2 py-1.5 w-fit h-fit">Invite</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite another person to the chat!</DialogTitle>
          <DialogDescription>
            Invite your friends to talk the group
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="min-h-[100px] max-h-[300px] overflow-auto h-full border rounded-md">
          <div className="font-semibold p-3">Invite new members</div>
          <ToggleGroup
            className="flex flex-col items-start justify-start"
            type="multiple"
            onValueChange={onGroupChange}
            value={selectedFriends.map((friend) => friend.id?.toString() || "")}
          >
            {unInvitedUsers.length === 0 && (
              <div className="text-primary px-3 py-2">
                You have invited all your friends to the chat!
              </div>
            )}
            {unInvitedUsers.map((friend) => (
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
        {selectedFriends.length > 0 && (
          <Button className="flex space-x-2" onClick={createInvite}>
            {isMakingRequest ? (
              <AiOutlineLoading className="animate-spin" />
            ) : (
              <BsPlus />
            )}
            <span>Invite</span>
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
