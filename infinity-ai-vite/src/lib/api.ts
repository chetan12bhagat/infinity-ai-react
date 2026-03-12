import { fetchAuthSession } from 'aws-amplify/auth';

// const API_NAME = 'infinity-ai-api';
const API_URL = import.meta.env.VITE_API_GATEWAY_URL;

async function getAuthHeaders() {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export const api = {
  createChat: async (userId: string, title: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/chats`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId, title })
    });
    return response.json();
  },

  getChats: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/chats`, {
      method: 'GET',
      headers
    });
    return response.json();
  },

  deleteChat: async (chatId: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/chats/${chatId}`, {
      method: 'DELETE',
      headers
    });
    return response.json();
  },

  updateChatTitle: async (chatId: string, title: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/chats/${chatId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ title })
    });
    return response.json();
  },

  saveMessage: async (chatId: string, message: { role: string; content: string }) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(message)
    });
    return response.json();
  },

  getMessages: async (chatId: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
      method: 'GET',
      headers
    });
    return response.json();
  }
};
