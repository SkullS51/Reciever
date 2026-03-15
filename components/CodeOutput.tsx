import React, { useState, useEffect } from 'react';
import hljs from 'highlight.js';

interface CodeOutputProps {
  code: string;
}

const CodeOutput: React.FC<CodeOutputProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');

  // Defensive check: ensure code is a string
  const displayCode = typeof code === 'string' ? code : '[INVALID_CODE_DATA]';

  useEffect(() => {
    if (typeof code === 'string') {
      try {
        // Use hljs.highlight instead of highlightElement to avoid passing DOM elements
        // which can cause circular reference errors in the platform's logger.
        const result = hljs.highlight(code, { language: 'typescript', ignoreIllegals: true });
        setHighlightedCode(result.value);
      } catch (e) {
        console.error("AZRAEL_ERROR: Highlighting failed", e);
        setHighlightedCode(code);
      }
    } else {
      setHighlightedCode('[INVALID_CODE_DATA]');
    }
  }, [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("AZRAEL_ERROR: Failed to copy text to clipboard", errorMessage);
    }
  };

  return (
    <div className="relative bg-gray-950 border border-brand-900/50 rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-3 bg-black border-b border-brand-900/50">
        <span className="text-xs text-gray-600 uppercase tracking-widest">AZRAEL_FORGE // OUTPUT</span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-500 hover:text-brand-400 transition-colors flex items-center gap-1"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
          )}
          {copied ? 'COPIED!' : 'COPY_CODE'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto custom-scrollbar text-sm">
        <code 
          className="language-typescript hljs"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
};

export default CodeOutput;
