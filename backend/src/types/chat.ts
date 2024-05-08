import { chats } from "../database/schema";

export type Chat = typeof chats.$inferSelect;