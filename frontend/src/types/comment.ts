import { User } from "./user";

export type Comment = {
    content: string;
    author: User;
    id: number;
    createdAt: string;
}