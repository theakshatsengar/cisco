'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HiPaperAirplane } from 'react-icons/hi2';
import type { IconType } from 'react-icons';
import { MemoryManager } from '../utils/memory';
import MemoryDashboard from '../components/memory-dashboard';
import { useRouter } from 'next/navigation';

const errorMessages = [
  "pookie, the server's down rn, we'll talk l8r fr fr",
  "im too exhausted to reply rn, catch u later bestie",
  "my brain's not braining rn, brb",
  "the wifi's being sus, can't reply rn",
  "im literally dying rn, can't even",
  "the server's being extra rn, we'll talk later bestie",
  "im too tired to function rn, catch u later pookie"
];

// For todo list access
function getUserKey(user) {
  return user?.email ? `todo_${user.email}` : 'todo_guest';
}

function getTodoSummary(session) {
  if (typeof window === 'undefined' || !session?.user) return '';
  const userKey = getUserKey(session.user);
  const saved = localStorage.getItem(userKey);
  if (!saved) return '';
  try {
    const parsed = JSON.parse(saved);
    const todos = parsed.todos || [];
    const checked = parsed.checked || {};
    if (!todos.length) return '';
    let summary = 'my todo list:';
    for (const proj of todos) {
      if (!proj.project) continue;
      summary += `\n- project: ${proj.project}`;
      for (const item of proj.items) {
        if (!item) continue;
        const checkedKey = `${proj.project}-${item}`;
        const status = checked[checkedKey] ? 'done' : 'pending';
        summary += `\n  - ${item} [${status}]`;
      }
    }
    return summary;
  } catch {
    return '';
  }
}

// Theme toggle helpers
function setTheme(mode: 'darkmode' | 'lightmode') {
  if (typeof window === 'undefined') return;
  if (mode === 'darkmode') {
    document.documentElement.classList.remove('lightmode');
    document.documentElement.classList.add('darkmode');
    localStorage.setItem('theme', 'darkmode');
  } else {
    document.documentElement.classList.remove('darkmode');
    document.documentElement.classList.add('lightmode');
    localStorage.setItem('theme', 'lightmode');
  }
}

export default function Chat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([
    { sender: 'cisco', text: 'hi, how can i help you?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const router = useRouter();

  // Initialize user memory with session data
  useEffect(() => {
    if (session?.user) {
      MemoryManager.updatePersonal({
        name: session.user.name || undefined,
        preferences: {
          music: [],
          movies: [],
          hobbies: []
        }
      });
    }
  }, [session]);

  const getRandomErrorMessage = () => {
    const randomIndex = Math.floor(Math.random() * errorMessages.length);
    return errorMessages[randomIndex];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Check if the input is "memory" to trigger the dashboard
    if (input.toLowerCase().trim() === 'memory') {
      setIsMemoryOpen(true);
      setInput('');
      return;
    }

    // Theme commands
    if (input.toLowerCase().trim() === 'darkmode') {
      setTheme('darkmode');
      setInput('');
      return;
    }
    if (input.toLowerCase().trim() === 'lightmode') {
      setTheme('lightmode');
      setInput('');
      return;
    }

    // Check if the input is "todo" to navigate to /todo
    if (input.toLowerCase().trim() === 'todo') {
      setInput('');
      router.push('/todo');
      return;
    }

    const userMsg = input.trim().toLowerCase();
    setInput('');
    setLoading(true);

    // Append user message to UI immediately
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);

    try {
      // Update context with new message
      MemoryManager.updateContext({
        lastTopics: [...MemoryManager.getMemory().context.lastTopics, userMsg]
      });

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
          userInfo: MemoryManager.getMemorySummary() + '\n' + getTodoSummary(session)
        }),
      });

      const data = await res.json();
      const botResponse = data.response.toLowerCase();

      // Check for important information to remember
      if (botResponse.includes('remember') || botResponse.includes('important')) {
        MemoryManager.addHighlight(
          'Important Information',
          botResponse,
          'high'
        );
      }

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
      <div className="w-full md:max-w-2xl flex flex-col h-full relative">
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
          {/* Thin dividing line above typing box */}
          <div className="w-full h-px bg-neutral-200 dark:bg-neutral-800" />
          <form onSubmit={handleSubmit} className="p-4 mb-2">
            <div className="flex items-center text-base"> 
              <span className="font-medium mr-2">{session?.user?.name?.toLowerCase()}:</span>
              <textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none border-none focus:outline-none resize-none min-h-[24px] max-h-[120px] py-1 lowercase"
                rows={1}
                autoFocus 
                placeholder="Type your message..."
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
      <MemoryDashboard isOpen={isMemoryOpen} onClose={() => setIsMemoryOpen(false)} />
    </section>
  );
}
