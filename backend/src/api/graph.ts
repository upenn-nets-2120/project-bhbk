import express from 'express';
import { getPostToHashtagEdges, getUserToHashtagEdges, getUserToPostEdges, getUserToUserEdges } from '../views/graph';

const router = express.Router();

router.get('/usersToHashtags', async (req, res, next) => {
    try {
        const edges = await getUserToHashtagEdges();

        return res.status(200).json(edges);
    } catch (error) {
        console.error(error);
        next(error);
    }
})

router.get('/usersToUsers', async (req, res, next) => {
    try {
        const edges = await getUserToUserEdges();

        return res.status(200).json(edges);
    } catch (error) {
        console.error(error);
        next(error);
    }
})

router.get('/usersToPosts', async (req, res, next) => {
    try {
        const edges = await getUserToPostEdges();

        return res.status(200).json(edges);
    } catch (error) {
        console.error(error);
        next(error);
    }
})

router.get('/postsToHashtags', async (req, res, next) => {
    try {
        const edges = await getPostToHashtagEdges();

        return res.status(200).json(edges);
    } catch (error) {
        console.error(error);
        next(error);
    }
})


export default router;