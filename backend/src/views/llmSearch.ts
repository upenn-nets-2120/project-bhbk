import 'dotenv/config';
import { OpenAI } from 'openai';
import { getEveryUser } from "../views/user";
import { getAllPosts } from "../views/posts";
import { Pinecone } from '@pinecone-database/pinecone';


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY }); // Assuming this is the correct constructor

const pc = new Pinecone({
  apiKey: 'd195f01b-00f8-44ea-bf5e-db51f70f1ce4'
});

const generalinfo = pc.Index('generalinfo');
const postinfo = pc.Index('postinfo');


// Define interfaces for user data and embeddings
interface User {
    id: number;
    username: string | null;
    profileUrl: string | null;
    linkedActor: string | null;
    affiliation: string | null;
    isOnline: boolean;
  }

interface Post {
    id: number | undefined;
    imageUrl: string | null | undefined;
    text: string | null | undefined;
    authorId: number | null | undefined;
    createdAt: Date | null | undefined;
    updatedAt: Date | null | undefined;
}


interface Vector {
data: number[]; 
}

// Function to upsert embeddings to Pinecone
const upsertToPinecone = async (data: { id: string; values: number[] }[]) => {
    try {
        const response = await generalinfo.upsert(data);
        console.log('Upsert successful:', response);
    } catch (error) {
        console.error('Error upserting to Pinecone:', error);
    }
};

// Function to get embeddings for post data and upsert to Pinecone
async function embedAndUpsertPosts(posts: Post[]) {
    // Prepare data by using the text field and optionally including the image URL
    const texts = posts.map(post => `${post.text || ''} ${post.imageUrl ? `Image available at ${post.imageUrl}.` : ''}`);

    try {
        const embeddingsResponses = await Promise.all(texts.map(text =>
            openai.embeddings.create({
                model: "text-embedding-3-small",
                input: text
            })
        ));

        // Handle embeddings and prepare data for upserting
        const dataToUpsert = embeddingsResponses.map((response, index) => ({
            id: posts[index].id?.toString() ?? 'undefined', // Safely convert ID to string, handle undefined with fallback
            values: response.data[0].embedding
        }));

        // Assuming postinfo is correctly configured for upserting
        await postinfo.upsert(dataToUpsert);
    } catch (error) {
        console.error('Failed to get embeddings for posts:', error);
        throw error;
    }
}

async function fetchPostsAndEmbedData() {
    try {
        const posts: Post[] = await getAllPosts(); // Fetch posts from the database
        if (posts.length > 0) {
            await embedAndUpsertPosts(posts); // Embed post data and upsert into Pinecone
            console.log("Post data embedded and upserted successfully.");
        } else {
            console.log("No posts found to process.");
        }
    } catch (error) {
        console.error("Error in processing posts:", error);
    }
}

// Function to get embeddings for user data and upsert to Pinecone
async function embedAndUpsertUsers(users: User[]) {
    const texts = users.map(user => `${user.username} ${user.affiliation || ''}`); // Prepare data

    try {
        const embeddingsResponses = await Promise.all(texts.map(text =>
            openai.embeddings.create({
                model: "text-embedding-3-small",
                input: text
            })
        ));

        const vectors = embeddingsResponses.map(response => response.data[0].embedding);

        const dataToUpsert = vectors.map((vector, index) => ({
            id: users[index].id.toString(),
            values: vector
        }));

        await upsertToPinecone(dataToUpsert);
    } catch (error) {
        console.error('Failed to get embeddings:', error);
        throw error;
    }
}


async function fetchUsersAndEmbedData() {
    try {
        const users: User[] = await getEveryUser(); // Fetch users from the database
        if (users.length > 0) {
            await embedAndUpsertUsers(users); // Embed user data and upsert into Pinecone
            console.log("Data embedded and upserted successfully.");
        } else {
            console.log("No users found to process.");
        }
    } catch (error) {
        console.error("Error in processing users:", error);
    }
}

function checkRequiredEnvVars(requiredEnvVars: string[]) {
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing ${envVar} in environment variables.`);
        }
    }
}

function extractJson(content: string) {
    const regex = /\{(?:[^{}]|{[^{}]*})*\}/g;
    const match = content.match(regex);

    if (match) {
        return match[0].replace(/"([^"]*)"/g, (match) => match.replace(/\n/g, "\\n"));
    } else {
        return '';
    }
}


async function getOpenAICompletion(systemPrompt: string, userPrompt: string, temperature = 0): Promise<string> {
    await checkRequiredEnvVars(['OPENAI_API_KEY']);

    try {
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            max_tokens: 1024,
            temperature,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        });

        let content = completion.choices[0]?.message?.content?.trim() ?? '';
        console.log('OpenAI Output: \n', content);
        if (content && content.includes('{') && content.includes('}')) {
            content = extractJson(content);
        }
        return content;
    }
    catch (e) {
        console.error('Error getting data:', e);
        throw e;
    }
}

function callOpenAI(systemPrompt: string, userPrompt: string, temperature = 0, useBYOD = false) {
    return getOpenAICompletion(systemPrompt, userPrompt, temperature);
}


async function getGPTResponse(prompt: string) {
    console.log('Inputs:', prompt);

    const systemPrompt = `
      Assistant is a bot designed to answer general queries that users ask within an 'Instagram' like
      social media platform. The bot is designed to provide information about users, posts, and comments. 
      The bot can also answer general knowledge questions as well. 
    `;

    const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: prompt
    });

    const promptVector = embeddingResponse.data[0].embedding;

    // Query Pinecone with the generated vector
    const queryOptions = { vector: promptVector, topK: 5 };
    const userResults = await generalinfo.query(queryOptions);
    const postResults = await postinfo.query(queryOptions);

    console.log('User Results:', userResults);
    console.log('Post Results:', postResults);

    // You might want to combine or process these results in some way before or after calling OpenAI
    const combinedResults = { userResults: userResults, postResults: postResults };

    // Optional: Enhance the prompt with data from Pinecone before sending to OpenAI
    const enhancedPrompt = `${systemPrompt} Here are some user details: ${JSON.stringify(combinedResults.userResults)} and post details: ${JSON.stringify(combinedResults.postResults)}. What else can I help with?`;

    let results = '';
    try {
        results = await callOpenAI(enhancedPrompt, prompt, 0.5);
        if (results) {
            results = JSON.parse(results);
        }
    } catch (e) {
        console.error(e);
    }

    return results;
}

async function directUserSearch(prompt: string) {
    const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: prompt
    });

    const promptVector = embeddingResponse.data[0].embedding;

    // Query Pinecone with the generated vector
    const queryOptions = { vector: promptVector, topK: 5 };
    const userResults = await generalinfo.query(queryOptions);

    return userResults;
}

async function directPostSearch(prompt: string) {
    const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: prompt
    });

    const promptVector = embeddingResponse.data[0].embedding;

    // Query Pinecone with the generated vector
    const queryOptions = { vector: promptVector, topK: 5 };
    const postResults = await postinfo.query(queryOptions);

    return postResults;
}


export { getGPTResponse, fetchUsersAndEmbedData, fetchPostsAndEmbedData, directUserSearch, directPostSearch };





