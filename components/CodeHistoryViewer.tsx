import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CopiedSnippet } from '../types';
import { getSnippets, clearSnippets } from '../services/storageService';

interface CodeHistoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CodeHistoryViewer: React.FC<CodeHistoryViewerProps> = ({ isOpen, onClose }) => {
  const [snippets, setSnippets] = useState<CopiedSnippet[]>([]);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchSnippets = useCallback(() => {
    setSnippets(getSnippets());
    setActiveIndex(0); // Reset active index on data refresh
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSnippets();
      setCopiedSnippetId(null);
      const timer = setTimeout(() => listRef.current?.focus(), 50); // Focus list for keyboard nav

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          setActiveIndex(prev => (prev + 1) % snippets.length);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setActiveIndex(prev => (prev - 1 + snippets.length) % snippets.length);
        } else if (event.key === 'Enter') {
          event.preventDefault();
          if (snippets.length > 0) {
            handleCopySnippet(snippets[activeIndex]);
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose, fetchSnippets, snippets, activeIndex]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (viewerRef.current && !viewerRef.current.contains(event.target as Node)) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const handleCopySnippet = async (snippet: CopiedSnippet) => {
    await navigator.clipboard.writeText(snippet.code);
    setCopiedSnippetId(snippet.id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleClearAllHistory = () => {
    clearSnippets();
    setSnippets([]);
    setActiveIndex(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        ref={viewerRef}
        className="relative bg-[#0d1117] border border-gray-700 rounded-xl shadow-2xl p-4 w-full max-w-2xl max-h-[80vh] flex flex-col transform scale-95 opacity-0 animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-label="Code History"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
          <h2 className="text-lg font-semibold text-gray-200">Copied Code History</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {snippets.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            No code snippets copied yet.
          </div>
        ) : (
          <ul ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2" tabIndex={-1} role="listbox" aria-label="Copied snippets">
            {snippets.map((snippet, index) => (
              <li
                key={snippet.id}
                className={`mb-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  index === activeIndex ? 'bg-brand-600 border-brand-500 text-white' : 'bg-gray-850 border-gray-700 hover:bg-gray-800 text-gray-300'
                }`}
                onClick={() => handleCopySnippet(snippet)}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
                aria-selected={index === activeIndex}
              >
                <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                  <span className={`px-2 py-0.5 rounded-full font-mono ${index === activeIndex ? 'bg-white text-brand-600' : 'bg-gray-700 text-gray-300'}`}>
                    {snippet.language || 'text'}
                  </span>
                  <span>{new Date(snippet.timestamp).toLocaleString()}</span>
                </div>
                <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap max-h-[100px] text-ellipsis">
                  <code>{snippet.code.substring(0, 200)}{snippet.code.length > 200 ? '...' : ''}</code>
                </pre>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopySnippet(snippet); }}
                  className={`mt-2 py-1 px-3 rounded-md text-xs font-medium flex items-center gap-1 ${
                    copiedSnippetId === snippet.id
                      ? 'bg-green-600 text-white'
                      : (index === activeIndex ? 'bg-white text-brand-600' : 'bg-brand-700 hover:bg-brand-600 text-white')
                  } transition-colors`}
                  aria-label={copiedSnippetId === snippet.id ? "Copied!" : `Copy snippet from ${new Date(snippet.timestamp).toLocaleString()}`}
                >
                  {copiedSnippetId === snippet.id ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {snippets.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-800 flex justify-end">
            <button
              onClick={handleClearAllHistory}
              className="py-2 px-4 rounded-md text-sm text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All History
            </button>
          </div>
        )}
         <div className="mt-4 text-xs text-gray-500 px-3 py-2 border-t border-gray-800 flex justify-between">
          <span>
            <kbd className="kbd">↑</kbd><kbd className="kbd">↓</kbd> to navigate
          </span>
          <span>
            <kbd className="kbd">↵</kbd> to copy
          </span>
          <span>
            <kbd className="kbd">esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default CodeHistoryViewer;