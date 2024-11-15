import express from "express";
import { checkAuthentication } from "../middlewares";
import { parseLocalTsv } from "../utils/tsv";

import { searchImages } from "../views/imageSearch";

import { getGPTResponse, fetchUsersAndEmbedData, fetchPostsAndEmbedData, directUserSearch, directPostSearch } from "../views/llmSearch";
import { getPostById } from "../views/posts";
import { getUserById } from "../views/user";

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

    const documents = new Set<any>(
      results[0].documents[0].map((document: string) =>
        document.replaceAll(".jpg", "")
      )
    );

    const names = await parseLocalTsv("data/names.tsv");

    const filteredNames = names
      .filter((name) => documents.has(name.nconst))
      .map((name) => name.primaryName)
      .reverse();

    return res.status(200).json(filteredNames);
  } catch (error) {
    console.log(JSON.stringify(error));
    console.error("Error during image search: ", error);
    next(error);
  }
});

router.post("/llmsearch", async (req, res, next) => {
  try {
    const query = req.body.query;
    if (!query) {
      return res.status(400).send({ message: "Search query is required" });
    }

    console.log(`Processing search for query: ${query}`);
    const response = await getGPTResponse(query);
    return res.status(200).json(response);
  } catch (error) {
    console.log(JSON.stringify(error));
    console.error("Error during search: ", error);
    next(error);
  }
});

router.post("/upsertUsers", async (req, res, next) => {
  try {
    fetchUsersAndEmbedData(); 
  } catch (error) {
    console.log(JSON.stringify(error));
    console.error("error upserting", error);
    next(error);  
  }
});

router.post("/upsertPosts", async (req, res, next) => {
  try {
    fetchPostsAndEmbedData(); 
  } catch (error) {
    console.log(JSON.stringify(error));
    console.error("error upserting", error);
    next(error);  
  }
});

router.post("/directUserSearch", async (req, res, next) => {
  try {
    const query = req.body.query; 
    const response = await directUserSearch(query);

    const userRequests = response.matches.map(match => {
      const id =  parseInt(match.id);
      
      return getUserById(id);
    })

    const users = await Promise.all(userRequests)

    return res.status(200).json(users.filter(user => user !== undefined));
  } catch (error) {
    console.log(JSON.stringify(error));
    console.error("error fetching user", error);
    next(error);  
  }
});

router.post("/directPostSearch", async (req, res, next) => {
  try {
    const query = req.body.query; 
    const response = await directPostSearch(query);

    const postsRequests = response.matches.map(match => {
      const id =  parseInt(match.id);
      
      return getPostById(id);
    })

    const postSearches = await Promise.all(postsRequests);

    return res.status(200).json(postSearches.filter(post => post !== undefined));
  } catch (error) {
    console.log(JSON.stringify(error));
    console.error("error fetching post", error);
    next(error);  
  }
});

export default router;
