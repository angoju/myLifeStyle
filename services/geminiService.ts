import { GoogleGenAI } from "@google/genai";
import { QuoteResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchMotivationalQuote = async (context: 'morning' | 'evening'): Promise<QuoteResponse> => {
  try {
    const modelId = 'gemini-2.5-flash';
    const prompt = context === 'morning' 
      ? 'Give me a short, punchy motivational quote for waking up early and crushing health goals. JSON format: { "quote": "...", "author": "..." }' 
      : 'Give me a calming, reflective quote about rest, recovery, and discipline. JSON format: { "quote": "...", "author": "..." }';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    
    return JSON.parse(text) as QuoteResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      quote: "Discipline is doing what needs to be done, even if you don't want to do it.",
      author: "Anonymous"
    };
  }
};