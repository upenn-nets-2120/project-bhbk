import { db } from "../database/setup";
import { posts, postLikes } from "../database/schema";
import { NewPost, UpdatePost } from "../types/post";
import { sql, desc, eq, and } from "drizzle-orm"

export const createPost = async (post: NewPost) => {
    const createdPost = await db.insert(posts).values({
        ...post,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    return createdPost;
};

export const updatePost = async (postId: number, updateData: UpdatePost) => {
    const updatedPost = await db.update(posts)
        .set({
            ...updateData,
            updatedAt: new Date()  
        })
        .where(eq(posts.id, postId));
    return updatedPost;
};

export const deletePost = async (postId: number) => {
    const deletedPost = await db.delete(posts).where(eq(posts.id, postId));
    return deletedPost;
};

export const getPostById = async (postId: number) => {
    const selectedPost = await db.query.posts.findMany({
        where: eq(posts.id, postId)
      });
    return selectedPost;
};

export const getPostByUserId = async (userId: number) => {
    const post = await db.query.posts.findMany({
        where: eq(posts.authorId, userId),
        orderBy: [desc(posts.createdAt)]
    }); 
    if (post.length === 0) {
        throw new Error('User has no posts!');
    }
    return post;
};

export const getPostsByChron = async () => {
    const post = await db.query.posts.findMany({
        orderBy: [desc(posts.createdAt)]
    }); 
    return post;
};

export const getPostsByPopularity = async () => {
    const orderedByLikes = await db.select({ 
        post: postLikes.postId,
        value: sql`count(${postLikes.userId})`.mapWith(Number) 
      }).from(postLikes).groupBy(postLikes.postId).rightJoin(posts, eq(posts.id, postLikes.postId))
      .orderBy(desc(sql`count(${postLikes.userId})`));
    return orderedByLikes;
};

export const getAllPosts = async () => {
    const post = await db.query.posts.findMany(); 
    return post;
  }

export const handleLikePost = async (postId: number, userId: number) => {
    const existingLike = await db.select().from(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId))); 
    
    if (existingLike.length % 2 == 0) {
        const likeAction = await db.insert(postLikes).values({
            postId: postId,
            userId: userId,
            likedAt: new Date()
        });
        return likeAction;
    } else {
        const likeAction = await db.delete(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
        return likeAction;
    }
};

