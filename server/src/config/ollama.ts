import OpenAI from "openai";

export const ollama = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

export const MODEL = "qwen2.5:0.5b";
