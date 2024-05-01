import { db } from "../database/setup";
import { posts, postLikes } from "../database/schema";
import { NewPost, UpdatePost } from "../types/post";
import { sql, desc, eq, and } from "drizzle-orm";

export const createPost = async (post: NewPost, authorId: number) => {
  const newPost: NewPost = {
    ...post,
    authorId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const newRows = await db.insert(posts).values(newPost);

  if (newRows.length <= 0) {
    throw new Error("Failed to create new post");
  }

  const newRowId = newRows[0].insertId;

  newPost.id = newRowId;

  return newPost;
};

export const updatePostById = async (
  postId: number,
  updateData: Partial<NewPost>
) => {
  const updatedPost = await db
    .update(posts)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));
  return updatedPost;
};

export const deletePost = async (postId: number) => {
  const deletedPost = await db.delete(posts).where(eq(posts.id, postId));
  return deletedPost;
};

export const getPostById = async (postId: number) => {
  const selectedPost = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });
  return selectedPost;
};

export const getPostByUserId = async (userId: number) => {
  const post = await db.query.posts.findMany({
    where: eq(posts.authorId, userId),
    orderBy: [desc(posts.createdAt)],
  });
  if (post.length === 0) {
    throw new Error("User has no posts!");
  }
  return post;
};

export const getPostsByChronology = async () => {
  const post = await db.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
    with: {
      author: {
        columns: {
          id: true,
          username: true,
          profileUrl: true,
          affiliation: true,
          linkedActor: true,
        },
      },
    },
  });
  return post;
};

export const getPostsByPopularity = async () => {
  const orderedByLikes = await db
    .select({
      post: postLikes.postId,
      value: sql`count(${postLikes.userId})`.mapWith(Number),
    })
    .from(postLikes)
    .groupBy(postLikes.postId)
    .rightJoin(posts, eq(posts.id, postLikes.postId))
    .orderBy(desc(sql`count(${postLikes.userId})`));
  return orderedByLikes;
};

export const getAllPosts = async () => {
  const post = await db.query.posts.findMany();
  return post;
};

export const handleLikePost = async (postId: number, userId: number) => {
  const existingLike = await db
    .select()
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));

  if (existingLike.length % 2 == 0) {
    const likeAction = await db.insert(postLikes).values({
      postId: postId,
      userId: userId,
      likedAt: new Date(),
    });
    return likeAction;
  } else {
    const likeAction = await db
      .delete(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
    return likeAction;
  }
};
