import express from "express";
import { checkAuthentication } from "../middlewares";
import { NewPost } from "../types/post";
import { createPost, getPostsByChronology } from "../views/posts";

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

export default router;
