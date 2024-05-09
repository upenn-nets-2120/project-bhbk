import express from "express";
import { checkAuthentication } from "../middlewares";
import { addFriends, getFriends, removeFriends, getFriendRecommendations } from "../views/friends";

const router = express.Router();

router.post("/add", checkAuthentication, async (req, res, next) => {
  try {
    const userId: number = req.session.user.id;

    const friendId: number = req.body.friendId;

    await addFriends(userId, friendId);
    await addFriends(friendId, userId);

    return res.status(200).json("Friendship created successfully");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/remove", checkAuthentication, async (req, res, next) => {
  try {
    const userId: number = req.session.user.id;

    const friendId: number = req.body.friendId;

    await removeFriends(userId, friendId);
    await removeFriends(friendId, userId);

    return res.status(200).json("Friendship deleted!");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/list", checkAuthentication, async (req, res, next) => {
  try {
    const userId: number = req.session.user.id;

    const friends = await getFriends(userId);

    return res.status(200).json(friends);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/friends_rec", checkAuthentication, async (req, res, next) => {
  try {
    const userId: number = req.session.user.id;

    const friends = await getFriendRecommendations(userId);

    return res.status(200).json(friends);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default router;
