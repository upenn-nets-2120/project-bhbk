import express from "express";
import { checkAuthentication } from "../middlewares";
import { NewPost } from "../types/post";
import {
  addCommentToPost,
  createPost,
  getCommentsOfPost,
  getPaginatedPostByChronology,
  getPaginatedPostRecs,
  getPostsByChronology,
  getUsersByLikedPost,
  likePost,
  unlikePost,
} from "../views/posts";
import { pushFedPost, getFedPosts } from "../streams/communication"

const router = express.Router();

router.post("/create", checkAuthentication, async (req, res, next) => {
  try {
    const post = req.body;

    const newPost = post satisfies NewPost;

    const userId = req.session.user.id satisfies number;

    const createdPost = await createPost(newPost, userId);

    pushFedPost(createdPost)

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

    const page: number = parseInt(req.query.page as string);

    const pageSize: number = parseInt(req.query.pageSize as string);

    const paginatedPosts = await getPaginatedPostByChronology(pageSize, page);

    return res.status(200).json(paginatedPosts );
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/blended/paginate", async (req, res, next) => {
  try {

    const page: number = parseInt(req.query.page as string);

    const pageSize: number = parseInt(req.query.pageSize as string);

    const userId: number = req.session.user?.id;

    const paginatedPostsChrono = await getPaginatedPostByChronology(pageSize, page);

    const paginatedPostsRecs = userId ? await getPaginatedPostRecs(pageSize, page, userId) : [];

    const l = Math.min(paginatedPostsChrono.length, paginatedPostsRecs.length);

    const blendedPosts = [].concat(...Array.from({ length: l }, (_, i) => [paginatedPostsChrono[i], paginatedPostsRecs[i]]), paginatedPostsChrono.slice(l), paginatedPostsRecs.slice(l));

    return res.status(200).json(blendedPosts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/recommendations/paginate", async (req, res, next) => {
  try {

    const page: number = parseInt(req.query.page as string);

    const pageSize: number = parseInt(req.query.pageSize as string);

    const userId: number = req.session.user.id;
  
    const paginatedPosts = await getPaginatedPostRecs(pageSize, page, userId);

    return res.status(200).json(paginatedPosts);
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
