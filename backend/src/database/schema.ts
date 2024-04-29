import {
  mysqlTable,
  serial,
  int,
  varchar,
  text,
  date,
  timestamp,
  uniqueIndex,
  boolean
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 256 }),
  firstName: varchar('firstName', { length: 256 }),
  lastName: varchar('lastName', { length: 256 }),
  email: varchar('email', { length: 256 }),
  hashedPassword: varchar('password', { length: 256 }),
  affiliation: varchar('affiliation', { length: 256 }),
  profileUrl: varchar('profileUrl', { length: 256 }),
  dob: date('dob'),
  hasOnboarded: boolean('hasOnboarded')
}, (users) => ({
  emailIndex: uniqueIndex('email_idx').on(users.email),
}));

export const posts = mysqlTable('posts', {
  id: int('id').primaryKey().autoincrement(),
  contentUrl: varchar('contentUrl', { length: 2048 }),
  caption: varchar('caption', { length: 280 }),
  authorId: int('authorId').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow()
});

export const comments = mysqlTable('comments', {
  id: int('id').primaryKey().autoincrement(),
  postId: int('postId').references(() => posts.id, { onDelete: 'cascade' }),
  authorId: int('authorId').references(() => users.id, { onDelete: 'cascade' }),
  content: varchar('content', { length: 2048 }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow()
});

export const postLikes = mysqlTable('posts_likes', {
  postId: int('postId').references(() => posts.id, { onDelete: 'cascade' }),
  userId: int('userId').references(() => users.id, { onDelete: 'cascade' }),
  likedAt: timestamp('likedAt').defaultNow()
}, (postLikes) => ({
  primaryKey: ['postId', 'userId']
}));

export const chat = mysqlTable('chat', {
  id: int('id').primaryKey().autoincrement(),
  memberId: int('memberId').references(() => users.id, { onDelete: 'cascade' }),
});

export const chatMessages = mysqlTable('chat_messages', {
  chatId: int('id').references(() => chat.id),
  senderId: int('id').references(() => chat.memberId),
  content: text('content'),
  sentAt: timestamp('sentAt').defaultNow()
})

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  postLikes: many(postLikes)
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  postLikes: many(postLikes)
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