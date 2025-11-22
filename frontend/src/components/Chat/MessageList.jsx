import React from 'react';

export default function MessageList({ messages }) {
  return (
    <div className="space-y-3 overflow-y-auto max-h-80 p-2">
      {messages.map(m => (
        <div key={m._id} className="flex items-start gap-3">
          <div className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">{m.expediteur?.nom?.charAt(0) || 'U'}</div>
          <div>
            <div className="text-sm font-medium">{m.expediteur?.nom} {m.expediteur?.prenom}</div>
            <div className="text-gray-700">{m.contenu}</div>
            <div className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
