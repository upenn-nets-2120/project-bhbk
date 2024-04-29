import express from "express";

import { searchImages } from "../views/imageSearch";

const router = express.Router();

router.post("/imageSearch", async (req, res) => {
  try {
    const imageUrl = req.body.imageUrl;
    if (!imageUrl) {
      return res.status(400).send({ message: "Image URL is required" });
    }

    console.log(`Processing search for image URL: ${imageUrl}`);
    const results = await searchImages(imageUrl);
    res.send({ message: "Search completed successfully", data: results });
  } catch (error) {
    console.error("Error during image search:", error);
    res.status(500).send({ message: "Failed to process image search" });
  }
});

export default router;
