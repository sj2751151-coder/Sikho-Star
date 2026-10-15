import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Clock,
  Award,
  HardDrive,
  RotateCcw,
  Sparkles,
  BookOpen,
  Volume2,
  AlertTriangle,
  CheckCircle,
  Trophy,
} from 'lucide-react';
import { ChildProfile, Language, UserProgress } from '../types';
import { SUBJECT_MODULES } from '../data/lessons';
import { soundManager } from '../utils/sound';

interface ParentViewProps {
  language: Language;
  profile: ChildProfile;
  progress: UserProgress;
  onResetProgress: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const ParentView: React.FC<ParentViewProps> = ({
  language,
  profile,
  progress,
  onResetProgress,
  soundEnabled,
  onToggleSound,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mathNum1] = useState(7);
  const [mathNum2] = useState(8);
  const [userAnswer, setUserAnswer] = useState('');
  const [lockError, setLockError] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(12);

  // Track session screen time
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionMinutes((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playPop();
    if (parseInt(userAnswer.trim(), 10) === mathNum1 + mathNum2) {
      soundManager.playStar();
      setIsUnlocked(true);
      setLockError(false);
    } else {
      soundManager.playTryAgain();
      setLockError(true);
    }
  };

  const handleResetConfirm = () => {
    soundManager.playPop();
    const confirmed = window.confirm(
      language === 'hi'
        ? 'क्या आप सचमुच सभी पाठ और क्विज़ स्कोर रीसेट करना चाहते हैं?'
        : 'Are you sure you want to reset all learning progress and stars?'
    );
    if (confirmed) {
      onResetProgress();
    }
  };

  if (!isUnlocked) {
    return (
      <div className="bg-white rounded-3xl p-6 border-3 border-indigo-200 shadow-md text-center space-y-4 max-w-sm mx-auto my-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="font-display text-xl font-black text-slate-900">
            {language === 'hi' ? 'अभिभावक सुरक्षा लॉक' : 'Parent Gate'}
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {language === 'hi'
              ? 'प्रगति और सेटिंग्स देखने के लिए गणित का हल दर्ज करें'
              : 'Please solve this quick problem to verify you are a parent'}
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-3 pt-2">
          <div className="p-3 bg-slate-100 rounded-2xl font-mono text-lg font-black text-slate-800">
            {mathNum1} + {mathNum2} = ?
          </div>

          <input
            type="number"
            value={userAnswer}
            onChange={(e) => {
              setUserAnswer(e.target.value);
              setLockError(false);
            }}
            placeholder={language === 'hi' ? 'उत्तर दर्ज करें' : 'Enter answer'}
            className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 text-center text-base font-bold focus:border-indigo-500 focus:outline-none"
            autoFocus
          />

          {lockError && (
            <p className="text-xs font-bold text-rose-600">
              {language === 'hi'
                ? 'गलत उत्तर। कृपया पुनः प्रयास करें।'
                : 'Incorrect answer. Please try again.'}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md border-b-2 border-indigo-800"
          >
            {language === 'hi' ? 'प्रवेश करें' : 'Unlock Parent Area'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-black">
                {language === 'hi' ? 'अभिभावक डैशबोर्ड' : 'Parent Dashboard'}
              </h2>
              <span className="bg-white/20 text-[10px] font-black px-2 py-0.5 rounded-full">
                Protected
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium">
              {language === 'hi'
                ? `${profile.name} की सीखने की प्रगति एवं सुरक्षा नियंत्रण`
                : `Progress & safety insights for ${profile.name}`}
            </p>
          </div>
        </div>
      </div>

      {/* Screen Time & Stars Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800">
              {sessionMinutes} {language === 'hi' ? 'मिनट' : 'mins'}
            </span>
            <p className="text-[11px] font-bold text-slate-500">
              {language === 'hi' ? 'आज का स्क्रीन समय' : "Today's App Time"}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-800">
              {progress.totalStars} ⭐
            </span>
            <p className="text-[11px] font-bold text-slate-500">
              {language === 'hi' ? 'कुल अर्जित सितारे' : 'Total Stars'}
            </p>
          </div>
        </div>
      </div>

      {/* Subject-Wise Mastery */}
      <div className="bg-white rounded-3xl p-4.5 border-2 border-slate-200 shadow-xs space-y-3">
        <h3 className="font-display text-base font-black text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          {language === 'hi' ? 'विषय अनुसार प्रगति' : 'Subject Mastery Breakdown'}
        </h3>

        <div className="space-y-3">
          {SUBJECT_MODULES.map((sub) => {
            const completed = sub.topics.filter((t) =>
              progress.completedLessons.includes(t.id)
            ).length;
            const pct = Math.round((completed / sub.topics.length) * 100);

            return (
              <div key={sub.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span>{sub.icon}</span>
                    <span>{language === 'hi' ? sub.nameHi : sub.nameEn}</span>
                  </span>
                  <span>
                    {completed}/{sub.topics.length} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Course Certificates & Milestones */}
      <div className="bg-white rounded-3xl p-4.5 border-2 border-slate-200 shadow-xs space-y-3">
        <h3 className="font-display text-base font-black text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          {language === 'hi' ? 'पाठ्यक्रम प्रमाणपत्र (Course Certificates)' : 'Earned Course Certificates'}
        </h3>

        {progress.unlockedCertificates.length === 0 ? (
          <p className="text-xs text-slate-500 font-semibold py-1">
            {language === 'hi'
              ? 'किसी विषय के सभी पाठ पूरे करने पर विशेष प्रमाणपत्र अनलॉक होगा।'
              : 'Complete all lessons in a subject to unlock official star certificates!'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {progress.unlockedCertificates.map((cert) => (
              <div
                key={cert}
                className="p-2.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-center gap-2 text-xs font-black text-amber-950"
              >
                <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="capitalize">{cert.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quiz Attempt History */}
      <div className="bg-white rounded-3xl p-4.5 border-2 border-slate-200 shadow-xs space-y-3">
        <h3 className="font-display text-base font-black text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          {language === 'hi' ? 'हालिया क्विज़ इतिहास' : 'Recent Quiz Attempts'}
        </h3>

        {progress.quizHistory.length === 0 ? (
          <p className="text-xs text-slate-400 font-semibold py-2 text-center">
            {language === 'hi'
              ? 'अभी तक कोई क्विज़ नहीं खेला गया।'
              : 'No quizzes taken yet.'}
          </p>
        ) : (
          <div className="space-y-2">
            {progress.quizHistory.slice(0, 4).map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 capitalize">
                    {q.subjectId} Quiz
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(q.date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {q.score}/{q.total}
                  </span>
                  <span className="font-bold text-amber-600">
                    +{q.starsEarned} ⭐
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Child Safety & Honest Storage Notice */}
      <div className="bg-indigo-50/70 rounded-3xl p-4 border-2 border-indigo-200 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
          <HardDrive className="w-4 h-4 text-indigo-600" />
          <span>
            {language === 'hi'
              ? 'डेटा भंडारण एवं गोपनीयता नीति'
              : 'Data Storage & Child Privacy'}
          </span>
        </div>
        <ul className="space-y-1.5 text-slate-600 font-semibold text-[11px] list-disc list-inside">
          <li>
            <strong className="text-slate-800">
              {language === 'hi' ? 'स्थानीय भंडारण:' : 'Local Storage Only:'}
            </strong>{' '}
            {language === 'hi'
              ? 'सभी क्विज़ स्कोर और प्रगति केवल इसी डिवाइस के ब्राउज़र में रहती है।'
              : 'All lesson progress and quiz scores are kept solely in this device’s local browser.'}
          </li>
          <li>
            <strong className="text-slate-800">
              {language === 'hi' ? 'क्लाउड सिंक:' : 'Cloud Sync:'}
            </strong>{' '}
            {language === 'hi'
              ? 'कोई क्लाउड डेटाबेस सिंक सक्रिय नहीं है। किसी खाते या पासवर्ड की आवश्यकता नहीं।'
              : 'No cloud database sync is enabled. No child login or personal data is collected.'}
          </li>
          <li>
            <strong className="text-slate-800">
              {language === 'hi' ? 'विज्ञापन रहित:' : 'Zero Ads:'}
            </strong>{' '}
            {language === 'hi'
              ? 'बच्चों के लिए 100% सुरक्षित और ध्यान भटकाने वाले विज्ञापनों से मुक्त।'
              : '100% ad-free, child-safe environment.'}
          </li>
        </ul>
      </div>

      {/* Settings & Reset Controls */}
      <div className="bg-white rounded-3xl p-4.5 border-2 border-slate-200 shadow-xs space-y-3">
        <h3 className="font-display text-base font-black text-slate-900">
          {language === 'hi' ? 'नियंत्रण एवं रीसेट' : 'Settings & Controls'}
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-slate-500" />
            {language === 'hi' ? 'ऑडियो ध्वनि प्रभाव' : 'Sound Effects'}
          </span>
          <button
            onClick={() => {
              soundManager.playPop();
              onToggleSound();
            }}
            className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-colors ${
              soundEnabled
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {soundEnabled
              ? language === 'hi'
                ? 'चालू (On)'
                : 'On'
              : language === 'hi'
              ? 'बंद (Off)'
              : 'Off'}
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={handleResetConfirm}
            className="w-full py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>
              {language === 'hi' ? 'सभी प्रगति रीसेट करें' : 'Reset All Progress'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
