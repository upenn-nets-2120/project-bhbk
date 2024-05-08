"use client";

import { useChat } from "@/providers/ChatProvider";
import { IoMdLogOut } from "react-icons/io";
import { MdHourglassEmpty } from "react-icons/md";
import { RiProgress8Line } from "react-icons/ri";
import { TextareaForm } from "../common/forms/TextareaForm";
import { ChatContent } from "./ChatContent";

export const ChatWindow = () => {
  const { chatUsers } = useChat();

  return (
    <div className="grow border-primary border h-full mx-2 pb-4 rounded-md relative min-h-[calc(100vh-100px)]">
      {chatUsers.length > 0 && <ChatContent />}
      {chatUsers.length === 0 && (
        <div className="w-full h-full flex items-center justify-center p-3 rounded-md">
          <div className="text-primary flex flex-col space-y-3 items-center">
            <MdHourglassEmpty size={40} />
            <div className="text-center">
              So empty! Please select a friend/group to chat with!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
