import React from 'react';
import { Home, BookOpen, Bot, Award, Shield } from 'lucide-react';
import { Language } from '../types';
import { soundManager } from '../utils/sound';

export type TabType = 'home' | 'learn' | 'ai-teacher' | 'quiz' | 'parent';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  language,
}) => {
  const tabs: Array<{
    id: TabType;
    labelEn: string;
    labelHi: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    badge?: string;
  }> = [
    {
      id: 'home',
      labelEn: 'Home',
      labelHi: 'होम',
      icon: Home,
      color: 'text-indigo-600',
    },
    {
      id: 'learn',
      labelEn: 'Learn',
      labelHi: 'पढ़ाई',
      icon: BookOpen,
      color: 'text-sky-600',
    },
    {
      id: 'ai-teacher',
      labelEn: 'AI Teacher',
      labelHi: 'एआई गुरु',
      icon: Bot,
      color: 'text-purple-600',
      badge: 'AI',
    },
    {
      id: 'quiz',
      labelEn: 'Quiz',
      labelHi: 'क्विज़',
      icon: Award,
      color: 'text-amber-600',
    },
    {
      id: 'parent',
      labelEn: 'Parent Zone',
      labelHi: 'अभिभावक',
      icon: Shield,
      color: 'text-emerald-600',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 px-2 py-1.5 pb-safe shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playPop();
                onSelectTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all ${
                isActive
                  ? 'bg-indigo-50/90 text-indigo-700 font-extrabold scale-102'
                  : 'text-slate-500 hover:text-slate-800 font-semibold'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? `${tab.color} scale-110` : 'text-slate-400'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[9px] font-black px-1 py-0.2 rounded-full leading-none shadow-xs animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {language === 'hi' ? tab.labelHi : tab.labelEn}
              </span>

              {isActive && (
                <span className="absolute bottom-0 w-5 h-0.5 bg-indigo-600 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
