import React from 'react';
import { Sparkles, Sun, Moon, Smartphone, Monitor, ShieldCheck, Wifi } from 'lucide-react';
import { TabType } from '../types';
import { PragyanRobotLogo } from './PragyanRobotLogo';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  useAndroidFrame: boolean;
  onToggleAndroidFrame: () => void;
  isBackendConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectTab,
  theme,
  onToggleTheme,
  useAndroidFrame,
  onToggleAndroidFrame,
  isBackendConnected,
}) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="sticky top-0 z-30 w-full select-none backdrop-blur-xl border-b transition-colors duration-200">
      {/* Android Mobile Status Bar when in mobile shell */}
      {useAndroidFrame && (
        <div className={`flex items-center justify-between px-6 py-1.5 text-xs font-semibold ${
          theme === 'dark' ? 'bg-slate-950/80 text-slate-400' : 'bg-slate-100/90 text-slate-600'
        }`}>
          <span>{currentTime}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-mono">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="w-4 h-2 rounded-xs border border-current flex items-center p-0.5">
              <div className="w-full h-full bg-current rounded-2xs" />
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className={`px-4 py-3 flex items-center justify-between ${
        theme === 'dark' ? 'bg-slate-900/80 border-slate-800/80 text-white' : 'bg-white/90 border-slate-200 text-slate-900'
      }`}>
        {/* Brand & Logo */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
          role="button"
          tabIndex={0}
        >
          <div className="relative group-hover:scale-105 transition-transform duration-200">
            <PragyanRobotLogo size={36} />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isBackendConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isBackendConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                PRAGYAN AI
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v1.0
              </span>
            </div>
            <p className={`text-[11px] leading-none ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Free Student AI Assistant
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Provider Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            theme === 'dark'
              ? 'bg-slate-800/80 border-slate-700/80 text-slate-300'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Gemini Free Tier</span>
          </div>

          {/* Android Frame Switcher */}
          <button
            onClick={onToggleAndroidFrame}
            title={useAndroidFrame ? 'Switch to Fullscreen view' : 'Switch to Android Phone frame'}
            className={`p-2 rounded-xl transition-all ${
              useAndroidFrame
                ? 'bg-blue-600 text-white shadow-sm'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {useAndroidFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className={`p-2 rounded-xl transition-all ${
              theme === 'dark'
                ? 'text-amber-400 hover:bg-slate-800'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
