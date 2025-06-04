'use client';

import { useState, useRef, useEffect } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: 'user', text: 'hi' },
    { sender: 'cisco', text: 'hi' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    // Show user message immediately
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);

    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();
      const botResponse = data.response;

      setMessages((prev) => [...prev, { sender: 'cisco', text: botResponse }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'cisco', text: 'Failed to connect to AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.map((msg, idx) => {
          const next = messages[idx + 1];
          const isUser = msg.sender === 'user';
          const nextIsCisco = next?.sender === 'cisco';

          return (
            <p
              key={idx}
              className={isUser && nextIsCisco ? 'mb-1' : 'mb-6'}
            >
              <span className="font-medium">{msg.sender}:</span> {msg.text}
            </p>
          );
        })}

        {loading && (
          <p className="mb-6">
            <span className="font-medium">cisco:</span> typing...
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <p className="text-base">
          <span className="font-medium">user:</span>{' '}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-transparent outline-none border-none focus:outline-none"
            autoFocus
          />
        </p>
      </form>
    </>
  );
}
