import {
  mysqlTable,
  serial,
  int,
  varchar,
  text,
  date,
  timestamp,
  uniqueIndex,
  boolean,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const users = mysqlTable(
  "users",
  {
    id: int("id").primaryKey().autoincrement(),
    username: varchar("username", { length: 256 }),
    firstName: varchar("firstName", { length: 256 }),
    lastName: varchar("lastName", { length: 256 }),
    email: varchar("email", { length: 256 }),
    hashedPassword: varchar("password", { length: 256 }),
    affiliation: varchar("affiliation", { length: 256 }),
    profileUrl: varchar("profileUrl", { length: 256 }),
    dob: date("dob"),
    isOnline: boolean("isOnline").notNull().default(false),
    linkedActor: varchar("linkedActor", { length: 256 }),
  },
  (users) => ({
    emailIndex: uniqueIndex("email_idx").on(users.email),
  })
);

export const posts = mysqlTable("posts", {
  id: int("id").primaryKey().autoincrement(),
  imageUrl: varchar("imageUrl", { length: 1000 }),
  text: text("text"),
  authorId: int("authorId").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const comments = mysqlTable("comments", {
  id: int("id").primaryKey().autoincrement(),
  postId: int("postId").references(() => posts.id),
  authorId: int("authorId").references(() => users.id),
  content: varchar("content", { length: 2048 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const hashtags = mysqlTable("hashtags", {
  id: int("id").primaryKey().autoincrement(),
  content: varchar("content", { length: 5000 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  count: int("count").default(0).notNull(),
});

export const postLikes = mysqlTable(
  "posts_likes",
  {
    id: int("id").primaryKey().autoincrement(),
    postId: int("postId").references(() => posts.id),
    userId: int("userId").references(() => users.id),
    likedAt: timestamp("likedAt").defaultNow(),
  }
);

export const chats = mysqlTable("chats", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 256 }),
});

export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").primaryKey().autoincrement(),
  chatId: int("chat_id").references(() => chats.id),
  senderId: int("sender_id").references(() => users.id),
  content: text("content"),
  sentAt: timestamp("sentAt").defaultNow(),
});

export const postsToHashtags = mysqlTable(
  "posts_to_hashtags",
  {
    postId: int("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    hashtagId: int("hashtag_id")
      .notNull()
      .references(() => hashtags.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.hashtagId] }),
  })
);

export const userChats = mysqlTable(
  "users_chats",
  {
    userId: int("user_id")
      .notNull()
      .references(() => users.id),
    chatId: int("chat_id")
      .notNull()
      .references(() => chats.id),
    isGroup: boolean("isGroup").notNull().default(false)
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.chatId] }),
  })
);

export const userFriends = mysqlTable(
  "user_friends",
  {
    userId: int("user_id")
      .notNull()
      .references(() => users.id),
    friendId: int("friend_id")
      .notNull()
      .references(() => users.id),
  },
  (t) => {
    return {
      pk: primaryKey(t.userId, t.friendId),
    };
  }
);

export const userHashtags = mysqlTable(
  "user_hashtags",
  {
    userId: int("user_id")
      .notNull()
      .references(() => users.id),
    hashtagId: int("hashtag_id")
      .notNull()
      .references(() => hashtags.id),
  },
  (t) => {
    return {
      pk: primaryKey(t.userId, t.hashtagId),
    };
  }
);

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  postLikes: many(postLikes),
  hashtags: many(userHashtags, {
    fields: [userHashtags.userId],
    references: [users.id],
  }),
  friends: many(userFriends, {
    fields: [userFriends.userId],
    references: [users.id],
  }),
  chats: many(userChats, {
    fields: [userChats.chatId],
    references: [chats.id],
  }),
}));

export const chatsRelations = relations(chats, ({ many }) => ({
  users: many(userChats, {
    fields: [userChats.userId],
    references: [users.id],
  }),
}));

export const userChatsRelations = relations(userChats, ({ one }) => ({
  user: one(users, {
    fields: [userChats.userId],
    references: [users.id],
  }),
  chat: one(chats, {
    fields: [userChats.chatId],
    references: [chats.id],
  }),
}));

export const hashtagsRelations = relations(hashtags, ({ many }) => ({
  posts: many(postsToHashtags, {
    fields: [postsToHashtags.hashtagId],
    references: [hashtags.id],
  }),
  users: many(userHashtags, {
    fields: [userHashtags.hashtagId],
    references: [hashtags.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  hashtags: many(postsToHashtags, {
    fields: [postsToHashtags.postId],
    references: [posts.id],
  }),
  postLikes: many(postLikes),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  posts: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}));

export const likesRelations = relations(postLikes, ({ one }) => ({
  author: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
  posts: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
}));
