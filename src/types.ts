export interface Message {
  sender: "user" | "jervis";
  text: string;
  timestamp: string;
}

export interface LogEntry {
  text: string;
  type: "info" | "success" | "warn" | "error" | "comm";
  timestamp: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  category: "todo" | "shopping";
}

export interface JervisNote {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export interface JervisAlarm {
  id: string;
  time: string; // HH:MM
  label: string;
  active: boolean;
}

export interface AutomationRoutine {
  id: string;
  name: string;
  triggerType: "time" | "location" | "charging" | "bluetooth" | "headphones" | "voice";
  triggerValue: string;
  action: string;
  active: boolean;
}

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: string;
  content?: string;
  parentId: string | null;
  createdAt: string;
}

export interface JervisMemory {
  nickname: string;
  favoriteApp: string;
  tonyGreeting: string;
  userPrefs: {
    theme: "light" | "dark" | "cyber";
    largeText: boolean;
    provider: string;
    wakeWord: string;
    continuousListening: boolean;
    speechLang?: string;
  };
}
