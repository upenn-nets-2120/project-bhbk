import express from 'express';
import auth from './auth';
import image from './image'
import user from './user';
import posts from './posts'

const router = express.Router();

router.use('/auth', auth);
router.use('/image', image);
router.use('/user', user);
router.use('/posts', posts)

export default router;
