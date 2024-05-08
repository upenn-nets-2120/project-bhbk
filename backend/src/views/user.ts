import { eq, not } from "drizzle-orm";
import { users } from "../database/schema";
import { db } from "../database/setup";
import { NewUser } from "../types/user";

export const updateUser = async (
  userId: number,
  updatedUser: Partial<NewUser>
) => {
  const foundCondition = eq(users.id, userId);
  const foundUsers = await db.select().from(users).where(foundCondition);

  if (foundUsers.length <= 0) {
    throw new Error("Cannot find. Please sign up!");
  }

  await db.update(users).set(updatedUser).where(foundCondition);

  const foundUpdatedUsers = await db.select().from(users).where(foundCondition);

  if (foundUpdatedUsers.length <= 0) {
    throw new Error("Cannot update user. Please try again!");
  }

  const { hashedPassword, ...newUpdatedUser } = foundUpdatedUsers[0];

  return newUpdatedUser;
};

export const getAllUsers = async (userId: number) => {
  const allUsers = await db.query.users.findMany({
    columns: {
      id: true,
      username: true,
      profileUrl: true,
      linkedActor: true,
      affiliation: true,
      isOnline: true
    },
    where: not(eq(users.id, userId))
  })

  return allUsers;
}

export const getUserById = async (userId: number) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  return user;
}
