'use client';

import { useState, useRef, useEffect } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: 'cisco', text: 'hi, how can i help you?' },
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
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '70vh',
        width: '100%',
      }}
    >
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Edge */
        div::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        /* Hide scrollbar for Firefox */
        div {
          scrollbar-width: none;
        }
      `}</style>

      <div
        ref={scrollRef}
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          flexGrow: 1,
          paddingRight: '0.25rem',
          wordBreak: 'break-word',
        }}
      >
        {messages.map((msg, idx) => {
          const next = messages[idx + 1];
          const isUser = msg.sender === 'user';
          const nextIsCisco = next?.sender === 'cisco';

          return (
            <p
              key={idx}
              style={{ marginBottom: isUser && nextIsCisco ? '0.25rem' : '1.5rem' }}
            >
              <span style={{ fontWeight: 600 }}>{msg.sender}:</span> {msg.text}
            </p>
          );
        })}

        {loading && (
          <p style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontWeight: 600 }}>cisco:</span> typing...
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '0.25rem' }}>
        <p style={{ fontSize: '1rem', margin: 0, whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 600 }}>user:</span>{' '}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              backgroundColor: 'transparent',
              outline: 'none',
              border: 'none',
              fontSize: '1rem',
              width: '60vw',
              display: 'inline',
              verticalAlign: 'middle',
            }}
            autoFocus
          />
        </p>
      </form>
    </section>
  );
}
