import express from 'express';
import {
    createPost,
    updatePost,
    deletePost,
    getPostById,
    getPostByUserId,
    getPostsByChron,
    getPostsByPopularity,
    getAllPosts,
    handleLikePost
} from '../views/posts';

const router = express.Router();

router.route('/p')
  .get(getAllPosts);

router.route('/p/timeline')
  .get(getPostsByChron);

router.route('/p/pop')
  .get(getPostsByPopularity);

router.route('/p/:id')
  .get(getPostById);

router.route('/p/by/:id')
  .get(getPostsByUser);

export default router;