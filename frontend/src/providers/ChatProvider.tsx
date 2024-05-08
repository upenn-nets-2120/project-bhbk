"use client";

import { User } from "@/types/user";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";

interface ChatContextProps {
  chatUsers: User[];
  chatId: number | null;
  setChatId: (chatId: number | null) => void;
  setChatUsers: (users: User[]) => void;
}

export const ChatContext = createContext<ChatContextProps | undefined>(
  undefined
);

export const useChat = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat should be used within ChatProvider");
  }

  return context;
};

interface ChatProviderProps extends PropsWithChildren {}

export const ChatProvider: FC<ChatProviderProps> = ({ children }) => {
  const [chatId, setChatId] = useState<number | null>(null);

  const [chatUsers, setChatUsers] = useState<User[]>([]);

  const value = useMemo(
    () => ({
      chatId,
      chatUsers,
      setChatId,
      setChatUsers,
    }),
    [chatId, chatUsers, setChatId]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
