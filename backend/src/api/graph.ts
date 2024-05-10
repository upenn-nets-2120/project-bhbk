import express from 'express';
import { getPostToHashtagEdges, getUserToHashtagEdges, getUserToPostEdges, getUserToUserEdges, updatePostRecs, updateUserRecs } from '../views/graph';

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

router.post('/friends', async (req, res, next) => {
    try {
        const recommendations = req.body;

        const processedRecommendations = recommendations.map(rec => {
            const userId = parseInt(rec.user_id)
            const friendRecId = parseInt(rec.friend_rec_id);

            return updateUserRecs(userId, friendRecId, parseFloat(rec.rank.toFixed(5)));
        })

        await Promise.all(processedRecommendations);

        return res.status(200).json("Updated friend recs!")
    } catch (error) {
        console.error(error);
        next(error);
    }
})

router.post('/posts', async (req, res, next) => {
    try {
        const recommendations = req.body;

        const processedRecommendations = recommendations.map(async rec => {
            const userId = parseInt(rec.user_id)
            const postId = parseInt(rec.post_id);

            console.log(rec.rank);

            return updatePostRecs(userId, postId, rec.rank.toFixed(5))
        })

        await Promise.all(processedRecommendations);

        return res.status(200).json("Updated posts recs!")
    } catch (error) {
        console.error(error);
        next(error);
    }
})


export default router;