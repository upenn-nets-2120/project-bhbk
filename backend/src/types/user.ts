import { users } from "../database/schema";

export type NewUser = typeof users.$inferInsert;

export type SignUpUser = Omit<NewUser, "hashedPassword"> & { password: string }

export type LogInUser = { username: string, password: string }