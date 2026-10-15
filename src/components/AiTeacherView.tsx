import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Bot,
  AlertCircle,
  KeyRound,
  RefreshCw,
  Lightbulb,
  CheckCircle,
  Square,
  RotateCcw,
  VolumeX,
} from 'lucide-react';
import { ChatMessage, ChildProfile, Language } from '../types';
import { soundManager } from '../utils/sound';

interface AiTeacherViewProps {
  language: Language;
  profile: ChildProfile;
  initialPrompt?: string;
}

export const AiTeacherView: React.FC<AiTeacherViewProps> = ({
  language,
  profile,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiConfigured, setIsAiConfigured] = useState<boolean | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [activeAudioMsgId, setActiveAudioMsgId] = useState<string | null>(null);
  const [loadingAudioMsgId, setLoadingAudioMsgId] = useState<string | null>(null);
  const [speechStatusText, setSpeechStatusText] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Check backend AI status on mount
  useEffect(() => {
    checkAiStatus();
  }, []);

  const checkAiStatus = async () => {
    try {
      const res = await fetch('/api/ai-status');
      const data = await res.json();
      setIsAiConfigured(data.configured);
    } catch {
      setIsAiConfigured(false);
    }
  };

  // Setup initial welcome greeting
  useEffect(() => {
    const welcomeText =
      language === 'hi'
        ? `नमस्ते ${profile.name}! 🌟 मैं आपका एआई शिक्षक "गुरु स्टार" हूँ।\n\nमुझसे विज्ञान, गणित, अंतरिक्ष या प्रकृति के बारे में कोई भी प्रश्न पूछें! मेरी आवाज़ भी सुन सकते हैं!`
        : `Hello ${profile.name}! 🌟 I am "Guru Star", your friendly AI Teacher.\n\nAsk me anything about science, numbers, animals, or stars! You can also listen to my real natural voice!`;

    setMessages([
      {
        id: 'welcome',
        sender: 'teacher',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.1-flash-lite',
      },
    ]);
  }, [language, profile.name]);

  // Handle incoming initialPrompt
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== '') {
      setInputText(initialPrompt);
    }
  }, [initialPrompt]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAnyPlayingAudio();
    };
  }, []);

  const stopAnyPlayingAudio = () => {
    if (currentAudioElementRef.current) {
      currentAudioElementRef.current.pause();
      currentAudioElementRef.current = null;
    }
    soundManager.stopSpeaking();
    setActiveAudioMsgId(null);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isLoading) return;

    soundManager.playPop();
    stopAnyPlayingAudio();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          language,
          childName: profile.name,
        }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        soundManager.playStar();
        const teacherMsg: ChatMessage = {
          id: `teacher-${Date.now()}`,
          sender: 'teacher',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed || 'gemini-3.1-flash-lite',
        };
        setMessages((prev) => [...prev, teacherMsg]);
      } else {
        soundManager.playTryAgain();
        if (data.error === 'AI_KEY_NOT_CONFIGURED') {
          setIsAiConfigured(false);
        }
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          sender: 'teacher',
          text:
            data.friendlyMessage ||
            data.message ||
            (language === 'hi'
              ? 'गुरु स्टार से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।'
              : 'Could not connect to Guru Star. Please check connection and try again.'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          audioError: data.error,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      soundManager.playTryAgain();
      const networkMsg: ChatMessage = {
        id: `net-error-${Date.now()}`,
        sender: 'teacher',
        text:
          language === 'hi'
            ? 'सर्वर से संपर्क नहीं हो पाया। कृपया इंटरनेट कनेक्शन जांचें।'
            : 'Could not reach server. Please check your network connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, networkMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Play Natural AI Voice using Gemini 3.8 Flash Lite TTS
  const handlePlayNaturalVoice = async (msg: ChatMessage) => {
    soundManager.playPop();

    // If currently playing this message, stop it
    if (activeAudioMsgId === msg.id) {
      stopAnyPlayingAudio();
      return;
    }

    stopAnyPlayingAudio();
    setLoadingAudioMsgId(msg.id);

    try {
      // Check if we already cached the base64 audio on this message object
      if (msg.audioBase64) {
        playWavAudio(msg.id, msg.audioBase64);
        setLoadingAudioMsgId(null);
        return;
      }

      // Fetch natural TTS from backend
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: msg.text,
          language,
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok && data.audioBase64) {
        // Cache audio in message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id
              ? { ...m, audioBase64: data.audioBase64, audioSource: 'gemini-native' }
              : m
          )
        );
        playWavAudio(msg.id, data.audioBase64);
      } else {
        // Fallback to browser device speech synthesis if Gemini TTS had an issue
        console.warn('Falling back to device speech synthesis:', data.error);
        soundManager.speakText(msg.text, language);
        setActiveAudioMsgId(msg.id);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id ? { ...m, audioSource: 'device' } : m
          )
        );
      }
    } catch (err) {
      console.error('Audio request error:', err);
      soundManager.speakText(msg.text, language);
      setActiveAudioMsgId(msg.id);
    } finally {
      setLoadingAudioMsgId(null);
    }
  };

  const playWavAudio = (msgId: string, base64Audio: string) => {
    try {
      const audioUrl = `data:audio/wav;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      currentAudioElementRef.current = audio;

      audio.onplay = () => {
        setActiveAudioMsgId(msgId);
      };

      audio.onended = () => {
        setActiveAudioMsgId(null);
        currentAudioElementRef.current = null;
      };

      audio.onerror = () => {
        setActiveAudioMsgId(null);
        currentAudioElementRef.current = null;
      };

      audio.play().catch((err) => {
        console.warn('Audio play autoplay policy:', err);
        setActiveAudioMsgId(null);
      });
    } catch {
      setActiveAudioMsgId(null);
    }
  };

  // Reliable Voice Input using Web Speech API
  const toggleSpeechRecognition = () => {
    soundManager.playPop();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया टाइप करके पूछें।'
          : 'Voice input is not supported in this browser. Please type your question.'
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      setSpeechStatusText('');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechStatusText(
          language === 'hi' ? 'गुरु स्टार सुन रहे हैं... बोलिए...' : 'Guru Star is listening... speak now...'
        );
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setSpeechStatusText('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setSpeechStatusText('');
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechStatusText('');
    }
  };

  const samplePrompts =
    language === 'hi'
      ? [
          'इंद्रधनुष कैसे बनता है? 🌈',
          'चाँद गोल क्यों होता है? 🌕',
          'डायनासोर क्यों गायब हो गए? 🦕',
          'पौधे धूप से खाना कैसे बनाते हैं? 🌱',
          'हाथी की सूंड में कितनी ताकत होती है? 🐘',
        ]
      : [
          'How is a rainbow made? 🌈',
          'Why is the moon round? 🌕',
          'Why did dinosaurs disappear? 🦕',
          'How do plants make food from sun? 🌱',
          'How strong is an elephant trunk? 🐘',
        ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[720px] bg-slate-50 rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm">
      {/* AI Teacher Header */}
      <div className="bg-white px-4 py-3 border-b-2 border-purple-100 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-xs">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-sm text-slate-800">
                {language === 'hi' ? 'गुरु स्टार (AI Teacher)' : 'Guru Star (AI Teacher)'}
              </h2>
              {isAiConfigured ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  <CheckCircle className="w-3 h-3" />
                  Gemini Live
                </span>
              ) : isAiConfigured === false ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                  <KeyRound className="w-3 h-3" />
                  Key Required
                </span>
              ) : null}
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              {language === 'hi'
                ? 'प्राकृतिक एआई आवाज़ • जेमिनी 3.1 फ्लैश'
                : 'Natural AI Voice • Gemini 3.1 Flash'}
            </p>
          </div>
        </div>

        {/* Global Stop Speaking button if audio is currently playing */}
        {activeAudioMsgId && (
          <button
            onClick={stopAnyPlayingAudio}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-black text-xs border border-rose-300 animate-pulse"
            title="Stop Speaking"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'आवाज़ रोकें' : 'Stop Voice'}</span>
          </button>
        )}

        <button
          onClick={() => {
            soundManager.playPop();
            checkAiStatus();
          }}
          title="Refresh AI Status"
          className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Unconfigured Warning / Setup Explainer Banner */}
      {isAiConfigured === false && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">
              {language === 'hi'
                ? 'एआई कुंजी सेटअप (Parent/Admin Guide)'
                : 'API Key Configuration Required'}
            </p>
            <p className="text-[11px] text-amber-800">
              {language === 'hi'
                ? 'लाइव उत्तर और प्राकृतिक आवाज़ पाने के लिए AI Studio के Secrets में GEMINI_API_KEY जोड़ें।'
                : 'To enable dynamic model responses and natural AI speech, attach GEMINI_API_KEY in the AI Studio Secrets panel.'}
            </p>
          </div>
        </div>
      )}

      {/* Live speech feedback banner */}
      {speechStatusText && (
        <div className="bg-purple-100/90 border-b border-purple-200 px-3 py-1.5 text-xs text-purple-900 font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            {speechStatusText}
          </span>
          <button
            onClick={() => setIsListening(false)}
            className="text-[10px] font-black underline uppercase"
          >
            Done
          </button>
        </div>
      )}

      {/* Chat Messages Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 no-scrollbar">
        {messages.map((msg) => {
          const isTeacher = msg.sender === 'teacher';
          const isAudioLoading = loadingAudioMsgId === msg.id;
          const isAudioPlaying = activeAudioMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isTeacher ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[88%] rounded-3xl p-3.5 text-sm font-semibold shadow-xs transition-all ${
                  isTeacher
                    ? 'bg-white text-slate-800 border-2 border-purple-100 rounded-tl-xs'
                    : 'bg-indigo-600 text-white rounded-tr-xs shadow-md'
                }`}
              >
                {/* Text Content */}
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Footer with Voice Controls, Badges and Timestamp */}
                <div
                  className={`mt-2.5 pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[10px] ${
                    isTeacher
                      ? 'border-slate-100 text-slate-400'
                      : 'border-indigo-500/50 text-indigo-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && (
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md font-bold">
                        Gemini AI
                      </span>
                    )}
                  </div>

                  {isTeacher && (
                    <div className="flex items-center gap-1.5">
                      {/* Natural AI Voice Button */}
                      <button
                        onClick={() => handlePlayNaturalVoice(msg)}
                        disabled={isAudioLoading}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-xs transition-all shadow-xs ${
                          isAudioPlaying
                            ? 'bg-rose-500 text-white animate-pulse'
                            : isAudioLoading
                            ? 'bg-purple-100 text-purple-700 animate-pulse'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                        title={
                          isAudioPlaying
                            ? 'Stop Speaking'
                            : language === 'hi'
                            ? 'प्राकृतिक एआई आवाज़ में सुनें'
                            : 'Listen to Natural AI Voice'
                        }
                      >
                        {isAudioLoading ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>{language === 'hi' ? 'आवाज़ तैयार...' : 'Voice Loading...'}</span>
                          </>
                        ) : isAudioPlaying ? (
                          <>
                            <Square className="w-3 h-3 fill-white" />
                            <span>{language === 'hi' ? 'रोकें' : 'Stop'}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>
                              {msg.audioBase64
                                ? language === 'hi'
                                  ? 'पुनः सुनें'
                                  : 'Replay'
                                : language === 'hi'
                                ? 'प्राकृतिक आवाज़'
                                : 'Natural Voice'}
                            </span>
                          </>
                        )}
                      </button>

                      {/* Device voice alternative indicator if used */}
                      {msg.audioSource === 'device' && (
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">
                          Device Voice
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Sound wave visualizer when speaking */}
                {isAudioPlaying && (
                  <div className="mt-2 flex items-center gap-1 py-1 px-2 bg-purple-50 rounded-xl border border-purple-200">
                    <span className="w-1.5 h-3 bg-purple-600 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                    <span className="w-1.5 h-4 bg-purple-600 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                    <span className="w-1.5 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.45s]"></span>
                    <span className="text-[10px] font-black text-purple-800 ml-1.5">
                      {language === 'hi' ? 'गुरु स्टार बोल रहे हैं 🌟' : 'Guru Star Speaking 🌟'}
                    </span>
                  </div>
                )}
              </div>

              {/* Retry button on error messages */}
              {msg.audioError && (
                <button
                  onClick={() => handleSendMessage(inputText || 'Hello Guru Star')}
                  className="mt-1 flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 self-start"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{language === 'hi' ? 'पुनः प्रयास करें' : 'Retry Question'}</span>
                </button>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5 p-3.5 bg-white rounded-3xl border-2 border-purple-100 max-w-[80%] shadow-xs">
            <div className="w-7 h-7 rounded-2xl bg-purple-100 flex items-center justify-center animate-spin">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-black text-purple-900">
                {language === 'hi'
                  ? 'गुरु स्टार उत्तर तैयार कर रहे हैं...'
                  : 'Guru Star is crafting your answer...'}
              </p>
              <p className="text-[10px] text-purple-600 font-semibold">
                {language === 'hi'
                  ? 'जेमिनी एआई द्वारा संचालित'
                  : 'Grounded by Gemini 3.1 Flash'}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      <div className="bg-white/80 backdrop-blur-xs px-3 py-2 border-t border-slate-100">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mb-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === 'hi' ? 'सुझाए गए सवाल:' : 'Suggested questions:'}</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 text-xs font-bold whitespace-nowrap border border-slate-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t-2 border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2.5 rounded-2xl border-2 transition-all active:scale-95 ${
              isListening
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-md ring-2 ring-rose-300'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title={
              isListening
                ? 'Listening... tap to stop'
                : language === 'hi'
                ? 'बोलकर पूछें (Voice Input)'
                : 'Voice Input'
            }
          >
            {isListening ? (
              <MicOff className="w-5 h-5 animate-bounce" />
            ) : (
              <Mic className="w-5 h-5 text-indigo-600" />
            )}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? language === 'hi'
                  ? 'सुन रहा हूँ... बोलिए...'
                  : 'Listening to your voice...'
                : language === 'hi'
                ? 'गुरु स्टार से पूछें (उदा. सूरज क्यों चमकता है?)...'
                : 'Ask Guru Star (e.g. Why is the sky blue?)...'
            }
            disabled={isLoading}
            className="flex-1 px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none text-sm font-bold text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white"
          />

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold shadow-md border-b-2 border-indigo-800 active:scale-95 transition-all"
            title={language === 'hi' ? 'भेजें' : 'Send'}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
