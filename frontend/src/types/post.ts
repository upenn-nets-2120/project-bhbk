import { User } from "./user";

export type Post = {
    id?: number;
    imageUrl?: string;
    text: string;
    author?: User;
    createdAt: Date;
}