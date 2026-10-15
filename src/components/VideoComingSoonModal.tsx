import React from 'react';
import { Film, Sparkles, Bell, Clock, Lock } from 'lucide-react';
import { Language } from '../types';
import { soundManager } from '../utils/sound';

interface VideoComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const VideoComingSoonModal: React.FC<VideoComingSoonModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  const upcomingEpisodes = [
    {
      titleEn: 'Animated Hindi Varnamala Adventures',
      titleHi: 'एनिमेटेड हिन्दी वर्णमाला की जादुई दुनिया',
      category: 'Hindi',
      duration: '4 mins',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: '🍎',
    },
    {
      titleEn: 'Phonics Safari: Letters A to Z',
      titleHi: 'फोनिक्स सफारी: A से Z का संगीत',
      category: 'English',
      duration: '5 mins',
      color: 'bg-sky-100 text-sky-800 border-sky-300',
      icon: '🦁',
    },
    {
      titleEn: 'Number Jungle: Counting 1 to 20',
      titleHi: 'नंबर जंगल: १ से २० तक की गिनती',
      category: 'Math',
      duration: '6 mins',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: '🔢',
    },
    {
      titleEn: 'Little Astronaut: Journey to the Moon',
      titleHi: 'नन्हा अंतरिक्ष यात्री: चाँद की रोमांचक सैर',
      category: 'Science',
      duration: '7 mins',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: '🚀',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border-4 border-indigo-200 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display text-lg font-bold text-slate-800">
                  {language === 'hi' ? 'वीडियो शिक्षण कक्ष' : 'Video Learning Lab'}
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                  {language === 'hi' ? 'शीघ्र आ रहा है' : 'Coming Soon'}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                {language === 'hi'
                  ? 'सुरक्षित एवं बाल-अनुकूल एनिमेटेड वीडियो'
                  : 'Safe, curated animated lessons in production'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Hero preview graphic */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white relative overflow-hidden shadow-md">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-extrabold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {language === 'hi' ? 'उच्च गुणवत्ता सामग्री' : 'Zero-Ad Child Safe Content'}
            </span>
            <h4 className="font-display text-lg font-black leading-snug">
              {language === 'hi'
                ? 'कोई यूट्यूब विज्ञापन नहीं, 100% सुरक्षित!'
                : 'No external ads or distracting algorithms.'}
            </h4>
            <p className="text-xs text-white/90 mt-1">
              {language === 'hi'
                ? 'हमारे एनिमेटर बाल-वैज्ञानिकों के साथ मिलकर मजेदार कहानियाँ और पाठ तैयार कर रहे हैं।'
                : 'Interactive curated video lessons are being built directly for SeekhoStar Android & Web.'}
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 pointer-events-none">
            🎬
          </div>
        </div>

        {/* Upcoming list */}
        <div className="mt-4">
          <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {language === 'hi' ? 'आगामी एनिमेटेड पाठ' : 'Upcoming Video Episodes'}
          </h5>

          <div className="space-y-2.5">
            {upcomingEpisodes.map((ep, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl border-2 border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-xs">
                    {ep.icon}
                  </div>
                  <div>
                    <h6 className="text-xs font-bold text-slate-800 line-clamp-1">
                      {language === 'hi' ? ep.titleHi : ep.titleEn}
                    </h6>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${ep.color}`}>
                        {ep.category}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> {ep.duration}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-1.5 rounded-xl bg-slate-200/80 text-slate-500">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notify Parent banner */}
        <div className="mt-5 p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-900 leading-tight">
              {language === 'hi'
                ? 'अपडेट आने पर माता-पिता को सूचित किया जाएगा।'
                : 'Parents will receive early access notification upon release.'}
            </p>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              alert(
                language === 'hi'
                  ? 'धन्यवाद! नई वीडियो कक्षाएं आते ही आपको सूचित किया जाएगा।'
                  : 'Thank you! You will be notified when animated video modules launch.'
              );
            }}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-xs"
          >
            {language === 'hi' ? 'याद रखें' : 'Notify'}
          </button>
        </div>

        {/* Close Button */}
        <div className="mt-4">
          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-sm"
          >
            {language === 'hi' ? 'समझ गया' : 'Got It, Let’s Learn!'}
          </button>
        </div>
      </div>
    </div>
  );
};
