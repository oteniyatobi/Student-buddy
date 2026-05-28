import OpenAI from "openai";

const ollamaHost = process.env.OLLAMA_HOST ?? "http://localhost:11434";

export const ollama = new OpenAI({
  baseURL: `${ollamaHost}/v1`,
  apiKey: "ollama",
});

export const MODEL = "qwen2.5:3b";
