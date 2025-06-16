// Types for our memory system
interface UserMemory {
  personal: {
    name?: string;
    birthday?: string;
    preferences?: {
      music?: string[];
      movies?: string[];
      hobbies?: string[];
    };
  };
  reminders: {
    [key: string]: {
      date: string;
      description: string;
      completed: boolean;
    };
  };
  highlights: {
    [key: string]: {
      topic: string;
      summary: string;
      date: string;
      importance: 'high' | 'medium' | 'low';
    };
  };
  context: {
    lastTopics: string[];
    recentInterests: string[];
    emotionalState?: 'happy' | 'sad' | 'neutral' | 'excited';
  };
}

// Initialize memory with default structure
const defaultMemory: UserMemory = {
  personal: {},
  reminders: {},
  highlights: {},
  context: {
    lastTopics: [],
    recentInterests: [],
  },
};

// Memory management functions
export const MemoryManager = {
  // Get memory from localStorage
  getMemory: (): UserMemory => {
    if (typeof window === 'undefined') return defaultMemory;
    const stored = localStorage.getItem('userMemory');
    return stored ? JSON.parse(stored) : defaultMemory;
  },

  // Save memory to localStorage
  saveMemory: (memory: UserMemory) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('userMemory', JSON.stringify(memory));
  },

  // Add a new highlight
  addHighlight: (topic: string, summary: string, importance: 'high' | 'medium' | 'low' = 'medium') => {
    const memory = MemoryManager.getMemory();
    const date = new Date().toISOString();
    
    // Keep only last 20 highlights, remove oldest if needed
    const highlights = Object.entries(memory.highlights)
      .sort(([, a], [, b]) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 19);

    memory.highlights = Object.fromEntries([
      ...highlights,
      [date, { topic, summary, date, importance }]
    ]);

    MemoryManager.saveMemory(memory);
  },

  // Add a reminder
  addReminder: (date: string, description: string) => {
    const memory = MemoryManager.getMemory();
    const id = new Date().toISOString();
    
    memory.reminders[id] = {
      date,
      description,
      completed: false
    };

    MemoryManager.saveMemory(memory);
  },

  // Update personal information
  updatePersonal: (data: Partial<UserMemory['personal']>) => {
    const memory = MemoryManager.getMemory();
    memory.personal = { ...memory.personal, ...data };
    MemoryManager.saveMemory(memory);
  },

  // Update context
  updateContext: (data: Partial<UserMemory['context']>) => {
    const memory = MemoryManager.getMemory();
    memory.context = { ...memory.context, ...data };
    
    // Keep only last 5 topics and interests
    if (memory.context.lastTopics) {
      memory.context.lastTopics = memory.context.lastTopics.slice(-5);
    }
    if (memory.context.recentInterests) {
      memory.context.recentInterests = memory.context.recentInterests.slice(-5);
    }

    MemoryManager.saveMemory(memory);
  },

  // Get memory summary for AI context
  getMemorySummary: (): string => {
    const memory = MemoryManager.getMemory();
    const summary: string[] = [];

    // Add personal info
    if (memory.personal.name) {
      summary.push(`User's name is ${memory.personal.name}`);
    }
    if (memory.personal.birthday) {
      summary.push(`User's birthday is ${memory.personal.birthday}`);
    }

    // Add preferences
    if (memory.personal.preferences) {
      const prefs = memory.personal.preferences;
      if (prefs.music?.length) {
        summary.push(`User's favorite music includes: ${prefs.music.join(', ')}`);
      }
      if (prefs.movies?.length) {
        summary.push(`User's favorite movies include: ${prefs.movies.join(', ')}`);
      }
      if (prefs.hobbies?.length) {
        summary.push(`User's hobbies include: ${prefs.hobbies.join(', ')}`);
      }
    }

    // Add recent highlights
    const recentHighlights = Object.entries(memory.highlights)
      .sort(([, a], [, b]) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .map(([, highlight]) => `${highlight.topic}: ${highlight.summary}`);

    if (recentHighlights.length) {
      summary.push('Recent important topics: ' + recentHighlights.join('; '));
    }

    // Add upcoming reminders
    const upcomingReminders = Object.entries(memory.reminders)
      .filter(([, reminder]) => !reminder.completed && new Date(reminder.date) > new Date())
      .sort(([, a], [, b]) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)
      .map(([, reminder]) => `${reminder.description} (${new Date(reminder.date).toLocaleDateString()})`);

    if (upcomingReminders.length) {
      summary.push('Upcoming reminders: ' + upcomingReminders.join('; '));
    }

    // Add recent context
    if (memory.context.lastTopics.length) {
      summary.push('Recent conversation topics: ' + memory.context.lastTopics.join(', '));
    }
    if (memory.context.recentInterests.length) {
      summary.push('Recent interests: ' + memory.context.recentInterests.join(', '));
    }
    if (memory.context.emotionalState) {
      summary.push(`User's recent emotional state: ${memory.context.emotionalState}`);
    }

    return summary.join('. ');
  }
}; 