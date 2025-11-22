import { getToken } from './authService';

const API_URL = 'http://localhost:5000/api';

export const getChatByProject = async (projectId) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/chats/project/${projectId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur récupération chat');
  return data;
}

export const getMyChats = async () => {
  const token = getToken();
  const res = await fetch(`${API_URL}/chats/me`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur récupération mes chats');
  return data;
}

export const getMessages = async (chatId) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/messages/${chatId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur récupération messages');
  return data;
}

export const sendMessage = async (chatId, contenu) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/messages/${chatId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ contenu })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur envoi message');
  return data;
}
