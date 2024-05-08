import { cn } from "@/lib/utils";
import { useUser } from "@/providers/UserProvider";
import { ChatMessage as Message } from "@/types/chat";
import { getRelativeTime } from "@feelinglovelynow/get-relative-time";
import { FC } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";

interface ChatMessageProps {
  message: Message;
}

export const processTime = (time: string) => {
  return time
    .replace(" minutes", "m")
    .replace(" seconds", "s")
    .replace(" days", "d")
    .replace(" second", "s")
    .replace(" minute", "m")
    .replace(" day", "d");
};

export const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  const { user } = useUser();

  const isUser = user && user.id === message.user.id;

  const timeSent = processTime(getRelativeTime(new Date(message.sentAt)));

  return (
    <>
      <div
        className={cn(
          "w-full flex px-2 my-3",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        <div className="flex space-x-2 items-center">
          {!isUser && (
            <Avatar className="w-6 h-6">
              <AvatarImage src={message.user.profileUrl} />
            </Avatar>
          )}
          {isUser && (
            <div className="text-[0.5rem] self-end text-opacity-50">
              {timeSent}
            </div>
          )}
          <div className="flex flex-col">
            {!isUser && (
              <div className="text-[0.6rem] font-semibold text-opacity-60">
                {message.user.username}
              </div>
            )}
            <div
              className={cn(
                isUser
                  ? "bg-primary text-background px-2.5 py-1.5 rounded-full"
                  : "border px-2.5 py-1.5 rounded-full"
              )}
            >
              {message.content}
            </div>
          </div>
          {!isUser && (
            <div className="text-[0.5rem] self-end text-opacity-50">
              {timeSent}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
