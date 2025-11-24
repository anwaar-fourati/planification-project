import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyChats, getMessages } from '../../services/chatService';

export default function ConversationList({ selectedChatId, onSelectChat }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyChats();
      setChats(res.chats || res);
    } catch (err) {
      console.error('Erreur loadChats', err);
      setError(err.message || 'Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  const getPreview = async (chatId) => {
    try {
      const res = await getMessages(chatId);
      const messages = res.messages || res;
      if (messages.length === 0) return { text: '', time: '' };
      const last = messages[messages.length - 1];
      return { text: last.contenu, time: new Date(last.createdAt).toLocaleTimeString() };
    } catch (err) {
      return { text: '', time: '' };
    }
  };

  // Preloading last messages may be a bit heavy; keep minimal for now

  const filtered = chats.filter(c => {
    const name = c.nom || c.projet?.nom || '';
    return name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Messages</h3>
          <button
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-full"
            onClick={() => navigate('/projects')}
          >
            +
          </button>
        </div>
        <div className="mt-3">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search messages"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="overflow-y-auto p-2 flex-1 bg-gray-50">
        {loading && <div className="text-sm text-gray-500">Chargement...</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}

        {!loading && filtered.length === 0 && (
          <div className="text-sm text-gray-500">Aucune conversation trouvée</div>
        )}

        {filtered.map((chat) => (
          <ChatListItem
            key={chat._id}
            chat={chat}
            active={selectedChatId === chat._id}
            onClick={() => onSelectChat(chat)}
          />
        ))}
      </div>
    </div>
  );
}

function ChatListItem({ chat, active, onClick }) {
  const name = chat.nom || chat.projet?.nom || 'Groupe';
  const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('');
  const [preview, setPreview] = useState({ text: '', time: '' });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getMessages(chat._id);
        const messages = res.messages || res;
        if (messages.length > 0) {
          const last = messages[messages.length - 1];
          const time = formatRelativeTime(new Date(last.createdAt));
          if (mounted) setPreview({ text: last.contenu, time });
        }
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false };
  }, [chat._id]);

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-3 py-3 hover:bg-white ${active ? 'bg-white shadow' : ''}`}
    >
      <div className={`${active ? 'pl-2 border-l-4 border-purple-600' : 'pl-2'} w-full flex items-center gap-3`}>
        <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">{initials}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="font-medium truncate">{name}</div>
            <div className="text-xs text-gray-400">{preview.time || '—'}</div>
          </div>
          <div className="text-sm text-gray-500 truncate">{preview.text || 'No messages yet'}</div>
        </div>
        {chat.unread && chat.unread > 0 && (
          <div className="ml-3">
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold leading-none text-white bg-red-500 rounded-full">{chat.unread}</span>
          </div>
        )}
      </div>
    </button>
  );
}
