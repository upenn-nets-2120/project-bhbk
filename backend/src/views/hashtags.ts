import { and, eq, sql } from "drizzle-orm";
import { hashtags, postsToHashtags, userHashtags } from "../database/schema";
import { db } from "../database/setup";
import { getPostById } from "./posts";

export const uploadHashtag = async (postId: number, hashtag: string) => {
  const post = await getPostById(postId);

  if (!post) {
    throw new Error("Post does not exist");
  }

  const existingHashtag = await db.query.hashtags.findFirst({
    where: (t) => eq(t.content, hashtag),
  });

  let hashtagId: number | undefined = existingHashtag?.id;

  if (!existingHashtag) {
    const newRows = await db.insert(hashtags).values({
      content: hashtag,
      createdAt: new Date(),
      count: 1,
    });

    if (newRows.length <= 0) {
      throw new Error("Failed to insert hashtag");
    }

    hashtagId = newRows[0].insertId;
  } else {
    await db
      .update(hashtags)
      .set({
        count: existingHashtag.count + 1,
      })
      .where(eq(hashtags.id, existingHashtag.id));
  }

  if (hashtagId) {
    // const existingRelation = await db.query.postsToHashtags.findMany({
    //   where: (t) => eq(t.postId, postId) && eq(t.hashtagId, hashtagId),
    // });

    const existingRelation = await db.execute(sql`SELECT * FROM posts_to_hashtags WHERE post_id = ${postId} AND hashtag_id = ${hashtagId} LIMIT 1`)

    if (!existingRelation[0].affectedRows) {
      await db.insert(postsToHashtags).values({
        postId,
        hashtagId,
      });
    }
  }
};

export const isUserInterestedInHashtag = async (
  userId: number,
  hashtagId: number
) => {
  const existingRows = await db
    .select()
    .from(userHashtags)
    .where(
      and(
        eq(userHashtags.userId, userId),
        eq(userHashtags.hashtagId, hashtagId)
      )
    );

  return existingRows.length >= 1;
};

export const updateUserInterests = async (
  userId: number,
  hashtagId: number
) => {
  const isUserAlreadyInterested = await isUserInterestedInHashtag(
    userId,
    hashtagId
  );

  if (!isUserAlreadyInterested) {
    await db.insert(userHashtags).values({
      userId,
      hashtagId,
    });
  }
};

export const deleteUserHashtags = async (userId: number) => {
  await db.delete(userHashtags).where(eq(userHashtags.userId, userId));
};

export const getHashtagById = async (hashtagId: number) => {
  const hashtag = await db
    .select()
    .from(hashtags)
    .where(eq(hashtags.id, hashtagId));

  return hashtag;
};

export const getUserHashtags = async (userId: number) => {
  const hashtagIds = await db
    .select()
    .from(userHashtags)
    .where(eq(userHashtags.userId, userId));

  const hashtagsRequests = hashtagIds.map(({ hashtagId }) =>
    getHashtagById(hashtagId)
  );

  const hashtagResults = (await Promise.all(hashtagsRequests)).flat();

  return hashtagResults;
};
