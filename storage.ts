import { ChatSession, StudyPlan, SavedSummary, SavedPdfSession, AppSettings } from '../types';

const CHAT_STORAGE_KEY = 'pragyan_chat_sessions_v1';
const PLANNER_STORAGE_KEY = 'pragyan_study_plans_v1';
const NOTES_STORAGE_KEY = 'pragyan_notes_summaries_v1';
const PDF_STORAGE_KEY = 'pragyan_pdf_sessions_v1';
const SETTINGS_STORAGE_KEY = 'pragyan_app_settings_v1';

export const defaultSettings: AppSettings = {
  theme: 'dark',
  voiceRate: 1.0,
  voicePitch: 1.0,
  autoReadVoice: true,
  useAndroidFrame: false,
};

// Chat Sessions
export function getSavedChatSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load chat sessions:', e);
    return [];
  }
}

export function saveChatSession(session: ChatSession): void {
  try {
    const sessions = getSavedChatSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save chat session:', e);
  }
}

export function deleteChatSession(id: string): void {
  try {
    const sessions = getSavedChatSessions().filter((s) => s.id !== id);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to delete chat session:', e);
  }
}

export function clearAllChats(): void {
  localStorage.removeItem(CHAT_STORAGE_KEY);
}

// Study Plans
export function getSavedStudyPlans(): StudyPlan[] {
  try {
    const raw = localStorage.getItem(PLANNER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load study plans:', e);
    return [];
  }
}

export function saveStudyPlan(plan: StudyPlan): void {
  try {
    const plans = getSavedStudyPlans();
    const index = plans.findIndex((p) => p.id === plan.id);
    if (index >= 0) {
      plans[index] = plan;
    } else {
      plans.unshift(plan);
    }
    localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to save study plan:', e);
  }
}

export function deleteStudyPlan(id: string): void {
  try {
    const plans = getSavedStudyPlans().filter((p) => p.id !== id);
    localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to delete study plan:', e);
  }
}

// Notes Summaries
export function getSavedSummaries(): SavedSummary[] {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load summaries:', e);
    return [];
  }
}

export function saveSummary(summary: SavedSummary): void {
  try {
    const list = getSavedSummaries();
    const index = list.findIndex((s) => s.id === summary.id);
    if (index >= 0) {
      list[index] = summary;
    } else {
      list.unshift(summary);
    }
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save summary:', e);
  }
}

export function deleteSummary(id: string): void {
  try {
    const list = getSavedSummaries().filter((s) => s.id !== id);
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to delete summary:', e);
  }
}

// PDF Sessions
export function getSavedPdfSessions(): SavedPdfSession[] {
  try {
    const raw = localStorage.getItem(PDF_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load pdf sessions:', e);
    return [];
  }
}

export function savePdfSession(session: SavedPdfSession): void {
  try {
    const list = getSavedPdfSessions();
    const index = list.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      list[index] = session;
    } else {
      list.unshift(session);
    }
    localStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save pdf session:', e);
  }
}

// Settings
export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch (e) {
    return defaultSettings;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save app settings:', e);
  }
}
