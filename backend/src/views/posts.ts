import { db } from "../database/setup";
import { posts, postLikes } from "../database/schema";
import { NewPost, UpdatePost } from "../types/post";

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
        .where({ id: postId });
    return updatedPost;
};

export const deletePost = async (postId: number) => {
    const deletedPost = await db.delete(posts).where({ id: postId });
    return deletedPost;
};

export const getPostById = async (postId: number) => {
    const post = await db.select(posts).where({ id: postId });
    return post;
};

export const getPostByUserId = async (userId: number) => {
    const post = await db.select(posts).where({ authorId: userId })
                .orderBy('createdAt', 'desc').execute();
    if (post.length === 0) {
        throw new Error('User has no posts!');
    }
    return post;
};

export const getPostsByChron = async () => {
    try {
      const postsChron = await db.select(posts)
                                 .orderBy('createdAt', 'desc')
                                 .execute();
      return res.status(200).json(postsChron);
    } catch (err) {
      console.log('Error getting posts:', err.message);
      res.status(500).json({ message: 'Error getting posts' });
    }
};

export const getPostsByPopularity = async () => {
    try {
      const postsPopularity = await db.select(posts)
                                      .execute();
      const sortedPosts = postsPopularity.sort((a, b) => b.likes.length - a.likes.length);
      return res.status(200).json(sortedPosts);
    } catch (err) {
      console.log('Error getting posts:', err.message);
      res.status(500).json({ message: 'Error getting posts' });
    }
};

export const getAllPosts = async () => {
    try {
      const allPosts = await db.select(posts).execute();
      return res.status(200).json(allPosts);
    } catch (err) {
      console.log('Error getting posts:', err.message);
      res.status(500).json({ message: 'Error getting posts' });
    }
  }

export const handleLikePost = async (postId: number, userId: number) => {
    const existingLike = await db.select(postLikes)
        .where({ postId: postId, userId: userId });
    
    const likeAction = null;
    if (existingLike.length % 2 == 0) {
        likeAction = await db.insert(postLikes).values({
            postId: postId,
            userId: userId,
            likedAt: new Date()
        });
    } else {
        likeAction = await db.delete(postLikes)
        .where({ postId: postId, userId: userId });
    }

    return likeAction;
};