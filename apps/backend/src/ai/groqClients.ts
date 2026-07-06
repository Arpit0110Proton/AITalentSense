import Groq from "groq-sdk";

export const groqParse = new Groq({
  apiKey: process.env.GROQ_API_KEY_PARSE,
});

export const groqScore = new Groq({
  apiKey: process.env.GROQ_API_KEY_SCORE,
});

export const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
