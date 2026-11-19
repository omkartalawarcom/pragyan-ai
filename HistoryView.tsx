import React, { useState } from 'react';
import { 
  History, 
  MessageSquare, 
  Calendar, 
  FileCheck2, 
  FileText, 
  Trash2, 
  ArrowRight, 
  Search, 
  Clock, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ChatSession, StudyPlan, SavedSummary, SavedPdfSession, TabType } from '../types';
import { deleteChatSession, deleteStudyPlan, deleteSummary } from '../services/storage';

interface HistoryViewProps {
  theme: 'dark' | 'light';
  chatSessions: ChatSession[];
  studyPlans: StudyPlan[];
  summaries: SavedSummary[];
  pdfSessions: SavedPdfSession[];
  onSelectChat: (session: ChatSession) => void;
  onRefreshHistory: () => void;
  onSelectTab: (tab: TabType) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  theme,
  chatSessions,
  studyPlans,
  summaries,
  pdfSessions,
  onSelectChat,
  onRefreshHistory,
  onSelectTab,
}) => {
  const isDark = theme === 'dark';
  const [filter, setFilter] = useState<'all' | 'chat' | 'planner' | 'notes' | 'pdf'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this chat from history?')) {
      deleteChatSession(id);
      onRefreshHistory();
    }
  };

  const handleDeletePlan = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this study plan?')) {
      deleteStudyPlan(id);
      onRefreshHistory();
    }
  };

  const handleDeleteSummary = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this summary?')) {
      deleteSummary(id);
      onRefreshHistory();
    }
  };

  const totalItems = chatSessions.length + studyPlans.length + summaries.length + pdfSessions.length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-6">
      {/* Header Info */}
      <div className={`p-5 rounded-3xl border ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Saved Learning History</h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {totalItems} items saved locally on your device.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-4 pt-3 border-t border-slate-500/10 flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'chat', label: `Chats (${chatSessions.length})` },
            { id: 'planner', label: `Study Plans (${studyPlans.length})` },
            { id: 'notes', label: `Summaries (${summaries.length})` },
            { id: 'pdf', label: `PDFs (${pdfSessions.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {totalItems === 0 && (
        <div className={`p-10 rounded-3xl border text-center space-y-3 ${
          isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
        }`}>
          <Clock className="w-10 h-10 mx-auto opacity-40 text-blue-500" />
          <h3 className="text-sm font-bold">No saved activity yet</h3>
          <p className="text-xs max-w-sm mx-auto">
            Your conversations with Pragyan AI, generated study plans, and notes summaries will automatically be preserved here.
          </p>
        </div>
      )}

      {/* List of Saved Items */}
      <div className="space-y-3">
        {/* Chat Sessions */}
        {(filter === 'all' || filter === 'chat') &&
          chatSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => {
                onSelectChat(session);
                onSelectTab('chat');
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                isDark
                  ? 'bg-slate-900/80 border-slate-800 hover:border-blue-500/50'
                  : 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm group-hover:text-blue-500 transition-colors">
                    {session.title}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {session.messages.length} messages • {new Date(session.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => handleDeleteChat(e, session.id)}
                  title="Delete"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="p-2 text-slate-400 group-hover:text-blue-500 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}

        {/* Study Plans */}
        {(filter === 'all' || filter === 'planner') &&
          studyPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => onSelectTab('planner')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                isDark
                  ? 'bg-slate-900/80 border-slate-800 hover:border-purple-500/50'
                  : 'bg-white border-slate-200 hover:border-purple-300 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm group-hover:text-purple-400 transition-colors">
                    {plan.planTitle}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {plan.dailyTargetHours}h/day • {plan.subjects.join(', ')} • {new Date(plan.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => handleDeletePlan(e, plan.id)}
                  title="Delete"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="p-2 text-slate-400 group-hover:text-purple-400 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}

        {/* Summaries */}
        {(filter === 'all' || filter === 'notes') &&
          summaries.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectTab('notes')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                isDark
                  ? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50'
                  : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm group-hover:text-indigo-400 transition-colors">
                    {s.title}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Mode: {s.mode} • {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => handleDeleteSummary(e, s.id)}
                  title="Delete"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="p-2 text-slate-400 group-hover:text-indigo-400 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}

        {/* PDF Sessions */}
        {(filter === 'all' || filter === 'pdf') &&
          pdfSessions.map((pdf) => (
            <div
              key={pdf.id}
              onClick={() => onSelectTab('pdf')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                isDark
                  ? 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/50'
                  : 'bg-white border-slate-200 hover:border-cyan-300 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm group-hover:text-cyan-400 transition-colors">
                    {pdf.fileName}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {pdf.qas.length} questions answered • {new Date(pdf.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="p-2 text-slate-400 group-hover:text-cyan-400 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
