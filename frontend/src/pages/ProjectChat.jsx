import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getChatByProject, getMessages, sendMessage, getMyChats } from '../services/chatService';
import MessageList from '../components/Chat/MessageList';
import MessageInput from '../components/Chat/MessageInput';
import { PhoneIcon } from '@heroicons/react/24/outline';
import ConversationList from '../components/Chat/ConversationList';

export default function ProjectChat() {
  const { projectId } = useParams();
  const [chat, setChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesRef = useRef();
  const [error, setError] = useState(null);

  const loadChat = async () => {
    try {
      setError(null);
      const c = await getChatByProject(projectId);
      setChat(c);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur lors du chargement du chat de projet');
    }
  }

  // Liste conversations
  const loadChats = async () => {
    try {
      setError(null);
      const res = await getMyChats();
      setChats(res.chats || res);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur lors du chargement des conversations');
    }
  }

  const loadMessages = async (chatId) => {
    try {
      setError(null);
      const res = await getMessages(chatId);
      setMessages(res.messages || res);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur lors du chargement des messages');
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadChat();
      await loadChats();
      setLoading(false);
    })();
  }, [projectId]);

  useEffect(() => {
    if (!chat) return;
    loadMessages(chat._id);
    const interval = setInterval(() => loadMessages(chat._id), 3000);
    return () => clearInterval(interval);
  }, [chat]);

  // Ensure we have a selected chat after loading chats
  useEffect(() => {
    if (!chats || chats.length === 0) return;
    if (!chat) {
      // If projectId is provided, try to find chat for this project
      if (projectId) {
        const found = chats.find(c => (c.projet && c.projet._id === projectId) || c.projet?._id === projectId || c._id === projectId);
        setChat(found || chats[0]);
      } else {
        setChat(chats[0]);
      }
    }
  }, [chats]);

  useEffect(() => {
    // scroll to bottom when messages update
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (contenu) => {
    try {
      await sendMessage(chat._id, contenu);
      await loadMessages(chat._id);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Conversations */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow h-[70vh] overflow-hidden">
          <ConversationList
            selectedChatId={chat?._id}
            onSelectChat={(c) => { setChat(c); }}
          />
        </div>

        {/* Right: Chat window */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 h-[70vh] flex flex-col">
          <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">{(chat?.nom || chat?.projet?.nom || 'G').split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
                <div>
                  <div className="text-lg font-semibold">{chat ? (chat.nom || chat.projet?.nom) : 'Conversation'}</div>
                  <div className="text-xs text-green-500">Online</div>
                </div>
              </div>
              {error && <div className="text-sm text-red-500 mr-4">{error}</div>}
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded-lg bg-white border flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50">
                  <PhoneIcon className="w-4 h-4" /> Call
                </button>
              </div>
            </div>
          <div ref={messagesRef} className="flex-1 overflow-y-auto mb-3">
            {chat ? (
              <MessageList messages={messages} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">Sélectionnez une conversation ou rejoignez un projet pour démarrer un chat.</div>
            )}
          </div>
          <div>
            <MessageInput onSend={chat ? handleSend : () => {}} disabled={!chat} />
          </div>
        </div>
      </div>
    </div>
  );
}
