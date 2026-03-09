import { CopiedSnippet } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'codeReceiver_copiedSnippets';
const MAX_SNIPPETS = 50; // Limit the number of snippets to store

export const getSnippets = (): CopiedSnippet[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error retrieving snippets from localStorage:", error);
    return [];
  }
};

// Circular-safe stringify helper
const safeStringify = (obj: any): string => {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return '[Circular]';
      }
      cache.add(value);
    }
    return value;
  });
};

export const saveSnippet = (newSnippet: { code: string; language: string }): void => {
  try {
    // Defensive check: ensure inputs are primitives
    if (typeof newSnippet.code !== 'string' || typeof newSnippet.language !== 'string') {
      console.warn("AZRAEL_STORAGE_REJECTED: Non-string data detected.");
      return;
    }

    const currentSnippets = getSnippets();
    const snippetToAdd: CopiedSnippet = {
      id: uuidv4(),
      code: newSnippet.code,
      language: newSnippet.language,
      timestamp: Date.now(),
    };

    // Add new snippet to the beginning
    const updatedSnippets = [snippetToAdd, ...currentSnippets];

    // Enforce max snippets limit
    const finalSnippets = updatedSnippets.slice(0, MAX_SNIPPETS);

    localStorage.setItem(STORAGE_KEY, safeStringify(finalSnippets));
  } catch (error) {
    console.error("Error saving snippet to localStorage:", error);
  }
};

export const clearSnippets = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing snippets from localStorage:", error);
  }
};