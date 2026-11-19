/**
 * Pragyan AI API Client Service
 * Connects securely to the Express backend proxying Gemini AI free tier models.
 */

export interface SystemStatus {
  status: string;
  appName: string;
  version: string;
  provider: string;
  primaryModel: string;
  fallbackModel: string;
  isConfigured: boolean;
  freeTierNotice: string;
}

export async function fetchSystemStatus(): Promise<SystemStatus> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Status endpoint unavailable');
    return await res.json();
  } catch (error: any) {
    return {
      status: 'offline',
      appName: 'Pragyan AI',
      version: '1.0.0',
      provider: 'Google Gemini (Free Tier)',
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
      isConfigured: false,
      freeTierNotice: 'Local fallback mode active.',
    };
  }
}

export async function sendChatMessage(messages: { role: string; content: string }[]): Promise<{ reply: string; modelUsed?: string }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to get AI response. Please try again.');
  }

  return { reply: data.reply, modelUsed: data.modelUsed };
}

export async function processVoiceQuestion(spokenText: string): Promise<{
  text: string;
  spokenSpeech: string;
  modelUsed?: string;
  automationAction?: string | null;
  automationParam?: string | null;
}> {
  const res = await fetch('/api/voice/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spokenText }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Voice query failed. Please check your mic and try again.');
  }

  return {
    text: data.text,
    spokenSpeech: data.spokenSpeech,
    modelUsed: data.modelUsed,
    automationAction: data.automationAction,
    automationParam: data.automationParam,
  };
}

export async function analyzePdfDocument(params: {
  pdfBase64?: string;
  textContent?: string;
  fileName: string;
  action: 'summarize' | 'ask' | 'explain_simple' | 'key_takeaways';
  question?: string;
}): Promise<{ analysis: string; modelUsed?: string }> {
  const res = await fetch('/api/pdf/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'PDF analysis failed. Please verify the document format.');
  }

  return { analysis: data.analysis, modelUsed: data.modelUsed };
}

export async function generateStudyTimetable(params: {
  subjects: string[];
  topics: string;
  availableHoursPerDay: number;
  examGoal?: string;
  durationDays?: number;
}): Promise<{ plan: any; rawText?: string; modelUsed?: string }> {
  const res = await fetch('/api/study-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Study planner generation failed.');
  }

  return { plan: data.plan, rawText: data.rawText, modelUsed: data.modelUsed };
}

export async function summarizeNotes(params: {
  notesText: string;
  mode?: 'comprehensive' | 'quick' | 'exam_prep';
}): Promise<{ summary: string; modelUsed?: string }> {
  const res = await fetch('/api/notes/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Notes summarization failed.');
  }

  return { summary: data.summary, modelUsed: data.modelUsed };
}

export async function parseAutomationCommand(command: string): Promise<{
  action: string;
  confidence: number;
  requiresConfirmation: boolean;
  feedbackMessage: string;
  param?: string;
}> {
  const res = await fetch('/api/automation/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to parse phone automation command.');
  }

  return data;
}

