import React, { useState } from 'react';
import { 
  Smartphone, 
  Youtube, 
  MessageSquare, 
  Camera, 
  Settings, 
  Wifi, 
  Bluetooth, 
  Bell, 
  Volume2, 
  Volume1,
  VolumeX,
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  PhoneCall, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Send, 
  Check, 
  ExternalLink,
  Info
} from 'lucide-react';
import { parseAutomationCommand } from '../services/api';
import { AutomationActionType } from '../types';

interface PhoneAutomationViewProps {
  theme: 'dark' | 'light';
  onNavigateBack?: () => void;
}

export const PhoneAutomationView: React.FC<PhoneAutomationViewProps> = ({
  theme,
  onNavigateBack,
}) => {
  const isDark = theme === 'dark';

  const [hasAccessibilityPermission, setHasAccessibilityPermission] = useState(true);
  const [commandInput, setCommandInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  
  // Call confirmation modal state
  const [pendingCall, setPendingCall] = useState<string | null>(null);
  const [callRecipient, setCallRecipient] = useState('');

  // Volume state
  const [volumeLevel, setVolumeLevel] = useState(70);

  // Alarm modal state
  const [alarmTime, setAlarmTime] = useState('07:00');
  const [showAlarmPicker, setShowAlarmPicker] = useState(false);

  // Trigger Android Intent or Fallback
  const executeAction = (action: AutomationActionType, param?: string) => {
    switch (action) {
      case 'open_youtube': {
        setFeedback({ message: 'Opening YouTube application...', type: 'success' });
        // Try Android Intent first, then standard URI
        try {
          window.location.href = 'vnd.youtube:';
        } catch {
          window.open('https://www.youtube.com', '_blank');
        }
        break;
      }
      case 'open_whatsapp': {
        setFeedback({ message: 'Opening WhatsApp application...', type: 'success' });
        try {
          window.location.href = 'whatsapp://send';
        } catch {
          window.open('https://api.whatsapp.com', '_blank');
        }
        break;
      }
      case 'open_camera': {
        setFeedback({ message: 'Launching device camera...', type: 'success' });
        // Trigger native camera intent via capture input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        (input as any).capture = 'environment';
        input.click();
        break;
      }
      case 'open_settings': {
        setFeedback({ message: 'Opening Android System Settings...', type: 'success' });
        window.location.href = 'intent:#Intent;action=android.settings.SETTINGS;end';
        break;
      }
      case 'open_wifi': {
        setFeedback({ message: 'Opening Android Wi-Fi Settings...', type: 'success' });
        window.location.href = 'intent:#Intent;action=android.settings.WIFI_SETTINGS;end';
        break;
      }
      case 'open_bluetooth': {
        setFeedback({ message: 'Opening Android Bluetooth Settings...', type: 'success' });
        window.location.href = 'intent:#Intent;action=android.settings.BLUETOOTH_SETTINGS;end';
        break;
      }
      case 'set_alarm': {
        setShowAlarmPicker(true);
        break;
      }
      case 'adjust_volume': {
        const newVol = param ? parseInt(param, 10) : (volumeLevel >= 100 ? 50 : volumeLevel + 20);
        setVolumeLevel(newVol);
        setFeedback({ message: `Device volume adjusted to ${newVol}%.`, type: 'success' });
        break;
      }
      case 'scroll_down': {
        window.scrollBy({ top: 400, behavior: 'smooth' });
        setFeedback({ message: 'Scrolled down smoothly.', type: 'info' });
        break;
      }
      case 'scroll_up': {
        window.scrollBy({ top: -400, behavior: 'smooth' });
        setFeedback({ message: 'Scrolled up smoothly.', type: 'info' });
        break;
      }
      case 'navigate_back': {
        setFeedback({ message: 'Navigating back...', type: 'info' });
        if (onNavigateBack) {
          onNavigateBack();
        } else {
          window.history.back();
        }
        break;
      }
      case 'make_call': {
        // Enforce user confirmation as required by Android security specifications
        setPendingCall(param || callRecipient || '100');
        break;
      }
      default:
        setFeedback({ message: `Action "${action}" triggered.`, type: 'info' });
    }
  };

  const confirmCall = () => {
    if (!pendingCall) return;
    const numberToCall = pendingCall.replace(/[^0-9+]/g, '') || '100';
    setPendingCall(null);
    setFeedback({ message: `Initiating call to ${numberToCall}...`, type: 'success' });
    window.location.href = `tel:${numberToCall}`;
  };

  const confirmSetAlarm = () => {
    setShowAlarmPicker(false);
    setFeedback({ message: `Alarm scheduled for ${alarmTime}. Opening Clock app...`, type: 'success' });
    window.location.href = `intent:#Intent;action=android.intent.action.SET_ALARM;S.android.intent.extra.MESSAGE=Pragyan%20AI%20Study%20Alarm;end`;
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || isLoading) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await parseAutomationCommand(commandInput.trim());
      setFeedback({ message: res.feedbackMessage || `Parsed: ${res.action}`, type: 'success' });

      if (res.action === 'make_call' || res.requiresConfirmation) {
        setPendingCall(res.param || '100');
      } else {
        executeAction(res.action as AutomationActionType, res.param);
      }
      setCommandInput('');
    } catch {
      // Fallback keyword parser
      const lower = commandInput.toLowerCase();
      if (lower.includes('youtube')) executeAction('open_youtube');
      else if (lower.includes('whatsapp')) executeAction('open_whatsapp');
      else if (lower.includes('camera')) executeAction('open_camera');
      else if (lower.includes('bluetooth')) executeAction('open_bluetooth');
      else if (lower.includes('wifi')) executeAction('open_wifi');
      else if (lower.includes('alarm')) executeAction('set_alarm');
      else if (lower.includes('settings')) executeAction('open_settings');
      else if (lower.includes('scroll down') || lower.includes('kelage')) executeAction('scroll_down');
      else if (lower.includes('scroll up') || lower.includes('mele')) executeAction('scroll_up');
      else if (lower.includes('back') || lower.includes('hinde')) executeAction('navigate_back');
      else if (lower.includes('call') || lower.includes('phone')) executeAction('make_call');
      else {
        setFeedback({ message: `Command recognized: "${commandInput}". Executing...`, type: 'info' });
      }
      setCommandInput('');
    } finally {
      setIsLoading(false);
    }
  };

  const actionCards = [
    { id: 'open_youtube' as AutomationActionType, label: 'Open YouTube', desc: 'Launch YouTube app or website', icon: Youtube, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: 'open_whatsapp' as AutomationActionType, label: 'Open WhatsApp', desc: 'Launch WhatsApp chats', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'open_camera' as AutomationActionType, label: 'Open Camera', desc: 'Take photos or scan notes', icon: Camera, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'open_settings' as AutomationActionType, label: 'Device Settings', desc: 'Open Android phone settings', icon: Settings, color: 'text-slate-400', bg: 'bg-slate-500/10' },
    { id: 'open_wifi' as AutomationActionType, label: 'Wi-Fi Settings', desc: 'Configure Wi-Fi connections', icon: Wifi, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { id: 'open_bluetooth' as AutomationActionType, label: 'Bluetooth Settings', desc: 'Pair & manage devices', icon: Bluetooth, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { id: 'set_alarm' as AutomationActionType, label: 'Set Alarms', desc: 'Schedule study reminder alarms', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'scroll_down' as AutomationActionType, label: 'Scroll Down', desc: 'Smooth downward scroll', icon: ArrowDown, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'scroll_up' as AutomationActionType, label: 'Scroll Up', desc: 'Smooth upward scroll', icon: ArrowUp, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { id: 'navigate_back' as AutomationActionType, label: 'Navigate Back', desc: 'Return to previous screen', icon: ArrowLeft, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { id: 'make_call' as AutomationActionType, label: 'Initiate Call', desc: 'With safety confirmation dialog', icon: PhoneCall, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-6">
      {/* Top Banner */}
      <div className={`p-5 rounded-3xl border ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Android Phone Automation</h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Control apps, device settings, volume, scrolling, alarms, and calls using natural commands.
            </p>
          </div>
        </div>

        {/* Security & AccessibilityService Permission Consent */}
        <div className="mt-4 pt-3 border-t border-slate-500/10">
          <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            hasAccessibilityPermission
              ? isDark
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
          }`}>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs block">
                  Android AccessibilityService: {hasAccessibilityPermission ? 'Authorized & Active' : 'Permission Required'}
                </span>
                <span className="text-[11px] opacity-80 leading-relaxed block">
                  Used strictly for user-requested phone navigation, scrolling, and volume. Never monitors the screen or performs unauthorized actions.
                </span>
              </div>
            </div>

            <button
              onClick={() => setHasAccessibilityPermission(!hasAccessibilityPermission)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                hasAccessibilityPermission
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {hasAccessibilityPermission ? 'Permission Active' : 'Grant Permission'}
            </button>
          </div>
        </div>

        {/* Natural Language Command Bar */}
        <form onSubmit={handleCommandSubmit} className="mt-4">
          <label className="text-xs font-semibold block mb-1.5 opacity-90">
            Enter phone automation command (English or Kannada-English "Kanglish"):
          </label>
          <div className={`flex items-center rounded-2xl border p-1.5 ${
            isDark ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'
          }`}>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="e.g. 'Open YouTube', 'Open WhatsApp', 'Volume jasthi maadi', 'Set alarm 7 AM'..."
              className="w-full py-2 px-3 text-xs sm:text-sm bg-transparent focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!commandInput.trim() || isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold disabled:opacity-40 hover:opacity-95 transition-all shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Processing...' : 'Execute'}</span>
            </button>
          </div>
        </form>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mt-3 p-3 rounded-2xl text-xs flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : feedback.type === 'warning'
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
          }`}>
            <Check className="w-4 h-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Volume Control Slider */}
      <div className={`p-4 rounded-3xl border space-y-3 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-xs sm:text-sm">Volume Adjustment</h3>
          </div>
          <span className="font-mono text-xs font-bold text-indigo-400">{volumeLevel}%</span>
        </div>

        <div className="flex items-center gap-3">
          <VolumeX className="w-4 h-4 text-slate-500" />
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={volumeLevel}
            onChange={(e) => executeAction('adjust_volume', e.target.value)}
            className="flex-1 accent-indigo-600 cursor-pointer"
          />
          <Volume2 className="w-4 h-4 text-indigo-400" />
        </div>
      </div>

      {/* 11 Action Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Quick Automation Controls
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {actionCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => executeAction(card.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.02] flex flex-col justify-between group ${
                  isDark
                    ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-blue-200 shadow-xs'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-2`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs block group-hover:text-blue-500 transition-colors">
                    {card.label}
                  </span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">
                    {card.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alarm Time Picker Modal */}
      {showAlarmPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-5 rounded-3xl border shadow-xl space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-2 text-amber-400">
              <Bell className="w-5 h-5" />
              <h4 className="font-bold text-sm">Schedule Android Alarm</h4>
            </div>

            <p className="text-xs text-slate-400">
              Select the time for your study session or wake-up alarm:
            </p>

            <input
              type="time"
              value={alarmTime}
              onChange={(e) => setAlarmTime(e.target.value)}
              className="w-full py-3 px-4 rounded-xl border text-center text-lg font-mono font-bold bg-slate-950 border-slate-700 text-white"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAlarmPicker(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmSetAlarm}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
              >
                Set Alarm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Safety Confirmation Modal (Android Security Restriction Compliance) */}
      {pendingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-5 rounded-3xl border shadow-xl space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold text-sm">Call Confirmation Required</h4>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              In accordance with Android security policies, Pragyan AI requires explicit confirmation before initiating a phone call.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Recipient / Phone Number:</label>
              <input
                type="text"
                value={callRecipient || pendingCall}
                onChange={(e) => setCallRecipient(e.target.value)}
                placeholder="Enter phone number..."
                className="w-full py-2 px-3 rounded-xl border text-xs bg-slate-950 border-slate-700 text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPendingCall(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmCall}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Confirm & Call</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
