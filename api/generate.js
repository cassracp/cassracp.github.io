// MANTER o código original (que estava certo):
import { Groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export const runtime = 'edge';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function POST(req) {
  const { prompt } = await req.json();
  
  const result = await streamText({
    model: groq('llama3-8b-8192'),
    prompt: prompt,
  });
  
  return result.toAIStreamResponse();
}
