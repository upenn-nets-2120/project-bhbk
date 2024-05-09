import express from "express";
import auth from "./auth";
import image from "./image";
import user from "./user";
import posts from "./posts";
import hashtags from "./hashtags";
import search from "./search";
import friends from "./friends";
import graph from "./graph"

const router = express.Router();

router.use("/auth", auth);
router.use("/image", image);
router.use("/user", user);
router.use("/posts", posts);
router.use("/hashtags", hashtags);
router.use("/search", search);
router.use("/friends", friends);
router.use("/graph", graph);

export default router;
