import { User } from "./user";

export type ChatMessage = {
    id?: number;
    content: string;
    senderId: number;
    chatId: number;
    user: User;
    sentAt: string;
}