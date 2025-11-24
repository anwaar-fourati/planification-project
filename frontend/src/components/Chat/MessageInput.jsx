import React, { useState } from 'react';
import { PaperClipIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function MessageInput({ onSend, disabled = false }) {
  const [text, setText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  }

  return (
    <form onSubmit={submit} className="mt-3 flex items-center gap-3">
      <button type="button" className="p-2 rounded-md text-gray-500 hover:text-gray-700">
        <PaperClipIcon className="w-5 h-5" />
      </button>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:outline-none"
        placeholder="Type a message"
        disabled={disabled}
      />
      <button type="submit" disabled={disabled} className={`p-3 ${disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'} text-white rounded-full`}>
        <PaperAirplaneIcon className="w-4 h-4 transform rotate-45" />
      </button>
    </form>
  );
}
