import { comments } from "../database/schema";

export type NewComment = typeof comments.$inferInsert;
