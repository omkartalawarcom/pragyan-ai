import React from 'react';
import { Home, MessageSquare, History, Settings, Mic, FileText, Calendar, Sparkles, Smartphone } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  theme: 'dark' | 'light';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  theme,
}) => {
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'chat' as TabType, label: 'Chat', icon: MessageSquare },
    { id: 'voice' as TabType, label: 'Voice', icon: Mic },
    { id: 'automation' as TabType, label: 'Phone', icon: Smartphone },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  // Secondary quick drawer indicators for active specialized features
  const isSpecializedActive = ['pdf', 'planner', 'notes'].includes(currentTab);

  return (
    <div className="sticky bottom-0 z-30 w-full select-none">
      {/* If inside a specialized screen, show quick back-to-features pill bar */}
      {isSpecializedActive && (
        <div className={`px-4 py-1.5 flex items-center justify-between text-xs border-t ${
          isDark ? 'bg-slate-900/95 border-slate-800 text-slate-400' : 'bg-slate-50/95 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="capitalize">{currentTab} Active</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSelectTab('pdf')}
              className={`p-1.5 rounded-lg transition-colors ${currentTab === 'pdf' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700/40'}`}
              title="PDF Reader"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectTab('planner')}
              className={`p-1.5 rounded-lg transition-colors ${currentTab === 'planner' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700/40'}`}
              title="Study Planner"
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectTab('notes')}
              className={`p-1.5 rounded-lg transition-colors ${currentTab === 'notes' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700/40'}`}
              title="Notes Summarizer"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Primary Bottom Bar */}
      <nav
        className={`px-3 py-2 border-t backdrop-blur-xl transition-colors duration-200 ${
          isDark
            ? 'bg-slate-900/90 border-slate-800/90 text-slate-400'
            : 'bg-white/95 border-slate-200 text-slate-600'
        }`}
      >
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? isDark
                      ? 'text-white font-semibold'
                      : 'text-blue-600 font-semibold'
                    : isDark
                    ? 'hover:text-slate-200 hover:bg-slate-800/50'
                    : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {/* Active indicator pill (Android Material You style) */}
                <div
                  className={`relative flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
                    isActive
                      ? isDark
                        ? 'bg-blue-600/30 text-blue-400 shadow-sm shadow-blue-500/20'
                        : 'bg-blue-100 text-blue-700'
                      : 'bg-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
