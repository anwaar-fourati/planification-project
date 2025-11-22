import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getChatByProject, getMessages, sendMessage } from '../services/chatService';
import MessageList from '../components/Chat/MessageList';
import MessageInput from '../components/Chat/MessageInput';

export default function ProjectChat() {
  const { projectId } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChat = async () => {
    try {
      const c = await getChatByProject(projectId);
      setChat(c);
    } catch (err) {
      console.error(err);
    }
  }

  const loadMessages = async (chatId) => {
    try {
      const res = await getMessages(chatId);
      setMessages(res.messages || res);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadChat();
      setLoading(false);
    })();
  }, [projectId]);

  useEffect(() => {
    if (!chat) return;
    loadMessages(chat._id);
    const interval = setInterval(() => loadMessages(chat._id), 3000);
    return () => clearInterval(interval);
  }, [chat]);

  const handleSend = async (contenu) => {
    try {
      await sendMessage(chat._id, contenu);
      await loadMessages(chat._id);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div>Chargement...</div>;
  if (!chat) return <div>Aucun chat trouvé pour ce projet.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Chat du projet - {chat.nom}</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <MessageList messages={messages} />
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
