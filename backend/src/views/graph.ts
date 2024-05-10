import { and, eq } from "drizzle-orm";
import { friendRecommendations, postLikes, postRecommendations, postsToHashtags, userFriends, userHashtags } from "../database/schema";
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

export const updatePostRecs = async (userId: number, postId: number, rank: number) => {
    const existingRelationship = await db.query.postRecommendations.findFirst({
        where: and(eq(postRecommendations.userId, userId), eq(postRecommendations.postId, postId))
    })

    if (existingRelationship) {
        await db.update(postRecommendations).set({
            rank
        }).where(and(eq(postRecommendations.userId, userId), eq(postRecommendations.postId, postId)))
        
        return;
    }

    await db.insert(postRecommendations).values({
        userId,
        postId,
        rank
    })
}

export const updateUserRecs = async (userId: number, friendId: number, rank: number) => {
    const existingRelationship = await db.query.friendRecommendations.findFirst({
        where: and(eq(friendRecommendations.userId, userId), eq(friendRecommendations.friendRecId, friendId))
    })

    if (existingRelationship) {
        await db.update(friendRecommendations).set({
            rank
        }).where(and(eq(friendRecommendations.userId, userId), eq(friendRecommendations.friendRecId, friendId)))
        
        return;
    }

    await db.insert(friendRecommendations).values({
        userId,
        friendRecId: friendId,
        rank
    })
}