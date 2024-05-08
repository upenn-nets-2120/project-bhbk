"use client";

import { chatApi } from "@/lib/api";
import { useChat } from "@/providers/ChatProvider";
import { useUser } from "@/providers/UserProvider";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useState } from "react";
import { BsSendPlus } from "react-icons/bs";
import { FaRegUserCircle } from "react-icons/fa";
import { IoMdLogOut } from "react-icons/io";
import { MdCreate } from "react-icons/md";
import { RiProgress8Line } from "react-icons/ri";
import { TextareaForm } from "../common/forms/TextareaForm";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { ChatMessage } from "./ChatMessage";

export const ChatContent = () => {
  const { chatUsers, chatId, setChatId, sendMessage, messages } = useChat();

  const [message, setMessage] = useState<string | undefined>();

  const { user: contextUser } = useUser();

  const isNullChat = chatId === -1;

  const createSession = async () => {
    if (chatUsers.length === 1) {
      const { data: createdChatId } = await chatApi.post("/create", {
        friendId: chatUsers[0].id,
      });
      setChatId(createdChatId);
    }
  };

  const sendChatMessage = () => {
    if (message && message.length > 0) {
      sendMessage(message);
      setMessage("");
    }
  };

  return (
    <>
      <div className="flex border-b sticky top-0 px-2 py-4 text-sm items-center space-x-1">
        <div>💬 Your chat with </div>
        <div className="inline-flex ml-1 flex-wrap gap-2">
          {chatUsers
            .filter((user) => user.id !== contextUser?.id)
            .map((user) => (
              <div className="flex items-center space-x-0.5">
                <Avatar className="w-5 h-5">
                  {user.profileUrl ? (
                    <AvatarImage src={user.profileUrl} />
                  ) : (
                    <FaRegUserCircle className="w-full h-full text-primary" />
                  )}
                </Avatar>
                <div className="font-semibold">{user.username}</div>
                {user.isOnline ? (
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
            ))}
        </div>
      </div>
      <ScrollArea className="w-full overflow-y-scroll h-full max-h-[80%]">
        {messages.length === 0 && (
          <div className="flex w-full items-center justify-center py-4 text-primary">
            Be the first to chat!
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage message={message} />
        ))}
      </ScrollArea>
      <div className="absolute bottom-2 w-full px-2 min-h-[100px] max-h-[200px] flex flex-col space-y-2 items-center">
        {isNullChat && (
          <Button
            className="w-fit text-xs rounded-full space-x-2"
            onClick={createSession}
          >
            <MdCreate />
            <span>Create session</span>
          </Button>
        )}
        <TextareaForm
          label="Your message"
          placeholder="Send a message..."
          disabled={isNullChat}
          textareaProps={{
            className: "w-full",
          }}
          className="w-full"
          value={message}
          setValue={setMessage}
        />
        {message && message?.length && (
          <div className="flex w-full justify-end" onClick={sendChatMessage}>
            <Button className="rounded-lg text-sm flex space-x-2">
              <BsSendPlus />
              <span>Send</span>
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
