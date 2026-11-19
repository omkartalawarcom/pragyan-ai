import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  User, 
  Volume2,
  VolumeX,
  Mic,
  RotateCcw, 
  AlertCircle,
  HelpCircle,
  BookOpen,
  Code,
  Calculator
} from 'lucide-react';
import { ChatMessage, ChatSession } from '../types';
import { sendChatMessage } from '../services/api';
import { saveChatSession } from '../services/storage';
import { PragyanRobotLogo } from './PragyanRobotLogo';

interface ChatViewProps {
  theme: 'dark' | 'light';
  initialQuery?: string;
  onClearInitialQuery?: () => void;
  activeSession?: ChatSession | null;
  onSessionUpdated?: (session: ChatSession) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  theme,
  initialQuery,
  onClearInitialQuery,
  activeSession,
  onSessionUpdated,
}) => {
  const isDark = theme === 'dark';
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (activeSession && activeSession.messages.length > 0) {
      return activeSession.messages;
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I am **Pragyan AI**, your academic assistant. 🎓\n\nI can help you with:\n- **STEM & Math**: Step-by-step problem solving\n- **Science & Theory**: Clear, conceptual breakdowns\n- **Writing & Exams**: Essay drafts, grammar, study techniques\n- **General Knowledge**: History, civics, coding, literature\n\nWhat would you like to explore today?`,
        timestamp: Date.now(),
        modelUsed: 'gemini-3.8-flash',
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string>(activeSession?.id || `session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle initialQuery if passed from Home dashboard
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery.trim());
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  // Handle active session switch
  useEffect(() => {
    if (activeSession) {
      setMessages(activeSession.messages);
      setCurrentSessionId(activeSession.id);
    }
  }, [activeSession]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || isLoading) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Send conversation context to backend
      const apiPayload = newMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await sendChatMessage(apiPayload);

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
        modelUsed: response.modelUsed || 'gemini-3.8-flash',
      };

      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);

      // Save to local storage
      const sessionTitle = userMsg.content.slice(0, 32) + (userMsg.content.length > 32 ? '...' : '');
      const updatedSession: ChatSession = {
        id: currentSessionId,
        title: sessionTitle || 'Study Chat',
        createdAt: activeSession?.createdAt || Date.now(),
        updatedAt: Date.now(),
        messages: finalMessages,
      };
      saveChatSession(updatedSession);
      if (onSessionUpdated) onSessionUpdated(updatedSession);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Could not fetch response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      const resetMsg: ChatMessage[] = [
        {
          id: `welcome_${Date.now()}`,
          role: 'assistant',
          content: 'Chat cleared! What new topic can I assist you with?',
          timestamp: Date.now(),
          modelUsed: 'gemini-3.8-flash',
        },
      ];
      setMessages(resetMsg);
      const newId = `session_${Date.now()}`;
      setCurrentSessionId(newId);
    }
  };

  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const handleSpeakMessage = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const starterChips = [
    { label: 'Namaskara! Exam tips', icon: Sparkles, prompt: 'Namaskara Pragyan! Final exam ge 5 best study tips swalpa explain maadi.' },
    { label: 'Physics: Newton Laws', icon: BookOpen, prompt: 'Explain Newton’s three laws of motion with simple real-life examples.' },
    { label: 'Math: Quadratic Equations', icon: Calculator, prompt: 'How to solve quadratic equations step-by-step? Formula kooda heli.' },
    { label: 'Data Structures Big-O', icon: Code, prompt: 'Summarize Big-O time complexity of Array vs Linked List vs Hash Map.' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[750px] rounded-3xl border overflow-hidden transition-all duration-200">
      {/* Top Chat Bar */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <PragyanRobotLogo size={32} />
          <div>
            <h2 className="font-bold text-sm tracking-tight">Pragyan AI Chatbot</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                English & Kannada-English (Kanglish)
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          title="Clear Conversation"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
            isDark 
              ? 'bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-400 border-slate-700 text-slate-300' 
              : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border-slate-200 text-slate-600'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
        isDark ? 'bg-slate-950/60' : 'bg-slate-50/70'
      }`}>
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {isUser ? (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs bg-gradient-to-tr from-indigo-500 to-purple-600">
                  <User className="w-4 h-4" />
                </div>
              ) : (
                <PragyanRobotLogo size={32} />
              )}

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs relative group ${
                isUser
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs'
                  : isDark
                  ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-xs'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
              }`}>
                {/* Content with basic formatting */}
                <div className="whitespace-pre-wrap break-words space-y-2">
                  {msg.content.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className="leading-relaxed">
                      {paragraph.split('**').map((chunk, cIdx) => 
                        cIdx % 2 === 1 ? <strong key={cIdx} className="font-bold text-inherit">{chunk}</strong> : chunk
                      )}
                    </p>
                  ))}
                </div>

                {/* Footer bar with timestamp & copy button */}
                <div className="mt-2 pt-1 border-t border-current/10 flex items-center justify-between gap-3 text-[10px] opacity-80">
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.modelUsed && !isUser && ` • ${msg.modelUsed}`}
                  </span>

                  <div className="flex items-center gap-1">
                    {!isUser && (
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.content)}
                        className={`hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-black/10 flex items-center gap-1 ${
                          speakingId === msg.id ? 'text-indigo-400 font-bold' : ''
                        }`}
                        title={speakingId === msg.id ? 'Stop Speaking' : 'Read Aloud (Voice Response)'}
                      >
                        {speakingId === msg.id ? <VolumeX className="w-3 h-3 animate-pulse" /> : <Volume2 className="w-3 h-3" />}
                        <span>{speakingId === msg.id ? 'Playing' : 'Listen'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-black/10 flex items-center gap-1"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <PragyanRobotLogo size={32} className="animate-spin" />
            <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="font-medium">Pragyan AI is thinking...</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => handleSendMessage()}
              className="text-xs font-semibold underline hover:text-rose-300"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips if few messages */}
      {messages.length <= 2 && (
        <div className={`p-2.5 px-4 flex items-center gap-2 overflow-x-auto border-t text-xs ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100/50 border-slate-200'
        }`}>
          {starterChips.map((chip, i) => {
            const Icon = chip.icon;
            return (
              <button
                key={i}
                onClick={() => handleSendMessage(chip.prompt)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shrink-0 text-xs transition-all ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-200'
                }`}
              >
                <Icon className="w-3 h-3 text-blue-500" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Input Form with Voice Dictation */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className={`p-3 border-t ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className={`flex items-center rounded-2xl border p-1.5 ${
          isDark ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'
        }`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type in English or Kannada-English (Kanglish)..."
            disabled={isLoading}
            className={`w-full py-2 px-3 text-xs sm:text-sm bg-transparent focus:outline-hidden disabled:opacity-50 ${
              isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
            }`}
          />
          <button
            type="button"
            onClick={() => {
              if (!input) {
                setInput('Namaskara Pragyan! How can I study effectively?');
              } else {
                handleSendMessage(input);
              }
            }}
            title="Insert voice/Kanglish starter"
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Mic className="w-4 h-4 text-indigo-400" />
          </button>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 shadow-sm shadow-blue-500/20 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
