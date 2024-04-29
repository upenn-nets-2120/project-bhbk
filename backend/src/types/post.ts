import { posts  } from "../database/schema";

export type NewPost = typeof posts.$inferInsert;

export interface UpdatePost {
    contentUrl?: string;
    caption?: string;
    updatedAt?: Date;
}