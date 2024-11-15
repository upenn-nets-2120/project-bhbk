import { api, chatApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useChat } from "@/providers/ChatProvider";
import { ChatMessage } from "@/types/chat";
import { User } from "@/types/user";
import { Separator } from "@radix-ui/react-separator";
import { FC, useEffect, useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { IoMdLogOut } from "react-icons/io";
import { RiProgress8Line } from "react-icons/ri";
import { Avatar, AvatarImage } from "../ui/avatar";

interface ChatFriendOptionProps {
  friend: User;
}

export const ChatFriendOption: FC<ChatFriendOptionProps> = ({ friend }) => {
  const [chatId, setChatId] = useState<number | null>();

  const [messages, setMesssages] = useState<ChatMessage[]>([]);

  const {
    setChatId: setContextChatId,
    setChatUsers,
    chatId: contextChatId,
    chatUsers,
    messages: contextMessages,
    getMessageFromChatId,
    setIsGroup,
  } = useChat();

  const getChatId = async () => {
    const { data: chatId } = await chatApi.post("/get", {
      friendId: friend.id,
    });

    if (chatId) {
      setChatId(chatId.id || -1);
    }
  };

  const onSelect = () => {
    setContextChatId(chatId || -1);
    setChatUsers([friend]);
    setIsGroup(false);
  };

  useEffect(() => {
    getChatId();
  }, [contextChatId]);

  const isSelected =
    chatUsers.length == 1 && chatUsers[0].username === friend.username;

  useEffect(() => {
    if (chatId && chatId !== -1) {
      getMessageFromChatId(chatId).then((fetchedMessages) =>
        setMesssages(fetchedMessages)
      );
    }
  }, [contextMessages, chatId]);

  return (
    <>
      <div
        key={friend.username}
        className={cn(
          "flex px-2 py-4 items-center cursor-pointer transition-all",
          isSelected && "border shadow-md rounded-md"
        )}
        onClick={onSelect}
      >
        <div className="flex items-center space-x-2.5">
          <Avatar className="w-12 h-12">
            {friend.profileUrl ? (
              <AvatarImage src={friend.profileUrl} />
            ) : (
              <FaRegUserCircle className="text-primary w-full h-full" />
            )}
          </Avatar>
          <div className="flex flex-col space-y-1">
            <div className="flex space-x-1 items-center">
              <div className="text-sm font-semibold">{friend.username}</div>
              {friend.isOnline ? (
                <div className="flex space-x-0.5 text-background px-1 rounded-full text-[0.6rem] items-center text-green-500">
                  <RiProgress8Line className="animate-pulse" />
                  <span>Active</span>
                </div>
              ) : (
                <div className="flex space-x-0.5 text-background px-1 rounded-full text-[0.6rem] items-center text-red-500">
                  <IoMdLogOut />
                  <span>Inactive</span>
                </div>
              )}
            </div>
            <div className="text-opacity-50 text-xs">
              {chatId && messages.length > 0 ? (
                <>
                  {messages[messages.length - 1].user.username}:{" "}
                  {messages[messages.length - 1].content}
                </>
              ) : (
                <>No chat detected</>
              )}
            </div>
          </div>
        </div>
      </div>
      <Separator />
    </>
  );
};
