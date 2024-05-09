import { postLikes, postsToHashtags, userFriends, userHashtags } from "../database/schema";
import { db } from "../database/setup"

export const getUserToHashtagEdges = async () => {
    const edges = await db.select().from(userHashtags);

    return edges;
}

export const getUserToUserEdges = async () => {
    const edges = await db.select().from(userFriends);

    return edges;
}

export const getUserToPostEdges = async () => {
    const likes = await db.select().from(postLikes);

    const edges = likes.map(like => ({
        userId: like.userId,
        postId: like.postId
    }))

    return edges;
}

export const getPostToHashtagEdges = async () => {
    const edges = await db.select().from(postsToHashtags);

    return edges;
}