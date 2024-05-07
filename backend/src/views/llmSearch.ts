import 'dotenv/config';
import { OpenAI } from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

    let results = '';
    try {
        results = await callOpenAI(systemPrompt, prompt, 0.5);
        if (results) {
            results = JSON.parse(results);
        }
    }
    catch (e) {
        console.log(e);
    }

    return JSON.parse(results);
}

export { getGPTResponse };





