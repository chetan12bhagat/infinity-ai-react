export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export interface ModelOption {
  id: string;
  name: string;
  sub: string;
  dot: 'claude-opt' | 'gemini-opt' | 'openai-opt' | 'groq-opt';
}

export const MODELS: ModelOption[] = [
  // Groq
  { id: 'llama-3.3-70b-versatile',    name: 'Infinity AI V1.0',    sub: 'Ultra-fast · Groq',               dot: 'groq-opt' },
];
