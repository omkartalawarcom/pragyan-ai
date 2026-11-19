export type TabType = 'home' | 'chat' | 'voice' | 'pdf' | 'planner' | 'notes' | 'automation' | 'history' | 'settings';

export type AutomationActionType =
  | 'open_youtube'
  | 'open_whatsapp'
  | 'open_camera'
  | 'open_settings'
  | 'adjust_volume'
  | 'scroll_up'
  | 'scroll_down'
  | 'navigate_back'
  | 'set_alarm'
  | 'open_bluetooth'
  | 'open_wifi'
  | 'make_call';

export interface PhoneAutomationCommand {
  type: AutomationActionType;
  title: string;
  description: string;
  requiresConfirmation?: boolean;
  param?: string | number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelUsed?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface StudySessionItem {
  timeSlot: string;
  subject: string;
  topic: string;
  objective: string;
  suggestedTechnique: string;
}

export interface StudyDaySchedule {
  dayNumber: number;
  dayName: string;
  focusSubject: string;
  sessions: StudySessionItem[];
  checkpoints: string[];
}

export interface StudyChecklistTask {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
}

export interface StudyPlan {
  id: string;
  createdAt: number;
  planTitle: string;
  summary: string;
  dailyTargetHours: number;
  motivationalQuote: string;
  studyTips: string[];
  dailySchedule: StudyDaySchedule[];
  checklistTasks: StudyChecklistTask[];
  subjects: string[];
  topics: string;
  examGoal: string;
  rawText?: string;
}

export interface SavedSummary {
  id: string;
  title: string;
  createdAt: number;
  originalNotes: string;
  summaryText: string;
  mode: string;
}

export interface SavedPdfSession {
  id: string;
  fileName: string;
  uploadedAt: number;
  summary?: string;
  qas: { question: string; answer: string; timestamp: number }[];
}

export interface AppSettings {
  theme: 'dark' | 'light';
  voiceRate: number;
  voicePitch: number;
  autoReadVoice: boolean;
  useAndroidFrame: boolean;
}
