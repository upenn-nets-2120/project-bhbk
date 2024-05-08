"use client";

import { api, chatApi, createWebSocketConnection, fetcher } from "@/lib/api";
import { toast } from "@/lib/utils";
import { ChatGroup, ChatMessage } from "@/types/chat";
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
import { useUser } from "./UserProvider";

interface ChatContextProps {
  chatUsers: User[];
  chatId: number | null;
  setChatId: (chatId: number | null) => void;
  setChatUsers: (users: User[]) => void;
  ws: WebSocket | undefined;
  sendMessage: (text: string) => void;
  messages: ChatMessage[];
  getMessageFromChatId: (id: number) => Promise<ChatMessage[]>;
  groups: ChatGroup[];
  isGroup: boolean;
  setIsGroup: (isGroup: boolean) => void;
  leaveChat: () => Promise<void>;
  getGroups: () => Promise<void>;
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

  const { user, friends } = useUser();

  const [chatUsers, setChatUsers] = useState<User[]>([]);

  const [ws, setWs] = useState<WebSocket | undefined>();

  const isValidChat = chatId && chatId !== -1 && chatUsers.length > 0;

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [groups, setGroups] = useState<ChatGroup[]>([]);

  const [isGroup, setIsGroup] = useState(false);

  const { data: fetchedMessages } = useSWR<ChatMessage[]>(
    isValidChat ? `/chat/${chatId}/messages` : null,
    fetcher,
    { refreshInterval: 1000 }
  );

  const { data: fetchedChatUsers } = useSWR<User[]>(
    isValidChat ? `/chat/${chatId}/users` : null,
    fetcher,
    { refreshInterval: 1000 }
  );

  const { data: fetchedGroups } = useSWR<ChatGroup[]>(
    user ? "/chat/groups" : null,
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

  const getGroups = async () => {
    const { data: groups } = await api.get<ChatGroup[]>(`/chat/groups`);
    setGroups(groups);
  };

  const leaveChat = async () => {
    await chatApi.post(`/groups/${chatId}/leave`);
    setMessages([]);
    setChatUsers([]);
    sendMessage("Left the chat!");
    await getGroups();
    setChatId(null);
  };

  useEffect(() => {
    if (fetchedGroups && fetchedGroups.length > 0) {
      setGroups(fetchedGroups);
    }
  }, [fetchedGroups]);

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
    if (fetchedChatUsers && fetchedChatUsers.length > 0 && isValidChat) {
      setChatUsers(fetchedChatUsers);
    }
  }, [fetchedChatUsers]);

  useEffect(() => {
    if (ws) {
      ws.addEventListener("message", (event) => {
        const newMessages = JSON.parse(event.data) as ChatMessage[];

        if (newMessages && newMessages.length > 0) {
          setMessages(newMessages);
        }
      });
    }
  }, [ws]);

  useEffect(() => {
    const newlyUpdatedChatUsers = chatUsers.map((chatUser) => {
      const newChatUser = friends.find((friend) => friend.id === chatUser.id);

      if (newChatUser) {
        return newChatUser;
      }
    });

    setChatUsers(
      newlyUpdatedChatUsers.filter((user) => user !== undefined) as User[]
    );
  }, [friends]);

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
      groups,
      isGroup,
      setIsGroup,
      leaveChat,
      getGroups,
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
      groups,
      setGroups,
      isGroup,
      setIsGroup,
      leaveChat,
      getGroups,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
