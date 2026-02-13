import React from 'react';
import { ChatMessage, Role } from '../types';
import CodeBlock from './CodeBlock';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const match = part.match(/^```(\w+)?\n([\s\S]*?)```$/);
        const language = match ? match[1] : '';
        const code = match ? match[2] : part.slice(3, -3);
        
        return <CodeBlock key={index} language={language || 'text'} code={code.trim()} />;
      } else {
        if (!part.trim()) return null;
        return (
          <p key={index} className={`whitespace-pre-wrap mb-4 leading-relaxed text-sm font-mono transition-all duration-300 ${!isUser ? 'redacted border-l-2 border-brand-500 pl-4 py-3 hover:text-white' : 'text-gray-500 opacity-80'}`}>
            {part}
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