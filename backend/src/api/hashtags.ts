import { desc } from "drizzle-orm";
import express from "express";
import { hashtags, userHashtags } from "../database/schema";
import { db } from "../database/setup";
import { checkAuthentication } from "../middlewares";
import { Hashtag } from "../types/hashtag";
import {
  deleteUserHashtags,
  getUserHashtags,
  updateUserInterests,
  uploadHashtag,
} from "../views/hashtags";
import { getHashtagsByPostId, getPostById } from "../views/posts";

const router = express.Router();

router.post("/:postId/create", checkAuthentication, async (req, res, next) => {
  try {
    const hashtags: string[] = req.body.hashtags;

    const postId = parseInt(req.params.postId);

    if (!postId) {
      throw new Error("Invalid post id");
    }

    const post = await getPostById(postId);

    if (!post) {
      throw new Error("Post does not exist");
    }

    const hashtagsCreation = hashtags.map((hashtag) =>
      uploadHashtag(post.id, hashtag)
    );

    await Promise.all(hashtagsCreation);

    return res.status(200).json("Hashtags updated sucessfully");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/posts/:postId", async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId);

    const hashtags = await getHashtagsByPostId(postId);

    return res.status(200).json(hashtags);
  } catch (error) {
    console.error(error);
    next(error);
  }
})

router.get("/top", checkAuthentication, async (req, res, next) => {
  try {
    const topHashtags = await db
      .select()
      .from(hashtags)
      .orderBy(desc(hashtags.count))
      .limit(20);

    return res.status(200).json(topHashtags);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/interests", checkAuthentication, async (req, res, next) => {
  try {
    const hashtags: Hashtag[] = req.body.hashtags;

    const userId: number = req.session.user.id;

    await deleteUserHashtags(userId);

    const userInterests = hashtags.map((hashtag) =>
      updateUserInterests(userId, hashtag.id)
    );

    await Promise.all(userInterests);

    return res.status(200).json("User's interests updated successfully!");
  } catch (error) {
    console.error(error);
  }
});

router.get("/interests", checkAuthentication, async (req, res, next) => {
  try {
    const userId: number = req.session.user.id;

    const hashtagsFromUser = await getUserHashtags(userId);

    return res.status(200).json(hashtagsFromUser);
  } catch (error) {
    console.error(error);
  }
});

export default router;
