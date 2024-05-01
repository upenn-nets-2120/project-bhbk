import { hashtags } from "../database/schema";

export type Hashtag = typeof hashtags.$inferSelect;
