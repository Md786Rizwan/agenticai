
import { Chunk, Subject, SourceType } from '../types';

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;

/**
 * Splits text into overlapping chunks
 */
export function chunkText(
  text: string, 
  subject: Subject, 
  sourceName: string, 
  sourceType: SourceType, 
  pageNumber?: number, 
  url?: string
): Chunk[] {
  const chunks: Chunk[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const chunkText = text.substring(startIndex, startIndex + CHUNK_SIZE);
    chunks.push({
      id: Math.random().toString(36).substr(2, 9),
      text: chunkText,
      subject,
      sourceName,
      sourceType,
      pageNumber,
      url,
      score: 0
    });
    
    startIndex += (CHUNK_SIZE - CHUNK_OVERLAP);
    if (startIndex >= text.length) break;
  }

  return chunks;
}

/**
 * Simulated Vector Search
 * In a real production environment, this would call FAISS/Chroma/Pinecone.
 * For this client-side demo, we use a basic keyword similarity scoring for demonstration.
 */
export function retrieveRelevantChunks(
  query: string, 
  allChunks: Chunk[], 
  subject: Subject, 
  topK: number = 4
): Chunk[] {
  const subjectChunks = allChunks.filter(c => c.subject === subject);
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 3);

  const scoredChunks = subjectChunks.map(chunk => {
    let score = 0;
    const chunkTextLower = chunk.text.toLowerCase();
    
    queryTerms.forEach(term => {
      if (chunkTextLower.includes(term)) {
        score += 1;
      }
    });

    // Simple normalization for length
    return { ...chunk, score: score / (queryTerms.length || 1) };
  });

  return scoredChunks
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .filter(c => (c.score || 0) > 0)
    .slice(0, topK);
}
