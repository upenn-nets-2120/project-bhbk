import { eq } from "drizzle-orm";
import { chats, userChats } from "../database/schema"
import { db } from "../database/setup"
import { Chat } from "../types/chat";
import { getUserById } from "./user"

export const createNewChat = async (userId: number, friendId: number) => {
    const user = await getUserById(userId);
    const friend = await getUserById(friendId);

    if (!user || !friend) {
        throw new Error ('User within the chat does not exists')
    }

    const result = await db.insert(chats).values({
        name: `${user.username}, ${friend.username}`,
    })

    if (result.length <= 0) {
        throw new Error ("Failed to create new chat");
    }

    const createdChatId = result[0].insertId;

    await addUserToChat(createdChatId, userId);
    await addUserToChat(createdChatId, friendId);

    return createdChatId;
}

export const addUserToChat = async (chatId: number, userId: number) => {
    await db.insert(userChats).values({
        userId,
        chatId
    })
}

export const getChatById = async (chatId: number) => {
    return db.query.chats.findFirst({
        where: eq(chats.id, chatId)
    })
}

export const getChatOfUsers = async (userId: number) => {
    const chatUser = await db.query.userChats.findMany({
        where: eq(userChats.userId, userId)
    })

    const chatOfUsersRequests = chatUser.map(async (chat) => {
        const fetchedChat = await getChatById(chat.chatId);

        return fetchedChat;
    })

    const chatOfUsers = await Promise.all(chatOfUsersRequests)

    return chatOfUsers.filter(chat => chat !== undefined) as Chat[];
}

export const getChatMembers = async (chatId: number) => {
    const chatMembers = await db.query.userChats.findMany({
        where: eq(userChats.chatId, chatId),
        with: {
            user: {
                columns: {
                    id: true,
                    username: true,
                    profileUrl: true
                }
            }
        }
    })

    return chatMembers;
}

export const getChatBetweenTwoUsers = async (userId: number, friendId: number) => {

    const [chatOfUser, chatOfFriends] = await Promise.all([getChatOfUsers(userId), getChatOfUsers(friendId)])

    const chatOfFriendIds = new Set(chatOfFriends.map(chat => chat.id))

    const chatBetweenUsers = chatOfUser.filter(chat => chatOfFriendIds.has(chat.id));

    const chatBetweenTwoUsers = chatBetweenUsers.filter(async (chat) => {
        const membersCount = await getChatMembers(chat.id);

        return membersCount.length === 2;
    })

    if (chatBetweenTwoUsers.length <= 0) {
        return undefined
    }
    
    return chatBetweenTwoUsers[0];
}