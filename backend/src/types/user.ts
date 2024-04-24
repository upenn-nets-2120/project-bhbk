import { users } from "../database/schema";

export type NewUser = typeof users.$inferInsert;

export type SignUpUser = Omit<NewUser, "hashedPassword"> & { password: string }