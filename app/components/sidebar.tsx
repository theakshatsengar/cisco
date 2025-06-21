'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Home, SquareCheck, Bell, Settings, MessageCircle, CircleUser, Sun, Moon } from 'lucide-react';

function getInitialTheme() {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('theme');
  if (stored) return stored === 'darkmode';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function Sidebar() {
  const [dark, setDark] = useState(false);
  const [themeClass, setThemeClass] = useState('bg-white');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(getInitialTheme());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (dark) {
      document.documentElement.classList.remove('lightmode');
      document.documentElement.classList.add('darkmode');
      localStorage.setItem('theme', 'darkmode');
    } else {
      document.documentElement.classList.remove('darkmode');
      document.documentElement.classList.add('lightmode');
      localStorage.setItem('theme', 'lightmode');
    }
  }, [dark, mounted]);

  useEffect(() => {
    if (!mounted) return;
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
  }, [mounted]);

  // Theme toggle handler
  const handleThemeToggle = useCallback(() => {
    setDark((prev) => !prev);
  }, []);

  if (!mounted) return null;

  return (
    <aside className="hidden md:flex flex-col items-center py-6 px-3 gap-2 fixed left-0 top-0 h-full z-60 transition-colors duration-200 w-16" style={{ background: themeClass }}>
      {/* Vertical dividing line */}
      <div className="absolute top-0 right-0 h-full w-px bg-neutral-200 dark:bg-neutral-800" style={{ zIndex: 70 }} />
      <div>
        {/* Top icon with highlight */}
        <div className="mt-0 mb-12 flex flex-col items-center">
          <Link href="/" aria-label="Home">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-2 cursor-pointer ${themeClass === 'bg-white' ? 'bg-black' : 'bg-white'}`}></div>
          </Link>
          <div className={`flex flex-col gap-12 items-center mt-8 md:mt-16 lg:mt-16 ${themeClass === 'bg-white' ? 'text-black' : 'text-white'}`}>
            {/* Home icon */}
            <Link href="/" aria-label="Home">
              <Home className="w-5 h-5 cursor-pointer" />
            </Link>
            {/* Checklist icon */}
            <Link href="/todo" aria-label="Todo">
              <SquareCheck className="w-5 h-5 cursor-pointer" />
            </Link>
            {/* Notification icon */}
            <button aria-label="Notifications" title="Notifications" className="focus:outline-none">
              <Bell className="w-5 h-5 cursor-pointer" />
            </button>
            {/* Settings icon */}
            <Link href="/settings" aria-label="Settings" title="Settings">
              <Settings className="w-5 h-5 cursor-pointer" />
            </Link>
            {/* Feedback icon */}
            <Link href="/feedback" aria-label="Feedback" title="Feedback">
              <MessageCircle className="w-5 h-5 cursor-pointer" />
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-6 mt-auto mb-4">
        {/* Theme toggle */}
        <button onClick={handleThemeToggle} aria-label="Toggle theme" title="Toggle theme" className="mb-4 p-2 rounded-full transition-colors">
          {dark ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>
        {/* Profile icon at the bottom */}
        <Link href="/profile" aria-label="Profile" className="flex items-center justify-center">
          <CircleUser className="w-5 h-5 cursor-pointer" />
        </Link>
      </div>
    </aside>
  );
} 

