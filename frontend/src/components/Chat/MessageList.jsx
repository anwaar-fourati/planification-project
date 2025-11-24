import React from 'react';

export default function MessageList({ messages }) {
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const userId = currentUser._id;

  return (
    <div className="space-y-3 overflow-y-auto max-h-[60vh] p-3">
      {(!messages || messages.length === 0) && (
        <div className="text-center text-gray-500 mt-4">No messages yet.</div>
      )}
      {messages.map(m => {
        const isMine = m.expediteur && (m.expediteur._id ? m.expediteur._id === userId : m.expediteur === userId);
        return (
          <div key={m._id} className={`flex items-end ${isMine ? 'justify-end' : 'justify-start'}`}>
            {!isMine && (
              <div className="mr-2">
                <div className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">{m.expediteur?.nom?.charAt(0) || 'U'}</div>
              </div>
            )}

            <div className={`max-w-[70%] p-3 rounded-xl ${isMine ? 'bg-indigo-600 text-white rounded-bl-none' : 'bg-gray-100 text-gray-800 rounded-br-none'}`}>
              <div className="text-sm">{m.contenu}</div>
              <div className="text-xs text-gray-400 mt-1 text-right">{new Date(m.createdAt).toLocaleString()}</div>
            </div>
            {isMine && (
              <div className="ml-2">
                <div className="bg-indigo-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs">{(m.expediteur?.nom || currentUser.nom || 'U')[0]}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
