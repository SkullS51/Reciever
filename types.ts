

import React from 'react';

export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export enum ModelMode {
  Llama3_70B = 'llama-3.1-70b-versatile',   // High-quality text tasks for Groq
  Llama3_8B = 'llama-3.1-8b-instant'  // Basic text tasks, faster response for Groq
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