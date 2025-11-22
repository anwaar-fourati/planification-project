import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyChats } from '../services/chatService';

export default function Chats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getMyChats();
        setChats(res.chats || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Chargement des messages...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Vos groupes de messages</h2>
      {chats.length === 0 && (
        <div className="text-gray-600">Vous n'êtes membre d'aucun groupe pour le moment.</div>
      )}

      <div className="space-y-3">
        {chats.map(chat => (
          <button key={chat._id} onClick={() => navigate(`/projects/${chat.projet._id}/chat`)} className="w-full text-left p-4 bg-white rounded-lg shadow hover:shadow-md flex items-center justify-between">
            <div>
              <div className="font-semibold">{chat.nom}</div>
              <div className="text-sm text-gray-500">Projet: {chat.projet?.nom}</div>
            </div>
            <div className="text-sm text-gray-400">{chat.membres?.length || 0} membres</div>
          </button>
        ))}
      </div>
    </div>
  );
}
