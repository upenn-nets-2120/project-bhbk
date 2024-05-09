import express from "express";
import { checkAuthentication } from "../middlewares";
import { NewPost } from "../types/post";
import {
  addCommentToPost,
  createPost,
  getCommentsOfPost,
  getPaginatedPostByChronology,
  getPostsByChronology,
  getUsersByLikedPost,
  likePost,
  unlikePost,
} from "../views/posts";

const router = express.Router();

router.post("/create", checkAuthentication, async (req, res, next) => {
  try {
    const post = req.body;

    const newPost = post satisfies NewPost;

    const userId = req.session.user.id satisfies number;

    const createdPost = await createPost(newPost, userId);

    return res.status(200).json(createdPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/chronology", async (_, res, next) => {
  try {
    const posts = await getPostsByChronology();

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/chronology/paginate", async (req, res, next) => {
  try {
    const page: number = parseInt(req.params.page);

    const pageSize: number = parseInt(req.params.pageSize)

    const posts = await getPaginatedPostByChronology(pageSize, page);

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/like", checkAuthentication, async (req, res, next) => {
  try {
    const postId: number = req.body.postId;

    const userId: number = req.session.user.id;

    await likePost(postId, userId);

    return res.status(200).json("Liked post");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/unlike", checkAuthentication, async (req, res, next) => {
  try {
    const postId: number = req.body.postId;

    const userId: number = req.session.user.id;

    await unlikePost(postId, userId);

    return res.status(200).json("Unliked post");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/:postId/liked-users", async (req, res, next) => {
  try {
    const postId: number = parseInt(req.params.postId);

    const likedUsers = await getUsersByLikedPost(postId);

    return res.status(200).json(likedUsers);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/:postId/comments", async (req, res, next) => {
  try {
    const postId: number = parseInt(req.params.postId);
    const comments = await getCommentsOfPost(postId);

    return res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/:postId/comment", checkAuthentication, async (req, res, next) => {
  try {
    const postId: number = parseInt(req.params.postId);

    const content: string = req.body.content;

    const userId: number = req.session.user.id;

    await addCommentToPost(postId, userId, { content });

    return res.status(200).json("Commented on post");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

export default router;
