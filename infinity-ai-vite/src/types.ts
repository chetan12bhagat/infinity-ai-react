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
  // Claude
  { id: 'claude-sonnet-4-5',          name: 'Claude Sonnet 4',     sub: 'Smart & fast · Recommended',      dot: 'claude-opt' },
  { id: 'claude-opus-4-5',            name: 'Claude Opus 4.5',     sub: 'Most powerful · Complex tasks',   dot: 'claude-opt' },
  { id: 'claude-haiku-4-5',           name: 'Claude Haiku 4.5',    sub: 'Fastest · Lightweight',           dot: 'claude-opt' },
  // Gemini
  { id: 'gemini-2.0-flash',           name: 'Gemini 2.0 Flash',    sub: 'Fast multimodal · Free tier',     dot: 'gemini-opt' },
  { id: 'gemini-2.5-pro-preview-03-25', name: 'Gemini 2.5 Pro',    sub: 'Most capable Gemini · Free tier', dot: 'gemini-opt' },
  // OpenAI
  { id: 'gpt-4o',                     name: 'GPT-4o',              sub: 'Flagship multimodal · OpenAI',    dot: 'openai-opt' },
  { id: 'gpt-4o-mini',                name: 'GPT-4o Mini',         sub: 'Fast & affordable · OpenAI',      dot: 'openai-opt' },
  { id: 'o1-mini',                    name: 'o1 Mini',             sub: 'Reasoning model · OpenAI',        dot: 'openai-opt' },
  // Groq
  { id: 'llama-3.3-70b-versatile',    name: 'Llama 3.3 70B',       sub: 'Ultra-fast · Groq',               dot: 'groq-opt' },
  { id: 'llama-3.1-8b-instant',       name: 'Llama 3.1 8B',        sub: 'Instant responses · Groq',        dot: 'groq-opt' },
  { id: 'mixtral-8x7b-32768',         name: 'Mixtral 8x7B',        sub: 'Long context 32k · Groq',         dot: 'groq-opt' },
  { id: 'gemma2-9b-it',               name: 'Gemma 2 9B',          sub: 'Google open model · Groq',        dot: 'groq-opt' },
];
