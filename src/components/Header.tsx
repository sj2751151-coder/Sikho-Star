import React, { useState } from 'react';
import { Star, Flame, Volume2, VolumeX, Globe, User, Check } from 'lucide-react';
import { ChildProfile, Language } from '../types';
import { soundManager } from '../utils/sound';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  stars: number;
  streak: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  profile: ChildProfile;
  onUpdateProfile: (profile: ChildProfile) => void;
}

const AVATARS = [
  { id: 'star', label: 'Star', emoji: '⭐' },
  { id: 'lion', label: 'Lion', emoji: '🦁' },
  { id: 'robot', label: 'Robot', emoji: '🤖' },
  { id: 'bunny', label: 'Bunny', emoji: '🐰' },
  { id: 'astronaut', label: 'Astronaut', emoji: '🚀' },
  { id: 'owl', label: 'Owl', emoji: '🦉' },
];

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  stars,
  streak,
  soundEnabled,
  onToggleSound,
  profile,
  onUpdateProfile,
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempAvatar, setTempAvatar] = useState(profile.avatar);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playPop();
    onUpdateProfile({
      ...profile,
      name: tempName.trim() || 'Star Kid',
      avatar: tempAvatar,
    });
    setShowProfileModal(false);
  };

  const currentAvatarEmoji =
    AVATARS.find((a) => a.id === profile.avatar)?.emoji || '⭐';

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-indigo-100 px-3 py-2.5 sm:px-4 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          {/* Logo & Avatar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playPop();
                setTempName(profile.name);
                setTempAvatar(profile.avatar);
                setShowProfileModal(true);
              }}
              className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 shadow-sm border-2 border-amber-400 active:scale-95 transition-transform"
              title="Change Profile"
            >
              <span className="text-xl">{currentAvatarEmoji}</span>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </button>

            <div>
              <div className="flex items-center gap-1">
                <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                  SeekhoStar
                </span>
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full border border-amber-200">
                  {language === 'hi' ? 'सीखो' : 'Kids'}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 leading-none">
                {language === 'hi' ? `नमस्ते, ${profile.name}!` : `Hi, ${profile.name}!`}
              </p>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Stars pill */}
            <div
              className="flex items-center gap-1 bg-amber-100/90 border border-amber-300 text-amber-900 px-2.5 py-1 rounded-full text-xs font-black shadow-xs"
              title="Total Stars Earned"
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600 animate-pulse" />
              <span>{stars}</span>
            </div>

            {/* Streak pill */}
            <div
              className="hidden xs:flex items-center gap-1 bg-orange-100/90 border border-orange-300 text-orange-900 px-2 py-1 rounded-full text-xs font-black shadow-xs"
              title="Daily Learning Streak"
            >
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-600" />
              <span>{streak}d</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                soundManager.playPop();
                onToggleSound();
              }}
              className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
              title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Language Switch */}
            <button
              onClick={() => {
                soundManager.playPop();
                onLanguageChange(language === 'en' ? 'hi' : 'en');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all border-b-2 border-indigo-800"
              title="Change Language (English / हिन्दी)"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'हिन्दी' : 'ENG'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Child Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border-4 border-amber-300 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display text-lg font-bold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                {language === 'hi' ? 'मेरी प्रोफाइल' : 'My Kid Profile'}
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  {language === 'hi' ? 'बच्चे का नाम' : "Child's Name"}
                </label>
                <input
                  type="text"
                  maxLength={18}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="e.g. Aarav, Ananya, Kabir"
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none font-bold text-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  {language === 'hi' ? 'पसंदीदा अवतार चुनें' : 'Choose Your Star Avatar'}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        soundManager.playPop();
                        setTempAvatar(av.id);
                      }}
                      className={`flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all ${
                        tempAvatar === av.id
                          ? 'border-amber-500 bg-amber-50 shadow-sm scale-105'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl mb-1">{av.emoji}</span>
                      <span className="text-[11px] font-bold text-slate-700">{av.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-slate-600 text-sm hover:bg-slate-50"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md border-b-4 border-indigo-800 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {language === 'hi' ? 'सुरक्षित करें' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
