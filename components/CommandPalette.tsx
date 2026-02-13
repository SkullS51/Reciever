
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CommandPaletteAction, CommandPaletteItem } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onClearChat: () => void;
  onReRunLastQuery: (prompt: string) => void;
  onViewCodeHistory: () => void;
  onWorkspaceToggle: () => void;
  lastUserPrompt: string | null;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onClearChat,
  onReRunLastQuery,
  onViewCodeHistory,
  onWorkspaceToggle,
  lastUserPrompt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  const allCommands: CommandPaletteItem[] = [
    {
      id: 'toggle-workspace',
      name: 'WORKSPACE: TOGGLE_VIEW',
      icon: <div className="h-4 w-4 border border-gray-400"></div>,
      action: CommandPaletteAction.WORKSPACE_TOGGLE,
    },
    {
      id: 'view-history',
      name: 'DATA: LOG_FETCH',
      icon: <div className="h-4 w-4 border-b-2 border-gray-400"></div>,
      action: CommandPaletteAction.VIEW_CODE_HISTORY,
    },
    {
      id: 'clear',
      name: 'SYSTEM: WIPE_ALL',
      icon: <div className="h-4 w-4 bg-red-900"></div>,
      action: CommandPaletteAction.CLEAR_CHAT,
    }
  ];

  const filteredCommands = allCommands.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const executeCommand = useCallback((command: CommandPaletteItem) => {
    switch (command.action) {
      case CommandPaletteAction.CLEAR_CHAT: onClearChat(); break;
      case CommandPaletteAction.RE_RUN_LAST_QUERY: if (lastUserPrompt) onReRunLastQuery(lastUserPrompt); break;
      case CommandPaletteAction.VIEW_CODE_HISTORY: onViewCodeHistory(); break;
      case CommandPaletteAction.WORKSPACE_TOGGLE: onWorkspaceToggle(); break;
    }
    onClose();
  }, [onClearChat, onReRunLastQuery, onViewCodeHistory, onWorkspaceToggle, lastUserPrompt, onClose]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        else if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(p => (p + 1) % filteredCommands.length); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(p => (p - 1 + filteredCommands.length) % filteredCommands.length); }
        else if (e.key === 'Enter') { e.preventDefault(); if (filteredCommands.length > 0) executeCommand(filteredCommands[activeIndex]); }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, filteredCommands, activeIndex, executeCommand]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div ref={paletteRef} className="bg-[#0a0a0a] border border-gray-800 rounded shadow-2xl p-2 w-full max-w-lg">
        <input
          ref={inputRef}
          type="text"
          placeholder="ENTER_CMD_"
          className="w-full bg-transparent text-white font-mono p-4 outline-none border-b border-gray-900"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <ul className="mt-2">
          {filteredCommands.map((cmd, i) => (
            <li
              key={cmd.id}
              className={`flex items-center gap-4 p-4 cursor-pointer font-mono text-xs tracking-tighter ${i === activeIndex ? 'bg-white text-black' : 'text-gray-500'}`}
              onClick={() => executeCommand(cmd)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {cmd.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;