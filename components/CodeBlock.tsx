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
            className={`text-[9px] font-black uppercase tracking-tighter transition-all ${copied ? 'text-green-500' : 'text-gray-400 hover:text-white'}`}
          >
            {copied ? 'LOGGED' : 'EXTRACT_CODE'}
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