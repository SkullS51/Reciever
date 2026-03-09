

import React from 'react';

// Declare global Window interface augmentation for custom properties
declare global {
  interface Window {
    GROQ_API_KEY?: string;
  }
}

export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export enum ModelMode {
  Llama_70B = 'llama-3.3-70b-versatile',
  Llama_8B = 'llama-3.1-8b-instant',
  Llama3_70B = 'llama3-70b-8192',
  Llama3_8B = 'llama3-8b-8192',
  Gemini_Flash = 'gemini-3-flash-preview',
  Gemini_Pro = 'gemini-3.1-pro-preview'
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
}

export interface CodeBlockProps {
  language: string;
  code: string;
}

export interface CopiedSnippet {
  id: string;
  code: string;
  language: string;
  timestamp: number;
}

export interface Imprint {
  id: string;
  title: string;
  data: string;
  timestamp: number;
  intensity: 'LOW' | 'CRITICAL' | 'VOID';
}

export enum CommandPaletteAction {
  CLEAR_CHAT = 'CLEAR_CHAT',
  RE_RUN_LAST_QUERY = 'RE_RUN_LAST_QUERY',
  OPEN_SETTINGS = 'OPEN_SETTINGS',
  VIEW_CODE_HISTORY = 'VIEW_CODE_HISTORY',
  WORKSPACE_TOGGLE = 'WORKSPACE_TOGGLE',
  TRIGGER_IMPRINT = 'TRIGGER_IMPRINT',
}

export interface CommandPaletteItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: CommandPaletteAction;
}