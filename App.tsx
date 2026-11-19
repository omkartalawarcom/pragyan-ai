import React, { useState, useEffect } from 'react';
import { 
  TabType, 
  ChatSession, 
  StudyPlan, 
  SavedSummary, 
  SavedPdfSession, 
  AppSettings 
} from './types';
import { 
  getAppSettings, 
  saveAppSettings, 
  getSavedChatSessions, 
  getSavedStudyPlans, 
  getSavedSummaries, 
  getSavedPdfSessions 
} from './services/storage';
import { fetchSystemStatus } from './services/api';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { ChatView } from './components/ChatView';
import { VoiceView } from './components/VoiceView';
import { PdfView } from './components/PdfView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { NotesSummarizerView } from './components/NotesSummarizerView';
import { PhoneAutomationView } from './components/PhoneAutomationView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { AndroidExportModal } from './components/AndroidExportModal';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => getAppSettings());
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [initialChatQuery, setInitialChatQuery] = useState<string>('');
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  const [isAndroidExportOpen, setIsAndroidExportOpen] = useState<boolean>(false);

  // Stored items
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => getSavedChatSessions());
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>(() => getSavedStudyPlans());
  const [summaries, setSummaries] = useState<SavedSummary[]>(() => getSavedSummaries());
  const [pdfSessions, setPdfSessions] = useState<SavedPdfSession[]>(() => getSavedPdfSessions());

  // Check system status on mount
  useEffect(() => {
    fetchSystemStatus().then((status) => {
      setIsBackendConnected(status.status === 'online');
    }).catch(() => {
      setIsBackendConnected(false);
    });
  }, []);

  // Update theme class on document element
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-slate-950 text-slate-100 antialiased';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-slate-100 text-slate-900 antialiased';
    }
  }, [settings.theme]);

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveAppSettings(updated);
  };

  const handleToggleTheme = () => {
    handleUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const handleToggleAndroidFrame = () => {
    handleUpdateSettings({ useAndroidFrame: !settings.useAndroidFrame });
  };

  const refreshAllHistory = () => {
    setChatSessions(getSavedChatSessions());
    setStudyPlans(getSavedStudyPlans());
    setSummaries(getSavedSummaries());
    setPdfSessions(getSavedPdfSessions());
  };

  const handleSelectTab = (tab: TabType, initialQuery?: string) => {
    if (initialQuery) {
      setInitialChatQuery(initialQuery);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectChatSession = (session: ChatSession) => {
    setActiveSession(session);
    setCurrentTab('chat');
  };

  // Content renderer
  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomeDashboard
            onSelectTab={handleSelectTab}
            theme={settings.theme}
          />
        );
      case 'chat':
        return (
          <ChatView
            theme={settings.theme}
            initialQuery={initialChatQuery}
            onClearInitialQuery={() => setInitialChatQuery('')}
            activeSession={activeSession}
            onSessionUpdated={() => refreshAllHistory()}
          />
        );
      case 'voice':
        return (
          <VoiceView
            theme={settings.theme}
            voiceRate={settings.voiceRate}
            voicePitch={settings.voicePitch}
            autoReadVoice={settings.autoReadVoice}
          />
        );
      case 'pdf':
        return <PdfView theme={settings.theme} />;
      case 'planner':
        return (
          <StudyPlannerView
            theme={settings.theme}
            onPlanSaved={() => refreshAllHistory()}
          />
        );
      case 'notes':
        return (
          <NotesSummarizerView
            theme={settings.theme}
            onSummarySaved={() => refreshAllHistory()}
          />
        );
      case 'automation':
        return (
          <PhoneAutomationView
            theme={settings.theme}
            onNavigateBack={() => handleSelectTab('home')}
          />
        );
      case 'history':
        return (
          <HistoryView
            theme={settings.theme}
            chatSessions={chatSessions}
            studyPlans={studyPlans}
            summaries={summaries}
            pdfSessions={pdfSessions}
            onSelectChat={handleSelectChatSession}
            onRefreshHistory={refreshAllHistory}
            onSelectTab={handleSelectTab}
          />
        );
      case 'settings':
        return (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenAndroidExport={() => setIsAndroidExportOpen(true)}
          />
        );
      default:
        return (
          <HomeDashboard
            onSelectTab={handleSelectTab}
            theme={settings.theme}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
      settings.theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* If Android Phone Frame Mode is enabled */}
      {settings.useAndroidFrame ? (
        <div className="py-6 px-3 flex flex-col items-center justify-center min-h-screen">
          {/* Android Device Mockup Shell */}
          <div className="relative w-full max-w-[430px] rounded-[48px] border-[10px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-slate-800">
            {/* Front Camera Punch Hole */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>

            {/* Inner Phone Screen */}
            <div className={`flex flex-col h-[844px] overflow-hidden ${
              settings.theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
            }`}>
              <Header
                currentTab={currentTab}
                onSelectTab={handleSelectTab}
                theme={settings.theme}
                onToggleTheme={handleToggleTheme}
                useAndroidFrame={settings.useAndroidFrame}
                onToggleAndroidFrame={handleToggleAndroidFrame}
                isBackendConnected={isBackendConnected}
              />

              <main className="flex-1 overflow-y-auto px-4 py-4">
                {renderTabContent()}
              </main>

              <BottomNav
                currentTab={currentTab}
                onSelectTab={handleSelectTab}
                theme={settings.theme}
              />

              {/* Android Gesture Bar */}
              <div className="py-1.5 flex justify-center bg-slate-950/80">
                <div className="w-28 h-1 rounded-full bg-slate-600" />
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span>Android Frame Preview Active</span>
            <button
              onClick={handleToggleAndroidFrame}
              className="text-blue-500 underline font-medium hover:text-blue-400"
            >
              Switch to Fullscreen
            </button>
          </div>
        </div>
      ) : (
        /* Fullscreen Responsive Android / Web View */
        <div className="flex flex-col min-h-screen">
          <Header
            currentTab={currentTab}
            onSelectTab={handleSelectTab}
            theme={settings.theme}
            onToggleTheme={handleToggleTheme}
            useAndroidFrame={settings.useAndroidFrame}
            onToggleAndroidFrame={handleToggleAndroidFrame}
            isBackendConnected={isBackendConnected}
          />

          <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
            {renderTabContent()}
          </main>

          <BottomNav
            currentTab={currentTab}
            onSelectTab={handleSelectTab}
            theme={settings.theme}
          />
        </div>
      )}

      {/* Android Studio Export & APK Guide Modal */}
      <AndroidExportModal
        isOpen={isAndroidExportOpen}
        onClose={() => setIsAndroidExportOpen(false)}
        theme={settings.theme}
      />
    </div>
  );
}
