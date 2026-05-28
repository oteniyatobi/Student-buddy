import OpenAI from "openai";

export const ollama = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY ?? "",
});

export const MODEL = "llama-3.1-8b-instant";
