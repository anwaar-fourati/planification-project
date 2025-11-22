import React, { useState } from 'react';

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  }

  return (
    <form onSubmit={submit} className="mt-3 flex gap-2">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        className="flex-1 px-3 py-2 rounded-lg border"
        placeholder="Écrire un message..."
      />
      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Envoyer</button>
    </form>
  );
}
