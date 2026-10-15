import React from 'react';
import {
  Sparkles,
  Bot,
  ArrowRight,
  Award,
  Film,
  CheckCircle2,
  HardDrive,
  Flame,
  Star,
  Brain,
  Compass,
} from 'lucide-react';
import { ChildProfile, Language, SubjectId, UserProgress } from '../types';
import { SUBJECT_MODULES } from '../data/lessons';
import { soundManager } from '../utils/sound';

interface HomeViewProps {
  language: Language;
  profile: ChildProfile;
  progress: UserProgress;
  onNavigateToLearn: (subjectId?: SubjectId) => void;
  onNavigateToAiTeacher: (initialPrompt?: string) => void;
  onNavigateToQuiz: (subjectId?: SubjectId) => void;
  onOpenVideoComingSoon: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  profile,
  progress,
  onNavigateToLearn,
  onNavigateToAiTeacher,
  onNavigateToQuiz,
  onOpenVideoComingSoon,
}) => {
  const suggestedQuestions =
    language === 'hi'
      ? [
          { text: 'आसमान नीला क्यों होता है?', emoji: '🌤️' },
          { text: 'तारे रात में क्यों चमकते हैं?', emoji: '✨' },
          { text: 'हाथी की सूंड कैसे काम करती है?', emoji: '🐘' },
          { text: 'मुझे एक मजेदार गणित पहेली बताओ!', emoji: '🔢' },
        ]
      : [
          { text: 'Why is the sky blue?', emoji: '🌤️' },
          { text: 'Why do stars twinkle at night?', emoji: '✨' },
          { text: 'How do birds fly so high?', emoji: '🦅' },
          { text: 'Tell me a cool math puzzle!', emoji: '🔢' },
        ];

  const totalLessonsCount = SUBJECT_MODULES.reduce(
    (acc, s) => acc + s.topics.length,
    0
  );

  return (
    <div className="space-y-5 pb-6">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-5 text-white shadow-lg border-2 border-indigo-400">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {language === 'hi' ? 'सीखने का उत्सव' : 'Learning Adventure'}
            </span>
            <div className="flex items-center gap-1 bg-amber-400/30 px-2.5 py-1 rounded-full text-xs font-black">
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>
                {progress.streakDays}{' '}
                {language === 'hi' ? 'दिन लगातार' : 'Day Streak'}
              </span>
            </div>
          </div>

          <h1 className="font-display text-2xl font-black leading-tight sm:text-3xl">
            {language === 'hi'
              ? `नमस्ते, ${profile.name}! 🌟`
              : `Hello, ${profile.name}! 🌟`}
          </h1>
          <p className="mt-1 text-sm text-indigo-100 font-medium">
            {language === 'hi'
              ? 'आज आप कौन सी नई जादुई चीज़ सीखना चाहते हैं?'
              : 'What exciting wonder would you like to explore today?'}
          </p>

          {/* Quick Action Pill */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                soundManager.playPop();
                onNavigateToLearn();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs shadow-md border-b-2 border-amber-600 active:scale-95 transition-all"
            >
              <Compass className="w-4 h-4" />
              {language === 'hi' ? 'पाठ शुरू करें' : 'Explore Lessons'}
            </button>
            <button
              onClick={() => {
                soundManager.playPop();
                onNavigateToQuiz();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-black text-xs backdrop-blur-md active:scale-95 transition-all"
            >
              <Award className="w-4 h-4 text-amber-300" />
              {language === 'hi' ? 'क्विज़ खेलें' : 'Play Quiz'}
            </button>
          </div>
        </div>

        {/* Decorative Floating shapes */}
        <div className="absolute -right-3 -bottom-5 text-8xl opacity-20 pointer-events-none select-none">
          🚀
        </div>
      </section>

      {/* AI Teacher Hero Card */}
      <section className="rounded-3xl border-3 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4.5 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-md border-2 border-purple-300">
              <Bot className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-lg font-black text-purple-950">
                  {language === 'hi' ? 'गुरु स्टार (AI Teacher)' : 'Guru Star (AI Teacher)'}
                </h2>
                <span className="bg-purple-200 text-purple-900 text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase">
                  Live AI
                </span>
              </div>
              <p className="text-xs text-purple-700 font-semibold">
                {language === 'hi'
                  ? 'मुझसे कोई भी सवाल पूछें, मैं आसान भाषा में समझाऊंगा!'
                  : 'Ask me anything! Simple answers with kid-friendly examples.'}
              </p>
            </div>
          </div>
        </div>

        {/* Suggested Prompt Chips */}
        <div className="mt-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-800/80 mb-2">
            {language === 'hi' ? '💡 पूछकर देखें:' : '💡 Try asking:'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.slice(0, 3).map((sq, i) => (
              <button
                key={i}
                onClick={() => {
                  soundManager.playPop();
                  onNavigateToAiTeacher(sq.text);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <span>{sq.emoji}</span>
                <span className="truncate max-w-[200px]">{sq.text}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playPop();
            onNavigateToAiTeacher();
          }}
          className="mt-4 w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md border-b-4 border-purple-800 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>{language === 'hi' ? 'गुरु स्टार से बात करें' : 'Talk with Guru Star'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Learning Categories Grid */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="font-display text-lg font-black text-slate-800">
              {language === 'hi' ? 'विषय चुनें' : 'Learning Subjects'}
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              {language === 'hi'
                ? 'हिन्दी, इंग्लिश, गणित और विज्ञान'
                : 'Hindi, English, Math and Science'}
            </p>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              onNavigateToLearn();
            }}
            className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>{language === 'hi' ? 'सभी देखें' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {SUBJECT_MODULES.map((subject) => {
            const completedCount = subject.topics.filter((t) =>
              progress.completedLessons.includes(t.id)
            ).length;

            return (
              <button
                key={subject.id}
                onClick={() => {
                  soundManager.playPop();
                  onNavigateToLearn(subject.id);
                }}
                className={`flex flex-col text-left p-3.5 rounded-3xl border-2 ${subject.borderColor} ${subject.bgGradient} shadow-sm hover:shadow-md transition-all active:scale-97 group`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-3xl p-1 rounded-2xl bg-white shadow-xs">
                    {subject.icon}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700">
                    {completedCount}/{subject.topics.length}
                  </span>
                </div>

                <h3 className="font-display font-black text-base text-slate-900 group-hover:text-indigo-700 transition-colors">
                  {language === 'hi' ? subject.nameHi : subject.nameEn}
                </h3>
                <p className="text-[11px] font-bold text-slate-600 mt-0.5 line-clamp-1">
                  {language === 'hi' ? subject.badgeHi : subject.badgeEn}
                </p>

                <div className="mt-3 flex items-center justify-between w-full pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] font-black text-indigo-600 flex items-center gap-1">
                    {language === 'hi' ? 'पढ़ाई करें' : 'Learn'}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  {completedCount === subject.topics.length && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Quiz & Games Section */}
      <section className="rounded-3xl border-2 border-amber-200 bg-amber-50/80 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-black text-amber-950">
                {language === 'hi' ? 'क्विज़ और चुनौतियाँ' : 'Quiz & Brain Games'}
              </h3>
              <p className="text-[11px] font-bold text-amber-800">
                {language === 'hi'
                  ? 'सही उत्तर दें और चमकदार सितारे जीतें!'
                  : 'Answer correctly and win shiny stars!'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SUBJECT_MODULES.map((sub) => (
            <button
              key={`quiz-shortcut-${sub.id}`}
              onClick={() => {
                soundManager.playPop();
                onNavigateToQuiz(sub.id);
              }}
              className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-amber-200 hover:border-amber-300 shadow-xs hover:shadow-sm active:scale-95 transition-all text-left"
            >
              <span className="text-xl">{sub.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-800 truncate">
                  {language === 'hi' ? `${sub.nameHi} क्विज़` : `${sub.nameEn} Quiz`}
                </p>
                <p className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>+15 Stars</span>
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Video Learning Section (with Coming Soon label as requested) */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-black text-rose-950">
                  {language === 'hi' ? 'वीडियो शिक्षण' : 'Video Learning Lab'}
                </h3>
                <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  {language === 'hi' ? 'शीघ्र आ रहा है' : 'Coming Soon'}
                </span>
              </div>
              <p className="text-xs font-semibold text-rose-700 mt-0.5">
                {language === 'hi'
                  ? 'सुरक्षित एनिमेटेड पाठ, कोई भ्रामक यूट्यूब विज्ञापन नहीं।'
                  : 'Distraction-free animated video lessons in preparation.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-rose-200/70 flex items-center justify-between">
          <span className="text-[11px] font-bold text-rose-800">
            {language === 'hi' ? '४ आगामी कार्टून पाठ तैयार हो रहे हैं' : '4 Animated episodes in preview'}
          </span>
          <button
            onClick={() => {
              soundManager.playPop();
              onOpenVideoComingSoon();
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-300 shadow-xs"
          >
            {language === 'hi' ? 'झलक देखें' : 'Preview Topics'}
          </button>
        </div>
      </section>

      {/* Progress & Transparency Card */}
      <section className="rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-black text-slate-800">
                {language === 'hi' ? 'मेरी प्रगति रिपोर्ट' : 'My Learning Progress'}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                {language === 'hi'
                  ? `${progress.completedLessons.length} में से ${totalLessonsCount} पाठ पूरे किए`
                  : `${progress.completedLessons.length} of ${totalLessonsCount} lessons mastered`}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-display text-xl font-black text-amber-500">
              ⭐ {progress.totalStars}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="bg-gradient-to-r from-amber-400 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(
                100,
                Math.round(
                  (progress.completedLessons.length / Math.max(1, totalLessonsCount)) *
                    100
                )
              )}%`,
            }}
          ></div>
        </div>

        {/* Honest Local Storage indicator */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-bold">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            {language === 'hi'
              ? 'प्रगति इस डिवाइस पर सुरक्षित रूप से सहेजी गई है'
              : 'Progress saved locally on this device'}
          </span>
          <span className="text-emerald-600 font-black">
            {language === 'hi' ? 'सुरक्षित एवं निजी' : 'Offline Ready'}
          </span>
        </div>
      </section>
    </div>
  );
};
