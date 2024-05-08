"use client";

import { api, createWebSocketConnection, fetcher } from "@/lib/api";
import { toast } from "@/lib/utils";
import { ChatMessage } from "@/types/chat";
import { User } from "@/types/user";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import useSWR from "swr";

interface ChatContextProps {
  chatUsers: User[];
  chatId: number | null;
  setChatId: (chatId: number | null) => void;
  setChatUsers: (users: User[]) => void;
  ws: WebSocket | undefined;
  sendMessage: (text: string) => void;
  messages: ChatMessage[];
  getMessageFromChatId: (id: number) => Promise<ChatMessage[]>;
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

  const [ws, setWs] = useState<WebSocket | undefined>();

  const isValidChat = chatId && chatId !== -1 && chatUsers.length > 0;

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { data: fetchedMessages } = useSWR(
    isValidChat ? `/chat/${chatId}/messages` : null,
    fetcher,
    { refreshInterval: 1000 }
  );

  const getMessages = async () => {
    if (isValidChat) {
      const { data: fetchedMessages } = await api.get<ChatMessage[]>(
        `/chat/${chatId}/messages`
      );

      setMessages(fetchedMessages);
    } else {
      setMessages([]);
    }
  };

  const getMessageFromChatId = async (id: number) => {
    const { data: messagesFromChat } = await api.get<ChatMessage[]>(
      `/chat/${id}/messages`
    );

    return messagesFromChat;
  };

  useEffect(() => {
    if (isValidChat) {
      setMessages(fetchedMessages || []);
    }
  }, [fetchedMessages]);

  useEffect(() => {
    if (isValidChat) {
      const wsConnection = createWebSocketConnection(chatId);
      setWs(wsConnection);
    }
    getMessages();
  }, [chatId, chatUsers]);

  const sendMessage = (content: string) => {
    const message = {
      content,
    };

    ws?.send(JSON.stringify(message));
  };

  useEffect(() => {
    if (ws) {
      ws.addEventListener("open", () => {
        toast("Connected to chat!");
      });

      ws.addEventListener("message", (event) => {
        console.log(event.data);

        const newMessages = JSON.parse(event.data) as ChatMessage[];

        if (newMessages && newMessages.length > 0) {
          setMessages(newMessages);
        }
      });
    }
  }, [ws]);

  const value = useMemo(
    () => ({
      chatId,
      chatUsers,
      setChatId,
      setChatUsers,
      ws,
      sendMessage,
      messages,
      getMessageFromChatId,
    }),
    [
      chatId,
      chatUsers,
      setChatId,
      ws,
      setWs,
      sendMessage,
      messages,
      getMessageFromChatId,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
