'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

type Todo = {
  project: string;
  items: string[];
};

// Helper to convert numbers to words (1-20 for simplicity)
const numberWords = [
  '', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'
];

function getNextProjectName(existingProjects: string[]): string {
  const base = 'new project';
  if (!existingProjects.includes(base)) return base;
  let idx = 2;
  while (true) {
    const name = `${base} ${numberWords[idx - 1] || idx}`;
    if (!existingProjects.includes(name)) return name;
    idx++;
  }
}

function getUserKey(user) {
  // Use email as unique key, fallback to 'guest'
  return user?.email ? `todo_${user.email}` : 'todo_guest';
}

export default function TodoPage() {
  const { data: session, status } = useSession();
  const userKey = getUserKey(session?.user);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [checked, setChecked] = useState({});
  const [newProject, setNewProject] = useState('');
  const [newTasks, setNewTasks] = useState('');
  const [editingProjectIdx, setEditingProjectIdx] = useState<number|null>(null);
  const [editingTask, setEditingTask] = useState<{projectIdx: number|null, taskIdx: number|null}>({ projectIdx: null, taskIdx: null });
  const [editValue, setEditValue] = useState('');

  // Refs for focusing editable tasks and projects
  const taskRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({});
  const projectRefs = useRef<{ [key: number]: HTMLSpanElement | null }>({});

  // Load from localStorage on mount or user change
  useEffect(() => {
    if (status === 'authenticated') {
      const saved = localStorage.getItem(userKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setChecked(parsed.checked || {});
          setTodos(parsed.todos || []);
        } catch {
          setChecked({});
          setTodos([]);
        }
      } else {
        setChecked({});
        setTodos([]);
      }
    }
  }, [userKey, status]);

  // Save to localStorage on change, filter out blank projects
  useEffect(() => {
    if (status === 'authenticated') {
      const filteredTodos = todos.filter(
        t => t.project.trim() !== '' || t.items.length > 0
      );
      if (filteredTodos.length !== todos.length) {
        setTodos(filteredTodos);
      }
      localStorage.setItem(userKey, JSON.stringify({ checked, todos: filteredTodos }));
    }
  }, [checked, todos, userKey, status]);

  useEffect(() => {
    if (editingTask.projectIdx !== null && editingTask.taskIdx !== null) {
      const key = `${editingTask.projectIdx}-${editingTask.taskIdx}`;
      const ref = taskRefs.current[key];
      if (ref) {
        ref.focus();
        // Move caret to end
        const range = document.createRange();
        range.selectNodeContents(ref);
        range.collapse(false);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    } else if (editingProjectIdx !== null) {
      const ref = projectRefs.current[editingProjectIdx];
      if (ref) {
        ref.focus();
        // Move caret to end
        const range = document.createRange();
        range.selectNodeContents(ref);
        range.collapse(false);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  }, [editingTask, editingProjectIdx]);

  const handleCheck = (key) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDelete = (projectIdx, itemIdx) => {
    setTodos((prev) => {
      const newTodos = prev.map((proj, pIdx) => {
        if (pIdx !== projectIdx) return proj;
        return {
          ...proj,
          items: proj.items.filter((_, iIdx) => iIdx !== itemIdx),
        };
      });
      return newTodos;
    });
    // Also remove checked state for this item
    const project = todos[projectIdx].project;
    const item = todos[projectIdx].items[itemIdx];
    const checkedKey = `${project}-${item}`;
    setChecked((prev) => {
      const newChecked = { ...prev };
      delete newChecked[checkedKey];
      return newChecked;
    });
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    const project = newProject.trim();
    const tasks = newTasks
      .split(/[,\n]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (!project || tasks.length === 0) return;
    setTodos((prev) => [
      ...prev,
      { project, items: tasks },
    ]);
    setNewProject('');
    setNewTasks('');
  };

  // Save project name edit
  const saveProjectEdit = (idx, value) => {
    if (value.trim()) {
      setTodos(prev => prev.map((proj, pIdx) => pIdx === idx ? { ...proj, project: value.trim() } : proj));
    }
    setEditingProjectIdx(null);
    setEditValue('');
  };
  // Save task name edit
  const saveTaskEdit = (projectIdx, taskIdx, value) => {
    if (value.trim()) {
      setTodos(prev => prev.map((proj, pIdx) =>
        pIdx === projectIdx
          ? { ...proj, items: proj.items.map((item, iIdx) => iIdx === taskIdx ? value.trim() : item) }
          : proj
      ));
    }
    setEditingTask({ projectIdx: null, taskIdx: null });
    setEditValue('');
  };

  if (status === 'loading') {
    return <div className="ml-4 mt-8 text-base">Loading...</div>;
  }
  if (status !== 'authenticated') {
    return <div className="ml-4 mt-8 text-base">Please sign in to view your to-do list.</div>;
  }

  return (
    <section className="fixed inset-0 flex flex-col md:items-center md:justify-center pt-16">
      <div className="w-full max-w-2xl mx-auto px-4 flex flex-col h-full overflow-y-auto no-scrollbar pb-8 relative">
        <div className="flex items-center justify-between mt-8 mb-4">
          <h1 className="text-lg font-semibold">{((session?.user?.name || 'your').toLowerCase()) + "'s todo list:"}</h1>
        </div>
        <ul className="space-y-6">
          {todos.map((todo, projectIdx) => (
            <li key={todo.project}>
              <div className="font-medium text-base mb-2 text-left flex items-center justify-between group">
                {editingProjectIdx === projectIdx ? (
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    className={`outline-none border-none bg-transparent text-white text-base min-w-[160px] w-48 cursor-text ${editValue === '' ? 'opacity-60' : ''}`}
                    data-placeholder={editValue === '' ? 'new project name' : ''}
                    ref={el => {
                      projectRefs.current[projectIdx] = el;
                      if (el && el.textContent !== editValue) el.textContent = editValue;
                    }}
                    onBlur={e => {
                      const value = e.currentTarget.textContent || '';
                      setEditValue(value);
                      if (value.trim() === '') {
                        setTodos(prev => prev.filter((_, idx) => idx !== projectIdx));
                        setEditingProjectIdx(null);
                        setEditValue('');
                      } else {
                        setTimeout(() => saveProjectEdit(projectIdx, value), 0);
                      }
                    }}
                    onKeyDown={e => {
                      const el = e.target as HTMLElement;
                      const value = el.textContent || '';
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setEditValue(value);
                        saveProjectEdit(projectIdx, value);
                        // Add a new blank task and focus it
                        setTodos(prev => prev.map((proj, idx) =>
                          idx === projectIdx
                            ? { ...proj, items: proj.items.concat(['']) }
                            : proj
                        ));
                        setTimeout(() => {
                          setEditingTask({ projectIdx, taskIdx: todos[projectIdx].items.length });
                          setEditValue('');
                        }, 0);
                      } else if (e.key === 'Backspace' && value === '') {
                        e.preventDefault();
                        setTodos(prev => prev.filter((_, idx) => idx !== projectIdx));
                        setTimeout(() => {
                          if (projectIdx > 0) {
                            const prevProj = todos[projectIdx - 1];
                            const lastTaskIdx = prevProj.items.length - 1;
                            if (lastTaskIdx >= 0) {
                              setEditingTask({ projectIdx: projectIdx - 1, taskIdx: lastTaskIdx });
                              setEditValue(prevProj.items[lastTaskIdx]);
                            } else {
                              setEditingProjectIdx(projectIdx - 1);
                              setEditValue(prevProj.project);
                            }
                          } else {
                            setEditingProjectIdx(null);
                            setEditValue('');
                          }
                        }, 0);
                      }
                    }}
                    spellCheck={false}
                    style={{ caretColor: 'white' }}
                  >
                    {editValue}
                  </span>
                ) : (
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => { setEditingProjectIdx(projectIdx); setEditValue(todo.project); }}
                  >
                    {todo.project}
                  </span>
                )}
              </div>
              <ul className="ml-4 space-y-2">
                {todo.items.map((item, itemIdx) => {
                  const checkboxId = `${todo.project}-item-${itemIdx}`;
                  const checkedKey = `${todo.project}-${item}`;
                  const isChecked = checked[checkedKey];
                  const isEditing = editingTask.projectIdx === projectIdx && editingTask.taskIdx === itemIdx;
                  return (
                    <li key={itemIdx} className="flex items-center gap-2 text-left group">
                      <input
                        id={checkboxId}
                        type="checkbox"
                        className={`w-5 h-5 rounded border-neutral-400 ${isChecked ? 'accent-white' : 'accent-blue-500'}`}
                        checked={!!isChecked}
                        onChange={() => handleCheck(checkedKey)}
                      />
                      {isEditing ? (
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          className={`outline-none border-none bg-transparent text-white text-base w-32 cursor-text ${isChecked ? 'line-through text-neutral-500' : ''}`}
                          ref={el => {
                            taskRefs.current[`${projectIdx}-${itemIdx}`] = el;
                            if (el && el.textContent !== editValue) el.textContent = editValue;
                          }}
                          onBlur={e => {
                            let value = e.currentTarget.textContent || '';
                            if (value.trim() === '') value = 'new task';
                            setEditValue(value);
                            setTimeout(() => saveTaskEdit(projectIdx, itemIdx, value), 0);
                          }}
                          onKeyDown={e => {
                            const el = e.target as HTMLElement;
                            const value = el.textContent || '';
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              setEditValue(value);
                              saveTaskEdit(projectIdx, itemIdx, value);
                              // Add a new blank task below
                              setTodos(prev => prev.map((proj, pIdx) =>
                                pIdx === projectIdx
                                  ? { ...proj, items: [
                                      ...proj.items.slice(0, itemIdx + 1),
                                      '',
                                      ...proj.items.slice(itemIdx + 1)
                                    ] }
                                  : proj
                              ));
                              // Focus the new blank task for editing
                              setTimeout(() => {
                                setEditingTask({ projectIdx, taskIdx: itemIdx + 1 });
                                setEditValue('');
                              }, 0);
                            } else if (e.key === 'Backspace' && value === '') {
                              e.preventDefault();
                              setTodos(prev => prev.map((proj, pIdx) => {
                                if (pIdx !== projectIdx) return proj;
                                const newItems = proj.items.filter((_, iIdx) => iIdx !== itemIdx);
                                return { ...proj, items: newItems };
                              }));
                              setTimeout(() => {
                                if (itemIdx > 0) {
                                  setEditingTask({ projectIdx, taskIdx: itemIdx - 1 });
                                  setEditValue(todos[projectIdx].items[itemIdx - 1] || '');
                                } else {
                                  setEditingTask({ projectIdx: null, taskIdx: null });
                                  setEditingProjectIdx(projectIdx);
                                  setEditValue(todos[projectIdx].project);
                                }
                              }, 0);
                            }
                          }}
                          spellCheck={false}
                          style={{ caretColor: 'white' }}
                        >
                          {editValue}
                        </span>
                      ) : (
                        <label
                          htmlFor={checkboxId}
                          className={`text-base cursor-pointer select-none transition-colors ${isChecked ? 'line-through text-neutral-500' : ''} ${item === '' ? 'opacity-60 italic' : ''}`}
                          onClick={() => { setEditingTask({ projectIdx, taskIdx: itemIdx }); setEditValue(item); }}
                        >
                          {item === '' ? 'rename task' : item}
                        </label>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
        {/* Floating Add Project Button inside the container */}
        <button
          onClick={() => {
            const existingNames = todos.map(t => t.project.toLowerCase());
            const newName = getNextProjectName(existingNames);
            setTodos(prev => [{ project: newName, items: [] }, ...prev]);
            setTimeout(() => {
              setEditingProjectIdx(0);
              setEditValue(newName);
            }, 0);
          }}
          className="fixed bottom-12 right-12 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 border border-neutral-700 text-white shadow-lg z-50 transition-all duration-150"
          aria-label="Add new project"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>
      <style jsx global>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #aaa;
          pointer-events: none;
        }
      `}</style>
    </section>
  );
}