
import React, { useState } from 'react';
import { 
  Subject, 
  AppState, 
  SourceType 
} from '../types';
import { 
  BookOpen, 
  Upload, 
  Link as LinkIcon, 
  RefreshCcw, 
  Database, 
  Layers, 
  MessageSquare,
  FileText
} from 'lucide-react';

interface SidebarProps {
  state: AppState;
  onSelectSubject: (s: Subject) => void;
  onIngestPDF: (file: File, subject: Subject) => void;
  onIngestURL: (url: string, subject: Subject) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ state, onSelectSubject, onIngestPDF, onIngestURL }) => {
  const [urlInput, setUrlInput] = useState('');
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onIngestPDF(e.target.files[0], state.selectedSubject);
      e.target.value = ''; // Reset
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput) {
      onIngestURL(urlInput, state.selectedSubject);
      setUrlInput('');
    }
  };

  const subjectStats = state.documents.filter(d => d.subject === state.selectedSubject);
  const totalPages = subjectStats.reduce((acc, d) => acc + d.pageCount, 0);
  const totalChunks = state.chunks.filter(c => c.subject === state.selectedSubject).length;

  return (
    <aside className="w-80 bg-white border-r border-slate-200 h-screen overflow-y-auto flex flex-col p-6 space-y-8 sticky top-0">
      <div className="flex items-center space-x-2">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <BookOpen className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Academia AI</h1>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Subject</label>
        <div className="grid grid-cols-1 gap-2">
          {Object.values(Subject).map((subj) => (
            <button
              key={subj}
              onClick={() => onSelectSubject(subj)}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                state.selectedSubject === subj 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-100">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Add Knowledge</label>
        
        <div className="space-y-4">
          <div className="relative">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="pdf-upload"
              disabled={state.isIngesting}
            />
            <label
              htmlFor="pdf-upload"
              className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                state.isIngesting ? 'bg-slate-50 border-slate-200 text-slate-400' : 'border-indigo-100 hover:border-indigo-400 text-indigo-600 bg-indigo-50/30'
              }`}
            >
              <Upload size={18} />
              <span className="text-sm font-medium">Upload PDF Notes</span>
            </label>
          </div>

          <form onSubmit={handleUrlSubmit} className="space-y-2">
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste article URL..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={state.isIngesting}
              />
            </div>
            <button 
              type="submit"
              disabled={state.isIngesting || !urlInput}
              className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-opacity"
            >
              Ingest Web Article
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1"></div>

      <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase">{state.selectedSubject} Stats</h3>
          <RefreshCcw size={14} className="text-slate-400" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-slate-400">
              <FileText size={12} />
              <span className="text-[10px] uppercase font-bold">PDFs</span>
            </div>
            <p className="text-lg font-semibold text-slate-700">{subjectStats.filter(d => d.type === 'PDF').length}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-slate-400">
              <Layers size={12} />
              <span className="text-[10px] uppercase font-bold">Pages</span>
            </div>
            <p className="text-lg font-semibold text-slate-700">{totalPages}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-slate-400">
              <Database size={12} />
              <span className="text-[10px] uppercase font-bold">Chunks</span>
            </div>
            <p className="text-lg font-semibold text-slate-700">{totalChunks}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-slate-400">
              <MessageSquare size={12} />
              <span className="text-[10px] uppercase font-bold">Queries</span>
            </div>
            <p className="text-lg font-semibold text-slate-700">{state.queryStats.questionsAsked}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
