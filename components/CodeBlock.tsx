import React, { useState } from 'react';
import { CodeBlockProps } from '../types';
import { saveSnippet } from '../services/storageService';
import PreviewPortal from './PreviewPortal';

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    saveSnippet({ code, language });
    setTimeout(() => setCopied(false), 2000);
  };

  const isPreviewable = ['html', 'jsx', 'tsx', 'javascript', 'typescript', 'xml'].includes(language.toLowerCase()) || 
                      (code.includes('<') && code.includes('>'));

  return (
    <div className="my-6 border border-white/10 bg-black group relative">
      <div className="flex items-center justify-between px-4 py-1.5 bg-white/5 border-b border-white/10">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{language || 'data'}</span>
        <div className="flex items-center gap-4">
          {isPreviewable && (
            <button
              onClick={() => setShowPreview(true)}
              className="text-[9px] font-black text-brand-500 hover:text-white uppercase tracking-tighter transition-all"
            >
              FORGE_PREVIEW
            </button>
          )}
          <button
            onClick={handleCopy}
            className={`text-[9px] font-black uppercase tracking-tighter transition-all flex items-center gap-1.5 ${copied ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            )}
            {copied ? 'LOGGED' : 'COPY_CODE'}
          </button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm text-gray-400 whitespace-pre-wrap max-h-[500px] overflow-y-auto selection:bg-brand-500 selection:text-white">
          <code>{code}</code>
        </pre>
      </div>

      <PreviewPortal 
        code={code} 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)} 
      />
    </div>
  );
};

export default CodeBlock;