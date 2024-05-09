import { eq, and, asc } from "drizzle-orm";
import { chatMessages, userFriends, users, friendRecommendations } from "../database/schema";
import { db } from "../database/setup";
import { ChatMessage } from "../types/chat";

export const addFriends = async (userId: number, friendId: number) => {
  const existingFriendship = await db
    .select()
    .from(userFriends)
    .where(
      and(eq(userFriends.userId, userId), eq(userFriends.friendId, friendId))
    );

  if (existingFriendship.length >= 1) {
    return;
  }

  const user1 = await db.query.users.findFirst({ where: eq(users.id, userId) });
  const user2 = await db.query.users.findFirst({
    where: eq(users.id, friendId),
  });

  const isEitherUserNonExist = !user1 || !user2;

  if (isEitherUserNonExist) {
    throw new Error("One or both users does not exist!");
  }

  await db.insert(userFriends).values({
    userId,
    friendId,
  });
};

export const removeFriends = async (userId: number, friendId: number) => {
  const existingFriendship = await db
    .select()
    .from(userFriends)
    .where(
      and(eq(userFriends.userId, userId), eq(userFriends.friendId, friendId))
    );

  if (existingFriendship.length <= 0) {
    return;
  }

  const user1 = await db.query.users.findFirst({ where: eq(users.id, userId) });
  const user2 = await db.query.users.findFirst({
    where: eq(users.id, friendId),
  });

  const isEitherUserNonExist = !user1 || !user2;

  if (isEitherUserNonExist) {
    throw new Error("One or both users does not exist!");
  }

  await db
    .delete(userFriends)
    .where(
      and(eq(userFriends.userId, userId), eq(userFriends.friendId, friendId))
    );
};

export const getFriends = async (userId: number) => {
  const friendIds = await db.query.userFriends.findMany({
    where: eq(userFriends.userId, userId),
    columns: {
      friendId: true,
    },
  });

  if (friendIds.length <= 0) {
    return [];
  }

  const friends = await db.query.users.findMany({
    where: (user, { inArray }) =>
      inArray(
        user.id,
        friendIds.map((id) => id.friendId)
      ),
    columns: {
      id: true,
      username: true,
      profileUrl: true,
      linkedActor: true,
      affiliation: true,
      isOnline: true,
    },
  });

  return friends;
};

export const getFriendRecommendations = async (userId: number) => {
  const friendIds = await db.query.friendRecommendations.findMany({
    where: eq(friendRecommendations.userId, userId),
    columns: {
      friendRecId: true,
    },
    orderBy: asc(friendRecommendations.rank),
  });

  if (friendIds.length <= 0) {
    return [];
  }

  const friends = await db.query.users.findMany({
    where: (user, { inArray }) =>
      inArray(
        user.id,
        friendIds.map((id) => id.friendRecId)
      ),
    columns: {
      id: true,
      username: true,
      profileUrl: true,
      linkedActor: true,
      affiliation: true,
      isOnline: true,
    },
  });

  return friends;
};

export const createNewMessage = async (message: ChatMessage) => {
  await db.insert(chatMessages).values(message);
};
