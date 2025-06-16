'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HiPaperAirplane } from 'react-icons/hi2';
import type { IconType } from 'react-icons';

const errorMessages = [
  "pookie, the server's down rn, we'll talk l8r fr fr",
  "im too exhausted to reply rn, catch u later bestie",
  "my brain's not braining rn, brb",
  "the wifi's being sus, can't reply rn",
  "im literally dying rn, can't even",
  "the server's being extra rn, we'll talk later bestie",
  "im too tired to function rn, catch u later pookie"
];

export default function Chat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([
    { sender: 'cisco', text: 'hi, how can i help you?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getRandomErrorMessage = () => {
    const randomIndex = Math.floor(Math.random() * errorMessages.length);
    return errorMessages[randomIndex];
  };

  const getUserInfo = () => {
    if (!session?.user) return '';
    const user = session.user;
    return `
      User Information:
      - Name: ${user.name}
      - Email: ${user.email}
      - Full Name: ${user.given_name} ${user.family_name}
      - Language: ${user.locale}
    `;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim().toLowerCase();
    setInput('');
    setLoading(true);

    // Append user message to UI immediately
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);

    try {
      // Prepare pastMessages for API format
      const pastMessages = messages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg, 
          pastMessages,
          userInfo: getUserInfo()
        }),
      });

      const data = await res.json();
      const botResponse = data.response.toLowerCase();

      setMessages((prev) => [...prev, { sender: 'cisco', text: botResponse }]);
    } catch {
      setMessages((prev) => [...prev, { sender: 'cisco', text: getRandomErrorMessage() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <section className="fixed inset-0 flex flex-col md:items-center md:justify-center pt-16">
      <div className="w-full md:max-w-2xl flex flex-col h-full">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>

          <div className="min-h-full flex flex-col justify-end py-4">
            {messages.map((msg, idx) => {
              const next = messages[idx + 1];
              const isUser = msg.sender === 'user';
              const nextIsCisco = next?.sender === 'cisco';

              return (
                <p key={idx} className={isUser && nextIsCisco ? 'mb-1' : 'mb-6'}>
                  <span className="font-medium">
                    {isUser ? session?.user?.name?.toLowerCase() : 'cisco'}:
                  </span> {msg.text}
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

        <div className="flex-none">
          <div className="w-full">
            <div className="border-t border-neutral-100 dark:border-neutral-800" />
          </div>
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex items-center text-base"> 
              <span className="font-medium mr-2">{session?.user?.name?.toLowerCase()}:</span>
              <textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none border-none focus:outline-none resize-none min-h-[24px] max-h-[120px] py-1 lowercase"
                rows={1}
                autoFocus 
              />
              <button 
                type="submit" 
                className="ml-2 p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                disabled={!input.trim()}
                title="send message"
              >
                {HiPaperAirplane({ className: "w-5 h-5" })}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
