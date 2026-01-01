
import React, { useState, useCallback } from 'react';
import { Subject, AppState, ChatMessage, Chunk, DocumentMetadata } from './types';
import Sidebar from './components/Sidebar';
import ChatContainer from './components/ChatContainer';
import { extractTextFromPDF } from './services/pdfService';
import { chunkText, retrieveRelevantChunks } from './services/ragEngine';
import { generateRAGAnswer } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    chunks: [],
    documents: [],
    selectedSubject: Subject.ML,
    messages: [],
    isIngesting: false,
    queryStats: {
      questionsAsked: 0
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelectSubject = (subject: Subject) => {
    setState(prev => ({ ...prev, selectedSubject: subject }));
  };

  const handleIngestPDF = async (file: File, subject: Subject) => {
    setState(prev => ({ ...prev, isIngesting: true }));
    try {
      const pages = await extractTextFromPDF(file);
      const allNewChunks: Chunk[] = [];
      
      pages.forEach(page => {
        const pageChunks = chunkText(page.text, subject, file.name, 'PDF', page.pageNumber);
        allNewChunks.push(...pageChunks);
      });

      const newDoc: DocumentMetadata = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: 'PDF',
        subject,
        pageCount: pages.length,
        chunkCount: allNewChunks.length,
        uploadedAt: Date.now()
      };

      setState(prev => ({
        ...prev,
        chunks: [...prev.chunks, ...allNewChunks],
        documents: [...prev.documents, newDoc],
        isIngesting: false
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, isIngesting: false }));
      alert("Error ingesting PDF. Please try a different file.");
    }
  };

  const handleIngestURL = async (url: string, subject: Subject) => {
    setState(prev => ({ ...prev, isIngesting: true }));
    try {
      // In a real app, we'd use a proxy or backend scraper. 
      // Here we simulate the ingestion of web content.
      const simulatedWebText = `Content from article at ${url}. Web scraping is the process of extracting data from websites. In the context of ${subject}, this usually involves collecting technical specifications, papers, or documentation. (Simulated data for demonstration).`;
      
      const webChunks = chunkText(simulatedWebText, subject, new URL(url).hostname, 'URL', undefined, url);
      
      const newDoc: DocumentMetadata = {
        id: Math.random().toString(36).substr(2, 9),
        name: new URL(url).hostname,
        type: 'URL',
        subject,
        pageCount: 1,
        chunkCount: webChunks.length,
        uploadedAt: Date.now()
      };

      setState(prev => ({
        ...prev,
        chunks: [...prev.chunks, ...webChunks],
        documents: [...prev.documents, newDoc],
        isIngesting: false
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, isIngesting: false }));
      alert("Invalid URL or scraping blocked.");
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      queryStats: {
        ...prev.queryStats,
        questionsAsked: prev.queryStats.questionsAsked + 1
      }
    }));

    setIsGenerating(true);

    // RAG Pipeline
    const relevantChunks = retrieveRelevantChunks(content, state.chunks, state.selectedSubject);
    const answer = await generateRAGAnswer(content, relevantChunks, state.selectedSubject);

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: answer,
      sources: relevantChunks,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, assistantMsg]
    }));
    setIsGenerating(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        state={state} 
        onSelectSubject={handleSelectSubject}
        onIngestPDF={handleIngestPDF}
        onIngestURL={handleIngestURL}
      />
      <ChatContainer 
        messages={state.messages}
        selectedSubject={state.selectedSubject}
        onSendMessage={handleSendMessage}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default App;
