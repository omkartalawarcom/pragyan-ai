import React, { useState } from 'react';
import { 
  MessageSquare, 
  Mic, 
  FileText, 
  Calendar, 
  FileCheck2, 
  Smartphone,
  ArrowRight, 
  Send, 
  Sparkles 
} from 'lucide-react';
import { TabType } from '../types';
import { PragyanRobotLogo } from './PragyanRobotLogo';

interface HomeDashboardProps {
  onSelectTab: (tab: TabType, initialQuery?: string) => void;
  theme: 'dark' | 'light';
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onSelectTab,
  theme,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const isDark = theme === 'dark';

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onSelectTab('chat', quickInput.trim());
    setQuickInput('');
  };

  // Exactly the 6 requested main features
  const features = [
    {
      id: 'chat' as TabType,
      title: 'AI Chatbot',
      description: 'Intelligent answers, STEM solving, and Kannada-English support.',
      icon: MessageSquare,
      gradient: 'from-blue-600 to-indigo-600',
      actionText: 'Open Chat',
    },
    {
      id: 'voice' as TabType,
      title: 'Voice Assistant',
      description: 'Hands-free voice queries with natural speech and TTS read aloud.',
      icon: Mic,
      gradient: 'from-indigo-600 to-purple-600',
      actionText: 'Start Voice',
    },
    {
      id: 'pdf' as TabType,
      title: 'AI PDF Reader',
      description: 'Upload textbooks and lecture notes to ask questions and summarize.',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-600',
      actionText: 'Read PDF',
    },
    {
      id: 'planner' as TabType,
      title: 'AI Study Planner',
      description: 'Generate daily schedules, subject timetables, and task checklists.',
      icon: Calendar,
      gradient: 'from-purple-600 to-pink-600',
      actionText: 'Plan Studies',
    },
    {
      id: 'notes' as TabType,
      title: 'AI Notes Summarizer',
      description: 'Condense notes into key points, definitions, and exam flashcards.',
      icon: FileCheck2,
      gradient: 'from-violet-600 to-indigo-700',
      actionText: 'Summarize',
    },
    {
      id: 'automation' as TabType,
      title: 'Phone Automation',
      description: 'Control YouTube, WhatsApp, camera, alarms, settings, and volume.',
      icon: Smartphone,
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
      actionText: 'Automate Phone',
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Header Banner & Welcome */}
      <section className={`p-5 sm:p-6 rounded-3xl border transition-all text-center sm:text-left ${
        isDark 
          ? 'bg-gradient-to-b from-slate-900/90 to-slate-900/50 border-slate-800' 
          : 'bg-gradient-to-b from-blue-50/80 to-white border-blue-100'
      }`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <PragyanRobotLogo size={64} className="hover:scale-105 transition-transform" />
          
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                PRAGYAN AI
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Free
              </span>
            </div>
            <p className={`mt-1 text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Hello! I am your personal AI assistant. How can I help you today?
            </p>
          </div>
        </div>

        {/* AI Chat Input Box */}
        <form onSubmit={handleQuickSubmit} className="mt-5 relative">
          <div className={`flex items-center rounded-2xl border p-1.5 transition-all shadow-sm ${
            isDark 
              ? 'bg-slate-950/80 border-slate-700/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20' 
              : 'bg-white border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
          }`}>
            <div className="pl-3 pr-2 text-indigo-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Ask anything in English or Kannada (e.g., Namaskara, explain physics, open YouTube)..."
              className={`w-full py-2 px-2 text-xs sm:text-sm bg-transparent focus:outline-hidden ${
                isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
              }`}
            />
            <div className="flex items-center gap-1.5 pr-1">
              <button
                type="button"
                onClick={() => onSelectTab('voice')}
                title="Use Voice Assistant"
                className={`p-2 rounded-xl transition-colors ${
                  isDark 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={!quickInput.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 shadow-md shadow-blue-500/20 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* 2. ONLY THE 6 MAIN FEATURE CARDS */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Main Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                onClick={() => onSelectTab(feature.id)}
                role="button"
                tabIndex={0}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between text-left hover:scale-[1.01] ${
                  isDark
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-tr ${feature.gradient} text-white shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className={`p-1.5 rounded-xl text-slate-400 group-hover:text-blue-500 transition-colors ${
                      isDark ? 'bg-slate-800' : 'bg-slate-100'
                    }`}>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm tracking-tight group-hover:text-blue-500 transition-colors">
                      {feature.title}
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-500/10 flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-500 group-hover:underline">
                    {feature.actionText} &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
