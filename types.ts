

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
  // Temporary fallback to Mixtral due to recurring Llama 3 model_decommissioned errors.
  // This ensures core functionality while Groq's Llama 3 model names stabilize for the given API key.
  Mixtral_70B = 'mixtral-8x7b-32768',   // High-quality text tasks for Groq (now Mixtral)
  Mixtral_8B = 'mixtral-8x7b-32768'  // Basic text tasks, faster response for Groq (now Mixtral)
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