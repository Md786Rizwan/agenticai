
import { GoogleGenAI } from "@google/genai";
import { Chunk, Subject } from "../types";

export async function generateRAGAnswer(
  query: string, 
  contextChunks: Chunk[], 
  subject: Subject
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contextString = contextChunks.length > 0 
    ? contextChunks.map((c, i) => `[Source ${i+1}: ${c.sourceName}${c.pageNumber ? `, Page ${c.pageNumber}` : ''}] ${c.text}`).join('\n\n')
    : "No relevant documents found.";

  const systemPrompt = `You are a specialized academic tutor for the subject: ${subject}.
Use the provided context to answer the user's question accurately.
RULES:
1. ONLY use information from the provided context.
2. If the context is insufficient to answer the question, strictly respond with: "I'm not sure from the provided context."
3. Do not use outside knowledge.
4. Keep the tone academic, clear, and concise.
5. If relevant, mention technical terms but explain them simply if they appear in the context.

Context:
${contextString}

Question: ${query}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: systemPrompt,
    });
    return response.text || "Unexpected empty response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating response. Please check your connection or context.";
  }
}
