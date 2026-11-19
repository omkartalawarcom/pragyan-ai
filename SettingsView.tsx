import React, { useState } from 'react';
import { 
  Settings, 
  Sun, 
  Moon, 
  Smartphone, 
  Volume2, 
  ShieldCheck, 
  Trash2, 
  Download, 
  Info, 
  Check, 
  Sparkles,
  ExternalLink,
  Layers,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { AppSettings } from '../types';
import { clearAllChats } from '../services/storage';
import { PragyanRobotLogo } from './PragyanRobotLogo';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenAndroidExport: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onOpenAndroidExport,
}) => {
  const isDark = settings.theme === 'dark';
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClearAllStorage = () => {
    if (window.confirm('Clear all local chats, study plans, and summaries from this browser?')) {
      clearAllChats();
      localStorage.removeItem('pragyan_study_plans_v1');
      localStorage.removeItem('pragyan_notes_summaries_v1');
      localStorage.removeItem('pragyan_pdf_sessions_v1');
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-6">
      {/* Header Info */}
      <div className={`p-5 rounded-3xl border ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <PragyanRobotLogo size={42} />
          <div>
            <h2 className="text-xl font-bold tracking-tight">Application Settings</h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Customize Pragyan AI theme, voice engine, and Android APK deployment.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Theme & Appearance */}
      <div className={`p-5 rounded-3xl border space-y-4 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400" />
          <span>Appearance & Frame</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onUpdateSettings({ theme: 'dark' })}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
              settings.theme === 'dark'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <Moon className="w-4 h-4 shrink-0" />
            <div>
              <span className="text-xs font-bold block">Dark Theme</span>
              <span className="text-[10px] opacity-80">OLED Dark Blue</span>
            </div>
          </button>

          <button
            onClick={() => onUpdateSettings({ theme: 'light' })}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
              settings.theme === 'light'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <Sun className="w-4 h-4 shrink-0" />
            <div>
              <span className="text-xs font-bold block">Light Theme</span>
              <span className="text-[10px] opacity-80">Clean Day Mode</span>
            </div>
          </button>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold block">Android Shell Preview Frame</span>
            <span className="text-[11px] text-slate-400">Display within realistic mobile phone viewport</span>
          </div>
          <button
            onClick={() => onUpdateSettings({ useAndroidFrame: !settings.useAndroidFrame })}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              settings.useAndroidFrame
                ? 'bg-blue-600 text-white border-blue-500'
                : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {settings.useAndroidFrame ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* 2. Voice & Speech Synthesis */}
      <div className={`p-5 rounded-3xl border space-y-4 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-indigo-400" />
          <span>AI Voice Assistant Settings</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span>Speech Rate (Speed):</span>
              <span className="font-mono text-blue-400 font-bold">{settings.voiceRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.7}
              max={1.5}
              step={0.1}
              value={settings.voiceRate}
              onChange={(e) => onUpdateSettings({ voiceRate: parseFloat(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span>Speech Pitch:</span>
              <span className="font-mono text-indigo-400 font-bold">{settings.voicePitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0.8}
              max={1.3}
              step={0.1}
              value={settings.voicePitch}
              onChange={(e) => onUpdateSettings({ voicePitch: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div>
              <span className="font-semibold block">Auto-read Spoken Answers</span>
              <span className="text-[11px] text-slate-400">Read AI answers aloud immediately after voice query</span>
            </div>
            <input
              type="checkbox"
              checked={settings.autoReadVoice}
              onChange={(e) => onUpdateSettings({ autoReadVoice: e.target.checked })}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 3. Free Tier AI Architecture & Transparency */}
      <div className={`p-5 rounded-3xl border space-y-3 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm tracking-tight">Free AI Provider Architecture</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            Zero Cost
          </span>
        </div>

        <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Pragyan AI runs on free-tier Google Gemini models with intelligent fallback:
        </p>

        <div className="space-y-1.5 text-xs">
          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="font-semibold">Primary Free Model:</span>
            <span className="font-mono text-blue-400">gemini-3.8-flash</span>
          </div>
          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="font-semibold">High-Efficiency Fallback:</span>
            <span className="font-mono text-purple-400">gemini-3.1-flash-lite</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-1">
          ✓ No credit cards required &bull; No subscriptions &bull; No client-side key exposure
        </div>
      </div>

      {/* 4. Android APK Export Modal Trigger */}
      <div className={`p-5 rounded-3xl border space-y-3 bg-gradient-to-tr from-blue-600/10 via-indigo-600/10 to-purple-600/10 ${
        isDark ? 'border-indigo-500/30' : 'border-indigo-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="font-bold text-sm">Build Android APK</h3>
              <p className="text-xs text-slate-400">Complete Android Studio source code & gradle build guide</p>
            </div>
          </div>
          <button
            onClick={onOpenAndroidExport}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors shadow-sm"
          >
            View APK Code
          </button>
        </div>
      </div>

      {/* 5. Storage Management */}
      <div className={`p-5 rounded-3xl border space-y-3 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h3 className="font-bold text-sm tracking-tight flex items-center gap-2 text-rose-400">
          <Trash2 className="w-4 h-4" />
          <span>Device Storage</span>
        </h3>

        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          All chats, study timetables, and notes are stored strictly inside your local browser / device storage.
        </p>

        <button
          onClick={handleClearAllStorage}
          className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Local Storage</span>
        </button>

        {clearedNotice && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Local data cleared successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
};
