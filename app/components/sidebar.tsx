'use client';
import React, { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';

function getInitialTheme() {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('theme');
  if (stored) return stored === 'darkmode';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function Sidebar() {
  const [dark, setDark] = useState(getInitialTheme);
  const [themeClass, setThemeClass] = useState('bg-white');

  // Sync sidebar color with <html> class
  useEffect(() => {
    const updateTheme = () => {
      const html = document.documentElement;
      if (html.classList.contains('darkmode')) {
        setThemeClass('bg-[rgb(17,16,16)]');
      } else {
        setThemeClass('bg-white');
      }
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.remove('lightmode');
      document.documentElement.classList.add('darkmode');
      localStorage.setItem('theme', 'darkmode');
    } else {
      document.documentElement.classList.remove('darkmode');
      document.documentElement.classList.add('lightmode');
      localStorage.setItem('theme', 'lightmode');
    }
  }, [dark]);

  return (
    <aside className="hidden md:flex flex-col items-center py-6 px-3 gap-2 fixed left-0 top-0 h-full z-60 transition-colors duration-200 w-20" style={{ background: themeClass }}>
      <div>
        {/* Top icon with highlight */}
        <div className="mt-6 mb-12 flex flex-col items-center">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-2 ${themeClass === 'bg-white' ? 'bg-black' : 'bg-white'}`}></div>
          <div className={`flex flex-col gap-12 items-center mt-12 ${themeClass === 'bg-white' ? 'text-black' : 'text-white'}`}>
            {/* Home icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className="w-5 h-5" stroke={themeClass === 'bg-white' ? '#000' : '#fff'}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4.5 10.5V21h15V10.5" />
            </svg>
            {/* Checklist icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className="w-5 h-5" stroke={themeClass === 'bg-white' ? '#000' : '#fff'}>
              <rect x="4" y="4" width="16" height="16" rx="4" />
              <path d="M8 12l2 2 4-4" />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-6 mt-auto mb-4">
        {/* Profile icon at the bottom */}
        <button className="flex items-center justify-center" aria-label="Profile">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} className="w-5 h-5" stroke={themeClass === 'bg-white' ? '#000' : '#fff'}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 8-4 8-4s8 0 8 4" />
          </svg>
        </button>
      </div>
    </aside>
  );
} 