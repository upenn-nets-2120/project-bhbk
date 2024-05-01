import express from "express";
import { checkAuthentication } from "../middlewares";
import { parseLocalTsv } from "../utils/tsv";

import { searchImages } from "../views/imageSearch";

const router = express.Router();

router.post("/imageSearch", checkAuthentication, async (req, res, next) => {
  try {
    const imageUrl = req.body.imageUrl;
    if (!imageUrl) {
      return res.status(400).send({ message: "Image URL is required" });
    }

    console.log(`Processing search for image URL: ${imageUrl}`);
    const results = await searchImages(imageUrl);

    if (results.length <= 0 || results[0].documents.length <= 0) {
      return res.status(200).json([]);
    }

    const documents = new Set<any>(results[0].documents[0].map((document: string) => document.replaceAll('.jpg', '')));

    const names = await parseLocalTsv('data/names.tsv');

    const filteredNames = names.filter(name => documents.has(name.nconst)).map(name => name.primaryName).reverse();

    return res.status(200).json(filteredNames);
  } catch (error) {
    console.log(JSON.stringify(error));
    console.error("Error during image search: ", error);
    next(error);
  }
});

export default router;
