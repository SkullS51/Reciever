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
    const codeBlockRegex = /```(\w+)?\s*\n?([\s\S]*?)(?:```|$)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before the code block
      if (match.index > lastIndex) {
        const textContent = content.substring(lastIndex, match.index);
        if (textContent.trim()) {
          parts.push(
            <p key={`text-${lastIndex}`} className={`whitespace-pre-wrap mb-4 leading-relaxed text-sm font-mono transition-all duration-300 ${!isUser ? 'redacted border-l-2 border-brand-500 pl-4 py-3 hover:text-white' : 'text-gray-500 opacity-80'}`}>
              {textContent}
            </p>
          );
        }
      }

      // Add the code block
      const language = match[1] || 'text';
      const code = match[2] || '';
      parts.push(<CodeBlock key={`code-${match.index}`} language={language} code={code.trim()} />);

      lastIndex = codeBlockRegex.lastIndex;
    }

    // Add remaining text after the last code block
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      if (remainingText.trim()) {
        parts.push(
          <p key={`text-${lastIndex}`} className={`whitespace-pre-wrap mb-4 leading-relaxed text-sm font-mono transition-all duration-300 ${!isUser ? 'redacted border-l-2 border-brand-500 pl-4 py-3 hover:text-white' : 'text-gray-500 opacity-80'}`}>
            {remainingText}
          </p>
        );
      }
    }

    return parts;
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