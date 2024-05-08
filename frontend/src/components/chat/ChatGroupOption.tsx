"use client";

import { cn } from "@/lib/utils";
import { useChat } from "@/providers/ChatProvider";
import { ChatGroup, ChatMessage } from "@/types/chat";
import { useEffect } from "react";
import { FC, useState } from "react";
import { HiMiniUserGroup } from "react-icons/hi2";
import { Avatar } from "../ui/avatar";

interface ChatGroupOptionProps {
  group: ChatGroup;
}

export const ChatGroupOption: FC<ChatGroupOptionProps> = ({ group }) => {
  const {
    setChatId,
    setChatUsers,
    chatId,
    getMessageFromChatId,
    messages: contextMessages,
    setIsGroup,
  } = useChat();

  const [messages, setMesssages] = useState<ChatMessage[]>([]);

  const onSelect = () => {
    setChatId(group.id);
    setChatUsers(group.users);
    setIsGroup(true);
  };

  const isSelected = group.id === chatId;

  useEffect(() => {
    getMessageFromChatId(group.id).then((fetchedMessages) => {
      if (fetchedMessages.length > 0) {
        console.log(fetchedMessages);
        setMesssages(fetchedMessages);
      }
    });
  }, [contextMessages]);

  return (
    <div
      className={cn(
        "flex px-2 py-4 items-center cursor-pointer transition-all space-x-1.5",
        isSelected && "border shadow-md rounded-md"
      )}
      onClick={onSelect}
    >
      <Avatar>
        <HiMiniUserGroup className="w-full h-full text-primary" />
      </Avatar>
      <div className="flex flex-col">
        <div className="flex space-x-1">
          <div className="font-semibold text-sm">
            {group.name}{" "}
            <span className="text-[0.6rem] text-opacity-50">
              / {group.users.length - 1} other
              {group.users.length - 1 > 1 && "s"}
            </span>
          </div>
        </div>
        <div className="text-xs text-opacity-50">
          {messages.length > 0 ? (
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
  );
};
