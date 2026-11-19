import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square,
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  Sliders,
  Radio,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { processVoiceQuestion } from '../services/api';
import { PragyanRobotLogo } from './PragyanRobotLogo';

interface VoiceViewProps {
  theme: 'dark' | 'light';
  voiceRate: number;
  voicePitch: number;
  autoReadVoice: boolean;
}

export const VoiceView: React.FC<VoiceViewProps> = ({
  theme,
  voiceRate,
  voicePitch,
  autoReadVoice,
}) => {
  const isDark = theme === 'dark';

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [spokenSpeech, setSpokenSpeech] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [detectedAction, setDetectedAction] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setErrorMessage(null);
          setHasMicPermission(true);
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let currentFinal = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentFinal += event.results[i][0].transcript;
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }

          if (currentFinal) {
            setTranscript(currentFinal);
            setInterimTranscript('');
          } else {
            setInterimTranscript(currentInterim);
          }
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          const errType = event?.error || 'unknown';

          if (errType === 'not-allowed' || errType === 'permission-denied') {
            setHasMicPermission(false);
            setErrorMessage('Microphone access was not granted by your browser or frame. You can use the Voice Input box below or tap any sample question!');
          } else if (errType === 'no-speech') {
            setErrorMessage('No speech detected. Please press the mic and speak clearly.');
          } else {
            setErrorMessage(`Voice recognition notice: ${errType}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e: any) {
        // Fallback gracefully without throwing
        console.warn('Speech recognition initialized in fallback mode');
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-To-Speech (TTS) Speaker function
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceRate || 1.0;
    utterance.pitch = voicePitch || 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Check microphone permission state on mount if supported
  useEffect(() => {
    if (navigator?.permissions?.query) {
      try {
        navigator.permissions
          .query({ name: 'microphone' as PermissionName })
          .then((status) => {
            if (status.state === 'denied') {
              setHasMicPermission(false);
            } else if (status.state === 'granted') {
              setHasMicPermission(true);
            }
          })
          .catch(() => {
            // Ignore permission query error
          });
      } catch {}
    }
  }, []);

  const toggleListening = async () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    stopSpeaking();
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);

    // If SpeechRecognition is supported and available, start it cleanly
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        return;
      } catch (err: any) {
        if (err?.name === 'InvalidStateError') {
          try {
            recognitionRef.current.stop();
          } catch {}
        } else {
          setHasMicPermission(false);
        }
      }
    }

    // If SpeechRecognition is unavailable or permission is restricted:
    // Seamlessly prompt with interactive Voice Input without throwing hardware errors
    setHasMicPermission(false);
    setErrorMessage('Microphone capture is restricted by the browser or frame. You can type or pick any question below, and Pragyan AI will generate and read the answer aloud!');
  };

  const handleSendVoiceQuery = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    stopSpeaking();

    try {
      const result = await processVoiceQuestion(text);
      setAiResponse(result.text);
      setSpokenSpeech(result.spokenSpeech);
      setDetectedAction(result.automationAction || null);

      if (autoReadVoice && result.spokenSpeech) {
        speakText(result.spokenSpeech);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Voice assistant could not process query.');
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Namaskara Pragyan, hegiddira?',
    'Open YouTube to study physics',
    'Open WhatsApp',
    'What is the formula for kinetic energy?',
    'Explain water cycle swalpa simple aagi',
    'Set alarm for 6:30 AM',
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-6">
      {/* Top Banner */}
      <div className={`p-5 rounded-3xl border text-center relative overflow-hidden ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <PragyanRobotLogo size={44} />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-2">
          <Radio className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>Speech Engine &bull; English & Kannada-English</span>
        </div>

        <h2 className="text-xl font-bold tracking-tight">Pragyan Voice Assistant</h2>
        <p className={`text-xs mt-1 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Speak naturally into your microphone in English or Kanglish. Pragyan AI listens, speaks answers aloud, and executes phone automation commands.
        </p>

        {/* Microphone Big Visualizer Button */}
        <div className="py-8 flex flex-col items-center justify-center relative">
          {/* Animated pulsing wave rings */}
          {isListening && (
            <div className="absolute flex items-center justify-center">
              <span className="w-40 h-40 rounded-full bg-blue-500/20 animate-ping" />
              <span className="w-32 h-32 rounded-full bg-indigo-500/25 animate-pulse" />
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={toggleListening}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                isListening
                  ? 'bg-rose-600 text-white shadow-rose-500/40 scale-110'
                  : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-indigo-500/30 hover:scale-105'
              }`}
            >
              {isListening ? (
                <MicOff className="w-10 h-10 animate-bounce" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>

            {/* Dedicated Stop Button (Active when speaking or listening) */}
            {(isListening || isSpeaking) && (
              <button
                onClick={() => {
                  if (isListening) toggleListening();
                  if (isSpeaking) stopSpeaking();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-600/90 text-white text-xs font-bold shadow-md hover:bg-rose-500 transition-all animate-pulse"
                title="Stop Audio / Listening"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Stop</span>
              </button>
            )}
          </div>

          <span className={`mt-4 text-xs font-bold tracking-wide ${
            isListening ? 'text-rose-400 animate-pulse' : isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            {isListening ? 'Listening... Speak your command now' : 'Tap Microphone to Speak'}
          </span>
        </div>

        {/* Detected Phone Automation Action Notification */}
        {detectedAction && (
          <div className="mt-2 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                Phone Action Recognized: <strong>{detectedAction.replace('_', ' ').toUpperCase()}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                if (detectedAction === 'open_youtube') window.location.href = 'vnd.youtube:';
                else if (detectedAction === 'open_whatsapp') window.location.href = 'whatsapp://send';
                else if (detectedAction === 'open_settings') window.location.href = 'intent:#Intent;action=android.settings.SETTINGS;end';
                else if (detectedAction === 'set_alarm') window.location.href = 'intent:#Intent;action=android.intent.action.SET_ALARM;end';
                else window.location.href = `intent:#Intent;action=android.settings.SETTINGS;end`;
              }}
              className="px-3 py-1 rounded-xl bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-500 transition-colors flex items-center gap-1 shrink-0"
            >
              <span>Execute</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Mic Permission Helper & Fallback Notice */}
        {hasMicPermission === false && (
          <div className="mt-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs text-left space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-sm">Microphone Permission Denied or Restricted</span>
                <p className="mt-0.5 text-xs text-amber-300/90 leading-relaxed">
                  Your browser or frame currently restricts live audio capture. Don't worry! You can use the Voice Input box below to ask any question, and Pragyan AI will generate and read the answer aloud using Text-To-Speech.
                </p>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={toggleListening}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/30 transition-colors"
              >
                Retry Microphone Access
              </button>
            </div>
          </div>
        )}

        {/* Fallback Direct Voice Query Input */}
        <div className="mt-5 pt-4 border-t border-slate-500/10 text-left">
          <label className="text-xs font-semibold block mb-1.5 opacity-90">
            Ask Voice Assistant (or type a question to hear it spoken):
          </label>
          <div className={`flex items-center rounded-2xl border p-1.5 ${
            isDark ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'
          }`}>
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendVoiceQuery(transcript)}
              placeholder="e.g. How does photosynthesis work? What is Einstein's theory of relativity?"
              className="w-full py-2 px-3 text-xs sm:text-sm bg-transparent focus:outline-hidden"
            />
            <button
              onClick={() => handleSendVoiceQuery(transcript)}
              disabled={!transcript.trim() || isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold disabled:opacity-40 hover:opacity-95 transition-all shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Voice AI</span>
            </button>
          </div>
        </div>

        {/* Live speech transcription preview */}
        {(interimTranscript) && (
          <div className={`mt-3 p-3 rounded-2xl border text-left text-xs ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider block mb-0.5">
              Listening in progress...
            </span>
            <p className="font-medium italic opacity-80">
              {interimTranscript}
            </p>
          </div>
        )}
      </div>

      {/* Suggested Spoken Prompts */}
      <div className="space-y-2">
        <span className={`text-xs font-semibold px-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Or tap a sample question to test:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTranscript(p);
                handleSendVoiceQuery(p);
              }}
              className={`p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between group ${
                isDark 
                  ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 text-slate-300 hover:text-white' 
                  : 'bg-white border-slate-200 hover:bg-blue-50/60 text-slate-700 hover:border-blue-200'
              }`}
            >
              <span>"{p}"</span>
              <Play className="w-3.5 h-3.5 text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className={`p-5 rounded-2xl border flex items-center gap-3 text-xs font-medium ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <Sparkles className="w-5 h-5 text-indigo-500 animate-spin" />
          <span>Pragyan AI is analyzing your voice question...</span>
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* AI Spoken Response Card */}
      {aiResponse && (
        <div className={`p-5 rounded-3xl border space-y-3.5 shadow-md ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-500/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm block">Voice Response</span>
                <span className="text-[10px] text-emerald-400 font-medium">Spoken synthesis ready</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {isSpeaking ? (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors shadow-xs"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Stop Audio</span>
                </button>
              ) : (
                <button
                  onClick={() => spokenSpeech && speakText(spokenSpeech)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Read Aloud</span>
                </button>
              )}
            </div>
          </div>

          {/* Spoken summary highlight */}
          {spokenSpeech && (
            <div className={`p-3.5 rounded-xl border text-xs leading-relaxed font-medium ${
              isDark ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}>
              <span className="text-[10px] uppercase font-bold tracking-wider block text-indigo-400 mb-1">
                Spoken Answer (TTS)
              </span>
              "{spokenSpeech}"
            </div>
          )}

          {/* Full Detailed Text */}
          <div className="text-xs leading-relaxed whitespace-pre-wrap pt-2">
            {aiResponse}
          </div>
        </div>
      )}
    </div>
  );
};
