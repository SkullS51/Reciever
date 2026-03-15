import React from 'react';
import { ChatMessage, Role } from '../types';
import CodeBlock from './CodeBlock';

interface MessageBubbleProps {
  message: ChatMessage;
  onSpeak?: () => void;
  onRetry?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSpeak, onRetry }) => {
  const isUser = message.role === Role.USER;

  const renderContent = (content: string) => {
    const parts = [];
    let remaining = content;
    
    while (remaining.length > 0) {
      const codeBlockStart = remaining.indexOf('```');
      
      if (codeBlockStart === -1) {
        parts.push({ type: 'text', content: remaining });
        break;
      }
      
      if (codeBlockStart > 0) {
        parts.push({ type: 'text', content: remaining.substring(0, codeBlockStart) });
      }
      
      remaining = remaining.substring(codeBlockStart);
      const nextCodeBlock = remaining.indexOf('```', 3);
      
      if (nextCodeBlock === -1) {
        parts.push({ type: 'code', content: remaining });
        break;
      } else {
        parts.push({ type: 'code', content: remaining.substring(0, nextCodeBlock + 3) });
        remaining = remaining.substring(nextCodeBlock + 3);
      }
    }
    
    return parts.map((part, index) => {
      if (part.type === 'code') {
        const codeContent = part.content;
        const match = codeContent.match(/^```(\w+)?\n?([\s\S]*?)(```)?$/);
        const language = (match && match[1]) ? match[1] : '';
        const code = (match && match[2]) ? match[2] : codeContent.slice(3);
        
        return <CodeBlock key={index} language={language || 'text'} code={code.trim()} />;
      } else {
        if (!part.content.trim()) return null;
        return (
          <p key={index} className={`whitespace-pre-wrap mb-4 leading-relaxed text-sm font-mono transition-all duration-300 ${!isUser ? 'redacted border-l-2 border-brand-500 pl-4 py-3 hover:text-white' : 'text-gray-500 opacity-80'}`}>
            {part.content}
          </p>
        );
      }
    });
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className="w-full flex flex-col items-start"> {/* Always align model messages to start, user to end implicitly by parent flex */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`text-[9px] font-black uppercase tracking-[0.4em] ${isUser ? 'text-gray-700' : 'text-brand-500 animate-pulse'}`}>
            {isUser ? 'ARCHITECT_SIGNAL' : 'AZRAEL_PROTOCOL'} {/* Updated to AZRAEL_PROTOCOL */}
          </div>
          {!isUser && <div className="h-[1px] w-12 bg-brand-900"></div>}
          {onSpeak && !message.isThinking && (
            <button 
              onClick={onSpeak}
              className="ml-2 p-1 text-brand-500 hover:text-white transition-colors"
              title="SYNTHESIZE_VOICE"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          {onRetry && message.isRetryable && (
            <button 
              onClick={onRetry}
              className="ml-2 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white transition-all"
              title="RETRY_SIGNAL"
            >
              RETRY_SIGNAL
            </button>
          )}
        </div>
        
        <div className="w-full">
           {isUser ? (
             <div className="bg-brand-950/20 border border-brand-900/30 px-6 py-4 text-gray-300 text-sm font-mono tracking-tight max-w-2xl ml-auto">
               {message.content}
             </div>
           ) : (
             <div className="w-full max-w-4xl">
               {renderContent(message.content)}
               {message.isThinking && (
                  <div className="flex items-center gap-3 mt-4 text-brand-600">
                      <div className="h-1 w-6 bg-brand-600 animate-glitch"></div>
                      <span className="text-[9px] font-black uppercase tracking-[0.5em]">EXTRACTING_VOID_DATA...</span>
                  </div>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;