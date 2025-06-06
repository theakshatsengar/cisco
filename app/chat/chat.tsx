'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function Chat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([
    { sender: 'cisco', text: 'hi, how can i help you?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name?.split(' ')[0].toLowerCase() || 'user';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    // Append user message to UI immediately
    setMessages((prev) => [...prev, { sender: userName, text: userMsg }]);

    try {
      // Prepare pastMessages for API format
      const pastMessages = messages.map((msg) => ({
        role: msg.sender === userName ? 'user' : 'assistant',
        content: msg.text,
      }));

      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, pastMessages }),
      });

      const data = await res.json();
      const botResponse = data.response;

      setMessages((prev) => [...prev, { sender: 'cisco', text: botResponse }]);
    } catch {
      setMessages((prev) => [...prev, { sender: 'cisco', text: 'Failed to connect to AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] relative">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto mb-0 flex flex-col-reverse"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        <div className="flex flex-col">
          {messages.map((msg, idx) => {
            const next = messages[idx + 1];
            const isUser = msg.sender === userName;
            const nextIsCisco = next?.sender === 'cisco';

            return (
              <p key={idx} className={isUser && nextIsCisco ? 'mb-1' : 'mb-6'}>
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
      </div>

      <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-xl mx-auto px-4 py-4"> 
          <div className="flex items-center text-base"> 
            <span className="font-medium mr-2 ml-2">{userName}:</span>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent outline-none border-none focus:outline-none resize-none min-h-[40px] max-h-32 py-2"
              autoFocus
              placeholder="type your message..."
              aria-label="Chat message input"
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              className="ml-2 p-2 rounded-full text-blue-600 hover:bg-blue-100 disabled:text-gray-400 disabled:hover:bg-transparent transition"
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
