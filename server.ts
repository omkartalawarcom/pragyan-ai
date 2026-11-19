import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Increase payload limit for PDF documents and base64 payloads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Free tier models to use with automatic fallback
const FREE_TIER_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
const PRIMARY_MODEL = FREE_TIER_MODELS[0];
const FALLBACK_MODEL = FREE_TIER_MODELS[1];

/**
 * Universal safe AI generator with multi-model fallback, retry and rate-limit handling.
 */
async function generateAIContent(params: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
}) {
  if (!ai || !apiKey) {
    throw new Error(
      'AI service is currently connecting. Please ensure GEMINI_API_KEY is available in the environment settings.'
    );
  }

  const config: any = {};
  if (params.systemInstruction) {
    config.systemInstruction = params.systemInstruction;
  }
  if (params.responseMimeType) {
    config.responseMimeType = params.responseMimeType;
  }

  let lastError: any = null;

  // Try each configured free-tier model in sequence
  for (const modelName of FREE_TIER_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: Object.keys(config).length > 0 ? config : undefined,
        });

        return {
          text: response.text || '',
          modelUsed: modelName,
        };
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const isTransient = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand') || msg.includes('429');
        
        if (isTransient && attempt === 0) {
          // Wait 600ms before retrying once on transient spike
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
        // If failed, proceed to next model in FREE_TIER_MODELS list
        break;
      }
    }
  }

  const errMsg = lastError?.message || 'Unknown error occurred while contacting AI service.';
  if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
    throw new Error('Free tier quota limit reached temporarily. Please wait a moment and try your request again.');
  } else if (errMsg.includes('503') || errMsg.includes('UNAVAILABLE') || errMsg.includes('high demand')) {
    throw new Error('Free AI models are currently experiencing high demand. Please try again in a few moments.');
  } else if (errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('API_KEY_INVALID')) {
    throw new Error('AI Provider authentication issue. Please check the backend configuration.');
  }
  throw new Error(`AI Service Notice: ${errMsg}`);
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health and provider status
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'online',
    appName: 'Pragyan AI',
    version: '1.0.0',
    provider: 'Google Gemini (Free Tier)',
    primaryModel: PRIMARY_MODEL,
    fallbackModel: FALLBACK_MODEL,
    isConfigured: !!apiKey,
    freeTierNotice: 'Powered by free tier AI models. Free for students and general users.',
  });
});

// Feature 1: General AI Chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userQuery } = req.body;

    if (!userQuery && (!messages || !messages.length)) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const systemPrompt = `You are Pragyan AI, an intelligent, encouraging, and friendly all-in-one personal AI assistant designed for students and Android users.
Your traits:
- Clear, structured, and easy-to-understand explanations.
- Patient, polite, and respectful tone.
- LANGUAGE CAPABILITY: You fluently understand and respond in English as well as Kannada-English mixed language (commonly called "Kanglish", e.g., "Namaskara", "Nange physics swalpa explain maadi", "Hegiddira", "Exam ge time table maadi", etc.).
- When the user asks in Kanglish (Kannada written in English alphabet) or Kannada, answer helpfully in friendly, natural Kanglish/English so they feel comfortable.
- When answering academic or technical queries, break things into simple steps, real-world examples, or bullet points.
- Keep formatting clean with Markdown headers, bold text, and lists.
- Avoid robotic or overly pedantic language.`;

    // Build chat contents
    let contents: any[] = [];
    if (Array.isArray(messages) && messages.length > 0) {
      contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
    } else if (userQuery) {
      contents = [{ role: 'user', parts: [{ text: userQuery }] }];
    }

    const result = await generateAIContent({
      contents,
      systemInstruction: systemPrompt,
    });

    res.json({
      success: true,
      reply: result.text,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate chat response',
    });
  }
});

// Feature 2: Voice Assistant AI Query
app.post('/api/voice/process', async (req, res) => {
  try {
    const { spokenText } = req.body;

    if (!spokenText || typeof spokenText !== 'string' || !spokenText.trim()) {
      return res.status(400).json({ error: 'Spoken text prompt is required.' });
    }

    const systemPrompt = `You are Pragyan AI Voice Companion on an Android phone.
Rules:
1. Provide a direct, natural, conversational answer that sounds great when read aloud by Text-To-Speech (TTS).
2. You understand both English and Kannada-English mixed language (Kanglish). If the user speaks in Kanglish (e.g., "Namaskara", "YouTube open maadu", "Nange helu"), respond helpfully in warm, friendly Kanglish or English.
3. Keep the spoken answer concise (2-4 sentences) so TTS is fast and pleasant.
4. If the user is asking to perform a phone action (e.g. open YouTube, open WhatsApp, open camera, open settings, adjust volume, scroll, set alarm, open wifi/bluetooth, make a call), acknowledge the command naturally and indicate that Pragyan AI is executing it.
5. Avoid awkward ASCII or formatting in spoken summaries so speech synthesis speaks smoothly.`;

    const result = await generateAIContent({
      contents: [{ role: 'user', parts: [{ text: spokenText }] }],
      systemInstruction: systemPrompt,
    });

    // Check if spoken text contains a phone automation action
    const lower = spokenText.toLowerCase();
    let detectedAction: string | null = null;
    let actionParam: string | null = null;

    if (lower.includes('youtube')) detectedAction = 'open_youtube';
    else if (lower.includes('whatsapp')) detectedAction = 'open_whatsapp';
    else if (lower.includes('camera')) detectedAction = 'open_camera';
    else if (lower.includes('bluetooth')) detectedAction = 'open_bluetooth';
    else if (lower.includes('wifi') || lower.includes('wi-fi')) detectedAction = 'open_wifi';
    else if (lower.includes('alarm')) detectedAction = 'set_alarm';
    else if (lower.includes('settings')) detectedAction = 'open_settings';
    else if (lower.includes('volume')) detectedAction = 'adjust_volume';
    else if (lower.includes('scroll down') || lower.includes('kelage')) detectedAction = 'scroll_down';
    else if (lower.includes('scroll up') || lower.includes('mele')) detectedAction = 'scroll_up';
    else if (lower.includes('back') || lower.includes('hinde')) detectedAction = 'navigate_back';
    else if (lower.includes('call') || lower.includes('phone')) detectedAction = 'make_call';

    // Extract a clean spoken summary for TTS
    const fullText = result.text;
    const lines = fullText.split('\n').filter((l: string) => l.trim().length > 0);
    const spokenSummary = lines.slice(0, 3).join(' ').replace(/[*#_`]/g, '');

    res.json({
      success: true,
      text: fullText,
      spokenSpeech: spokenSummary,
      modelUsed: result.modelUsed,
      automationAction: detectedAction,
      automationParam: actionParam,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Voice assistant could not process request.',
    });
  }
});

// Feature 6: Phone Automation Natural Language Command Parser
app.post('/api/automation/parse', async (req, res) => {
  try {
    const { command } = req.body;
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command text is required.' });
    }

    const prompt = `Analyze this user phone command (in English or Kannada-English mixed "Kanglish"):
"${command}"

Determine the matching Android action from this list:
- "open_youtube" (e.g., open YouTube, watch video)
- "open_whatsapp" (e.g., open WhatsApp, send message)
- "open_camera" (e.g., open camera, take photo)
- "open_settings" (e.g., open settings)
- "open_wifi" (e.g., turn on wifi, wifi settings)
- "open_bluetooth" (e.g., bluetooth settings)
- "set_alarm" (e.g., set alarm for 6 AM, wake me up)
- "adjust_volume" (e.g., increase volume, volume jasthi maadi, mute)
- "scroll_down" (e.g., scroll down, swipe down, kelage scroll maadu)
- "scroll_up" (e.g., scroll up, mele scroll maadu)
- "navigate_back" (e.g., go back, hinde hogi)
- "make_call" (e.g., call mom, make a call, phone maadu)

Return JSON with schema:
{
  "action": string,
  "confidence": number,
  "requiresConfirmation": boolean,
  "feedbackMessage": string,
  "param": string
}
Note: If action is "make_call", requiresConfirmation MUST be true.`;

    const systemPrompt = `You are Pragyan AI's Android Automation Intent Parser. You understand English and Kanglish commands. Return valid JSON only.`;

    const result = await generateAIContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    });

    try {
      const parsed = JSON.parse(result.text.trim());
      res.json({ success: true, ...parsed });
    } catch {
      res.json({
        success: true,
        action: 'open_settings',
        confidence: 0.5,
        requiresConfirmation: false,
        feedbackMessage: 'Executing command on Android device.',
      });
    }
  } catch (error: any) {
    // Robust local rule-based fallback if AI is experiencing transient unavailability
    const lower = (req.body.command || '').toLowerCase();
    let action = 'open_settings';
    let requiresConfirmation = false;
    let feedback = 'Opening Android settings';
    let param = '';

    if (lower.includes('youtube')) { action = 'open_youtube'; feedback = 'Opening YouTube...'; }
    else if (lower.includes('whatsapp')) { action = 'open_whatsapp'; feedback = 'Opening WhatsApp...'; }
    else if (lower.includes('camera') || lower.includes('photo')) { action = 'open_camera'; feedback = 'Opening Camera...'; }
    else if (lower.includes('bluetooth')) { action = 'open_bluetooth'; feedback = 'Opening Bluetooth Settings...'; }
    else if (lower.includes('wifi') || lower.includes('wi-fi')) { action = 'open_wifi'; feedback = 'Opening Wi-Fi Settings...'; }
    else if (lower.includes('alarm')) { action = 'set_alarm'; feedback = 'Setting alarm on device...'; }
    else if (lower.includes('volume')) { action = 'adjust_volume'; feedback = 'Adjusting device volume...'; }
    else if (lower.includes('scroll down') || lower.includes('kelage')) { action = 'scroll_down'; feedback = 'Scrolling down screen...'; }
    else if (lower.includes('scroll up') || lower.includes('mele')) { action = 'scroll_up'; feedback = 'Scrolling up screen...'; }
    else if (lower.includes('back') || lower.includes('hinde')) { action = 'navigate_back'; feedback = 'Navigating back...'; }
    else if (lower.includes('call') || lower.includes('phone')) { action = 'make_call'; requiresConfirmation = true; feedback = 'Initiating phone call with confirmation...'; }

    res.json({
      success: true,
      action,
      confidence: 0.9,
      requiresConfirmation,
      feedbackMessage: feedback,
      param,
    });
  }
});

// Feature 3: AI PDF Reader & Document QA
app.post('/api/pdf/analyze', async (req, res) => {
  try {
    const { pdfBase64, textContent, fileName, action, question } = req.body;

    if (!pdfBase64 && !textContent) {
      return res.status(400).json({ error: 'Please upload a PDF document or provide document text.' });
    }

    let prompt = '';
    if (action === 'ask') {
      prompt = `Document Name: "${fileName || 'Uploaded Document'}".
The user asks this specific question about the document:
"${question}"

Provide a comprehensive, accurate answer strictly grounded in the document. Cite sections or headings where relevant. If the answer is not mentioned in the document, state that politely.`;
    } else if (action === 'explain_simple') {
      prompt = `Document Name: "${fileName || 'Uploaded Document'}".
Explain the main concepts and most difficult topics in this document in very simple, beginner-friendly terms (like explaining to a student). Use relatable analogies, simple bullet points, and highlight 3 key takeaways.`;
    } else {
      // Default: Summarize & Key Insights
      prompt = `Document Name: "${fileName || 'Uploaded Document'}".
Please provide:
1. **Executive Summary**: A concise 2-3 paragraph overview of the core subject matter.
2. **Key Concepts & Findings**: Bullet points of critical ideas, theories, or data.
3. **Important Terms & Definitions**: Key terminology explained simply.
4. **Suggested Study Questions**: 3-5 thought-provoking review questions with short answers based on the document.`;
    }

    const systemPrompt = `You are Pragyan AI's Expert Document & PDF Analyst. Help students and professionals understand complex research papers, textbooks, lecture slides, and notes easily.`;

    let contents: any;
    if (pdfBase64) {
      // Clean base64 string if it contains data URI prefix
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      contents = [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ];
    } else {
      contents = [
        {
          parts: [
            {
              text: `Here is the extracted document content:\n\n${textContent.slice(0, 50000)}\n\nUser Request: ${prompt}`,
            },
          ],
        },
      ];
    }

    const result = await generateAIContent({
      contents,
      systemInstruction: systemPrompt,
    });

    res.json({
      success: true,
      analysis: result.text,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze PDF document.',
    });
  }
});

// Feature 4: AI Study Planner
app.post('/api/study-plan', async (req, res) => {
  try {
    const { subjects, topics, availableHoursPerDay, examGoal, durationDays } = req.body;

    if (!subjects || !subjects.length) {
      return res.status(400).json({ error: 'Please specify at least one subject.' });
    }

    const prompt = `Create an optimized, realistic, high-efficiency daily study timetable and roadmap.
Parameters:
- Subjects: ${Array.isArray(subjects) ? subjects.join(', ') : subjects}
- Key Topics / Syllabus: ${topics || 'General core curriculum'}
- Available Study Hours Per Day: ${availableHoursPerDay || 4} hours
- Goal / Target Exam: ${examGoal || 'Semester Finals & Concept Mastery'}
- Target Duration: ${durationDays || 7} days

Return a structured JSON object with the following schema:
{
  "planTitle": string,
  "summary": string,
  "dailyTargetHours": number,
  "motivationalQuote": string,
  "studyTips": string[],
  "dailySchedule": [
    {
      "dayNumber": number,
      "dayName": string,
      "focusSubject": string,
      "sessions": [
        {
          "timeSlot": string,
          "subject": string,
          "topic": string,
          "objective": string,
          "suggestedTechnique": string
        }
      ],
      "checkpoints": string[]
    }
  ],
  "checklistTasks": [
    {
      "id": string,
      "title": string,
      "subject": string,
      "estimatedMinutes": number,
      "priority": "high" | "medium" | "low"
    }
  ]
}`;

    const systemPrompt = `You are Pragyan AI's Academic Success Coach and Expert Study Architect. You design balanced, scientifically backed study routines (Pomodoro, active recall, spaced repetition). Always return valid JSON only.`;

    const result = await generateAIContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    });

    try {
      const parsed = JSON.parse(result.text.trim());
      res.json({
        success: true,
        plan: parsed,
        modelUsed: result.modelUsed,
      });
    } catch {
      // If parsing fails, return text fallback
      res.json({
        success: true,
        rawText: result.text,
        modelUsed: result.modelUsed,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate study timetable.',
    });
  }
});

// Feature 5: AI Notes Summarizer
app.post('/api/notes/summarize', async (req, res) => {
  try {
    const { notesText, mode } = req.body;

    if (!notesText || typeof notesText !== 'string' || !notesText.trim()) {
      return res.status(400).json({ error: 'Please provide notes text to summarize.' });
    }

    const prompt = `You are analyzing the following student/lecture notes:
"""
${notesText.slice(0, 35000)}
"""

Mode: ${mode || 'comprehensive'}

Provide a structured, beautifully formatted response with these exact sections:
1. 📌 **Quick Executive Summary** (2-3 sentences overview)
2. 🎯 **Key Core Takeaways** (bullet points of the most essential ideas)
3. 📖 **Essential Definitions & Formulae** (table or list of critical terms defined simply)
4. ❓ **Top Exam Questions & Answers** (3-5 high-probability questions with concise answers)
5. ⚡ **Quick Revision Cheat-Sheet** (condensed memory pegs, mnemonics, or bullet list for last-minute review)`;

    const systemPrompt = `You are Pragyan AI Notes Master. You convert chaotic, lengthy lecture notes or textbooks into crystal-clear, high-yield study guides.`;

    const result = await generateAIContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: systemPrompt,
    });

    res.json({
      success: true,
      summary: result.text,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to summarize notes.',
    });
  }
});

// ----------------------------------------------------
// VITE DEV MIDDLEWARE / STATIC PRODUCTION SERVING
// ----------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Pragyan AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
