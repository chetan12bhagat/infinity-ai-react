import { useState, useCallback } from 'react';

const CHATS_KEY = 'infinityai_chats';
const MESSAGES_KEY = (chatId: string) => `infinityai_msgs_${chatId}`;

function loadChatsFromStorage(): any[] {
  try { return JSON.parse(localStorage.getItem(CHATS_KEY) || '[]'); } catch { return []; }
}

function saveChatsToStorage(chats: any[]) {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

function loadMessagesFromStorage(chatId: string): any[] {
  try { return JSON.parse(localStorage.getItem(MESSAGES_KEY(chatId)) || '[]'); } catch { return []; }
}

function saveMessagesToStorage(chatId: string, messages: any[]) {
  localStorage.setItem(MESSAGES_KEY(chatId), JSON.stringify(messages));
}

export function useChats(_userId?: string) {
  const [chats, setChats] = useState<any[]>(loadChatsFromStorage);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadChats = useCallback(async () => {
    setChats(loadChatsFromStorage());
  }, []);

  const createNewChat = async (title: string) => {
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const createdAt = new Date().toISOString();
    const newChat = { chatId, title, createdAt };
    const updated = [newChat, ...loadChatsFromStorage()];
    saveChatsToStorage(updated);
    setChats(updated);
    return newChat;
  };

  const loadMessages = async (chatId: string) => {
    setLoading(true);
    const msgs = loadMessagesFromStorage(chatId);
    setMessages(msgs);
    setLoading(false);
  };

  const saveMessage = async (chatId: string, role: string, content: string) => {
    const messageId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const timestamp = new Date().toISOString();
    const newMessage = { messageId, chatId, role, content, timestamp };
    const existing = loadMessagesFromStorage(chatId);
    const updated = [...existing, newMessage];
    saveMessagesToStorage(chatId, updated);
    setMessages(updated);
    return newMessage;
  };

  const deleteChat = async (chatId: string) => {
    localStorage.removeItem(MESSAGES_KEY(chatId));
    const updated = loadChatsFromStorage().filter((c: any) => c.chatId !== chatId);
    saveChatsToStorage(updated);
    setChats(updated);
  };

  const updateTitle = async (chatId: string, title: string) => {
    const updated = loadChatsFromStorage().map((c: any) =>
      c.chatId === chatId ? { ...c, title } : c
    );
    saveChatsToStorage(updated);
    setChats(updated);
  };

  return {
    chats,
    messages,
    loading,
    loadChats,
    createNewChat,
    loadMessages,
    saveMessage,
    deleteChat,
    updateTitle,
    setMessages
  };
}

