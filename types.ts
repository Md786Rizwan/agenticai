
export enum Subject {
  DBMS = 'DBMS',
  ML = 'Machine Learning',
  DL = 'Deep Learning',
  NLP = 'Natural Language Processing',
  DS = 'Data Structures'
}

export type SourceType = 'PDF' | 'URL';

export interface Chunk {
  id: string;
  text: string;
  subject: Subject;
  sourceName: string;
  sourceType: SourceType;
  pageNumber?: number;
  url?: string;
  score?: number; // Similarity score
}

export interface DocumentMetadata {
  id: string;
  name: string;
  type: SourceType;
  subject: Subject;
  pageCount: number;
  chunkCount: number;
  uploadedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Chunk[];
  timestamp: number;
}

export interface AppState {
  chunks: Chunk[];
  documents: DocumentMetadata[];
  selectedSubject: Subject;
  messages: ChatMessage[];
  isIngesting: boolean;
  queryStats: {
    questionsAsked: number;
  };
}
