import { chatMessages, chats } from "../database/schema";

export type Chat = typeof chats.$inferSelect;

export type ChatMessage = typeof chatMessages.$inferInsert;