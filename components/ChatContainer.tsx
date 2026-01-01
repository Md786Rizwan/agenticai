
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Subject, Chunk } from '../types';
import { Send, User, Bot, ExternalLink, Info, CheckCircle2 } from 'lucide-react';

interface ChatContainerProps {
  messages: ChatMessage[];
  selectedSubject: Subject;
  onSendMessage: (msg: string) => void;
  isGenerating: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ messages, selectedSubject, onSendMessage, isGenerating }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <main className="flex-1 flex flex-col h-screen bg-slate-50 relative">
      <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <h2 className="font-semibold text-slate-800">Learning Session: <span className="text-indigo-600">{selectedSubject}</span></h2>
        </div>
        <div className="flex items-center text-slate-400 text-sm font-medium">
          <Info size={16} className="mr-2" />
          RAG-Grounded Assistant
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <Bot className="mx-auto text-indigo-600 mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-800">Ready to assist you</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                I'm your subject-aware learning assistant. Upload documents for <span className="font-semibold text-indigo-600">{selectedSubject}</span> in the sidebar, and I'll answer questions using that specific context.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              <button onClick={() => setInput("What are the key concepts?")} className="text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors">"What are the key concepts?"</button>
              <button onClick={() => setInput("Explain the main architecture mentioned.")} className="text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors">"Explain the main architecture mentioned."</button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl flex space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div className="space-y-2">
                <div className={`p-5 rounded-2xl shadow-sm border ${
                  msg.role === 'user' 
                    ? 'bg-white border-slate-200 text-slate-800 rounded-tr-none' 
                    : 'bg-white border-indigo-100 text-slate-800 rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="bg-slate-100/50 rounded-xl p-3 border border-slate-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sources Verified</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center space-x-2 shadow-sm">
                          <span className="bg-indigo-50 text-indigo-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {source.sourceType === 'PDF' ? `PAGE ${source.pageNumber}` : 'WEB'}
                          </span>
                          <span className="text-[11px] font-medium text-slate-600 max-w-[120px] truncate">
                            {source.sourceName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {(source.score! * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="flex space-x-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center animate-pulse">
                <Bot size={20} />
              </div>
              <div className="p-5 rounded-2xl bg-white border border-indigo-100 shadow-sm flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-slate-400 font-medium">Consulting Knowledge Base...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 pt-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center space-x-4">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask anything about ${selectedSubject}...`}
              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 pr-14 shadow-xl shadow-slate-200/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 transition-all shadow-lg shadow-indigo-200"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
          Academia AI is grounded in your documents. It will not hallucinate outside the provided context.
        </p>
      </div>
    </main>
  );
};

export default ChatContainer;
