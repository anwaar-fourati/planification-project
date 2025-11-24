import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyChats, getMessages, sendMessage } from '../services/chatService';
import ConversationList from '../components/Chat/ConversationList';
import MessageList from '../components/Chat/MessageList';
import MessageInput from '../components/Chat/MessageInput';

export default function Chats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const messagesRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getMyChats();
        setChats(res.chats || []);
        // Auto select first
        if (res.chats && res.chats.length > 0) setChat(res.chats[0]);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Erreur lors du chargement des conversations');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!chat) return;
    (async () => {
      try {
        setError(null);
        const res = await getMessages(chat._id);
        setMessages(res.messages || res);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Erreur lors du chargement des messages');
      }
    })();
  }, [chat]);

  if (loading) return <div>Chargement des messages...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow h-[70vh] overflow-hidden">
          <ConversationList selectedChatId={chat?._id} onSelectChat={(c)=>setChat(c)} />
        </div>
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 h-[70vh] flex flex-col">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">{chat ? (chat.nom || chat.projet?.nom) : 'Conversation'}</h2>
          </div>
          <div ref={messagesRef} className="flex-1 overflow-y-auto mb-3">
            {chat ? <MessageList messages={messages} /> : <div className="text-gray-500">Sélectionnez une conversation</div>}
          </div>
          <div>
            <MessageInput onSend={async (content)=>{ if (!chat) return; await sendMessage(chat._id, content); const res = await getMessages(chat._id); setMessages(res.messages||res);} } disabled={!chat} />
          </div>
        </div>
      </div>
    </div>
  );
}
