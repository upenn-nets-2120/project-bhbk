import { and, eq } from "drizzle-orm";
import { chatMessages, chats, userChats } from "../database/schema";
import { db } from "../database/setup";
import { Chat } from "../types/chat";
import { NewUser } from "../types/user";
import { getUserById } from "./user";

export const createNewChat = async (userId: number, friendId: number) => {
  const user = await getUserById(userId);
  const friend = await getUserById(friendId);

  if (!user || !friend) {
    throw new Error("User within the chat does not exists");
  }

  const result = await db.insert(chats).values({
    name: `${user.username}, ${friend.username}`,
  });

  if (result.length <= 0) {
    throw new Error("Failed to create new chat");
  }

  const createdChatId = result[0].insertId;

  await addUserToChat(createdChatId, userId);
  await addUserToChat(createdChatId, friendId);

  return createdChatId;
};

export const createNewChatMultiple = async (userIds: number[], name: string) => {
    const userChecks = await Promise.all(userIds.map((id) => getUserById(id)));

    userChecks.map(check => {
        if (!check) {
            throw new Error(undefined);
        }
    })

    const result = await db.insert(chats).values({
        name
    });

    if (result.length <= 0) {
        throw new Error("Failed to create new chat");
    }
    
    const createdChatId = result[0].insertId;

    await Promise.all(userIds.map(id => addUserToChat(createdChatId, id, true)));

    return createdChatId;
}

export const addUserToChat = async (chatId: number, userId: number, isGroup?: boolean) => {
  await db.insert(userChats).values({
    userId,
    chatId,
    ...(isGroup && {
      isGroup
    })
  });
};

export const getChatById = async (chatId: number) => {
  return db.query.chats.findFirst({
    where: eq(chats.id, chatId),
  });
};

export const getChatOfUsers = async (userId: number) => {
  const chatUser = await db.query.userChats.findMany({
    where: and(eq(userChats.userId, userId), eq(userChats.isGroup, false)),
  });

  const chatOfUsersRequests = chatUser.map(async (chat) => {
    const fetchedChat = await getChatById(chat.chatId);

    return fetchedChat;
  });

  const chatOfUsers = await Promise.all(chatOfUsersRequests);

  return chatOfUsers.filter((chat) => chat !== undefined) as Chat[];
};

export const getChatGroupsOfUsers = async (userId: number) => {
  const chatUser = await db.query.userChats.findMany({
    where: and(eq(userChats.userId, userId), eq(userChats.isGroup, true)),
  });

  const chatOfUsersRequests = chatUser.map(async (chat) => {
    const fetchedChat = await getChatById(chat.chatId);

    return fetchedChat;
  });

  const chatOfUsers = await Promise.all(chatOfUsersRequests);

  return chatOfUsers.filter((chat) => chat !== undefined) as Chat[];
}

export const getUsersOfChats = async (chatId: number) => {
    const chats = await db.query.userChats.findMany({
        where: eq(userChats.chatId, chatId)
    })

    const users = await Promise.all(chats.map(chat => {
        const userId = chat.userId;

        return getUserById(userId);
    }));

    return users.filter(user => user !== undefined) as NewUser[];
}

export const getChatMembers = async (chatId: number) => {
  const chatMembers = await db.query.userChats.findMany({
    where: eq(userChats.chatId, chatId),
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          profileUrl: true,
        },
      },
    },
  });

  return chatMembers;
};

export const getChatBetweenTwoUsers = async (
  userId: number,
  friendId: number
) => {
  const [chatOfUser, chatOfFriends] = await Promise.all([
    getChatOfUsers(userId),
    getChatOfUsers(friendId),
  ]);

  const chatOfFriendIds = new Set(chatOfFriends.map((chat) => chat.id));

  const chatBetweenUsers = chatOfUser.filter((chat) =>
    chatOfFriendIds.has(chat.id)
  );

  const chatBetweenTwoUsers = chatBetweenUsers.filter(async (chat) => {
    const membersCount = await getChatMembers(chat.id);

    return membersCount.length === 2;
  });

  if (chatBetweenTwoUsers.length <= 0) {
    return undefined;
  }

  return chatBetweenTwoUsers[0];
};

export const getChatOfUsersMultiple = async (userId: number) => {
    const chatsOfUser = await getChatGroupsOfUsers(userId);
    
    
    const filteredChats = chatsOfUser.map(async (chat) => {
      const users = await getUsersOfChats(chat.id);

      return {
        ...chat,
        users
      }
    })

    const resolvedChatBetweenMultipleUsers = await Promise.all(filteredChats)

    return resolvedChatBetweenMultipleUsers;
}

export const leaveChat = async (userId: number, chatId: number) => {
  await db.delete()
}

export const getMessagesByChatId = async (chatId: number) => {
  const messages = await db.query.chatMessages.findMany({
    where: eq(chatMessages.chatId, chatId),
  });

  const messagesWithUser = messages.map(async (message) => {
    if (message.senderId) {
      const user = await getUserById(message.senderId);
      return {
        ...message,
        user,
      };
    }
  });

  const finalMessages = await Promise.all(messagesWithUser);

  return finalMessages.filter((message) => message && message.senderId);
};
