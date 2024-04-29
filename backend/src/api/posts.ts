import express from 'express';
import { NewPost } from '../types/post';
import {
    createPost
} from '../views/post';

const router = express.Router();


router.post("/create", async (req, res, next) => {
  try {
    const post = req.body;
    
    const newPost = post satisfies NewPost;

    const createdPost = await createPost(newPost);

    return res.status(200).json(createdPost);

  } catch (error) {
    console.error(error);
    next(error)
  }
})

export default router;