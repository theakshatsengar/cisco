'use client';

import { useState, useEffect } from 'react';
import { MemoryManager } from '../utils/memory';

interface MemoryDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MemoryDashboard({ isOpen, onClose }: MemoryDashboardProps) {
  const [memory, setMemory] = useState(MemoryManager.getMemory());
  const [activeTab, setActiveTab] = useState<'personal' | 'highlights' | 'reminders' | 'context'>('personal');

  // Update memory when it changes
  useEffect(() => {
    const handleStorageChange = () => {
      setMemory(MemoryManager.getMemory());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleDelete = (type: keyof typeof memory, key: string) => {
    const newMemory = { ...memory };
    if (type === 'highlights' || type === 'reminders') {
      delete newMemory[type][key];
    }
    MemoryManager.saveMemory(newMemory);
    setMemory(newMemory);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <h2 className="text-sm font-medium tracking-wide uppercase">memory dashboard</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            title="close dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-neutral-200 dark:border-neutral-800">
          {(['personal', 'highlights', 'reminders', 'context'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium tracking-wide ${
                activeTab === tab
                  ? 'border-b-2 border-neutral-900 dark:border-white'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {activeTab === 'personal' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">name</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{memory.personal.name || 'not set'}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">birthday</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{memory.personal.birthday || 'not set'}</p>
              </div>
              {memory.personal.preferences && (
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">preferences</h3>
                  {Object.entries(memory.personal.preferences).map(([key, value]) => (
                    <div key={key} className="mb-1.5">
                      <h4 className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{key}</h4>
                      <p className="text-sm text-neutral-500 dark:text-neutral-500">
                        {Array.isArray(value) ? value.join(', ') : value || 'not set'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'highlights' && (
            <div className="space-y-2">
              {Object.entries(memory.highlights).map(([key, highlight]) => (
                <div key={key} className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{highlight.topic}</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-0.5">{highlight.summary}</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-1">
                        {new Date(highlight.date).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete('highlights', key)}
                      className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors"
                      title="delete highlight"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reminders' && (
            <div className="space-y-2">
              {Object.entries(memory.reminders).map(([key, reminder]) => (
                <div key={key} className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{reminder.description}</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-0.5">
                        {new Date(reminder.date).toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-1">
                        status: {reminder.completed ? 'completed' : 'pending'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete('reminders', key)}
                      className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors"
                      title="delete reminder"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'context' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">recent topics</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {memory.context.lastTopics.join(', ') || 'no recent topics'}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">recent interests</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {memory.context.recentInterests.join(', ') || 'no recent interests'}
                </p>
              </div>
              {memory.context.emotionalState && (
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">emotional state</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {memory.context.emotionalState}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 