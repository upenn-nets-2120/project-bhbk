import { users } from "../database/schema";
import { db } from "../database/setup";
import { LogInUser, NewUser, SignUpUser } from "../types/user";
import { comparePassword, encryptPassword } from "../utils/encrypt";
import { and, eq } from "drizzle-orm";

export const createUser = async (user: SignUpUser) => {
  const {
    password,
    username,
    firstName,
    lastName,
    affiliation,
    email,
    dob,
    ...otherUserParams
  } = user;
  const { password: extractedPassword, ...userWithoutPassword } = user;

  const missingFields =
    !password ||
    !username ||
    !firstName ||
    !lastName ||
    !affiliation ||
    !email ||
    !dob;

  if (missingFields) {
    throw new Error(
      "Missing fields to sign up new user. Remember to include password, username, first name, last name, affiliation, email and DOB!"
    );
  }

  const hashedPassword = await encryptPassword(password);

  const checkUserExist = and(eq(users.username, username));

  const foundUsers = await db.select().from(users).where(checkUserExist);

  if (foundUsers.length > 0) {
    throw new Error(
      "User already exist with this username and email. Please sign in"
    );
  }

  const newUser: NewUser = {
    hashedPassword,
    username,
    firstName,
    lastName,
    affiliation,
    email,
    dob,
    ...otherUserParams,
  };

  await db.insert(users).values(newUser);

  return userWithoutPassword;
};

export const logInUser = async (user: LogInUser) => {
  const { username, password } = user;

  const foundUsers = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  if (foundUsers.length <= 0) {
    throw new Error("Username does not exist. Please sign up!");
  }

  const { hashedPassword: foundHashedPassword, ...foundUser } = foundUsers[0];

  if (!foundHashedPassword) {
    throw new Error("Cannot locate valid user. Please try again!");
  }

  const isValidPassword = await comparePassword(password, foundHashedPassword);

  if (!isValidPassword) {
    throw new Error("Wrong password. Please try again!");
  }

  return foundUser;
};

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
