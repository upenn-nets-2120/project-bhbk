import express from 'express';
import auth from './auth';
import image from './image'
import user from './user';

const router = express.Router();

router.use('/auth', auth);
router.use('/image', image);
router.use('/user', user);

export default router;
