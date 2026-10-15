import React, { useState } from 'react';
import {
  Volume2,
  CheckCircle2,
  Star,
  Award,
  ArrowLeft,
  Sparkles,
  Lock,
  RotateCcw,
  Trophy,
  Flame,
  Check,
} from 'lucide-react';
import { Language, LessonTopic, SubjectId, SubjectModule, UserProgress } from '../types';
import { SUBJECT_MODULES, ALL_LESSON_TOPICS } from '../data/lessons';
import { soundManager } from '../utils/sound';
import { isTopicUnlocked, getSubjectProgressStats } from '../utils/storage';

interface LearnViewProps {
  language: Language;
  initialSubjectId?: SubjectId;
  progress: UserProgress;
  onLessonCompleteOrReplay: (topic: LessonTopic) => void;
  onNavigateToQuiz: (subjectId: SubjectId) => void;
  onAskAiAboutTopic: (topicTitle: string) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  language,
  initialSubjectId = 'hindi',
  progress,
  onLessonCompleteOrReplay,
  onNavigateToQuiz,
  onAskAiAboutTopic,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>(initialSubjectId);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  const currentSubject: SubjectModule =
    SUBJECT_MODULES.find((s) => s.id === selectedSubjectId) || SUBJECT_MODULES[0];

  const activeTopic = activeTopicId
    ? currentSubject.topics.find((t) => t.id === activeTopicId)
    : null;

  const subjectStats = getSubjectProgressStats(
    currentSubject.id,
    progress.completedLessons,
    currentSubject.topics
  );

  const totalAppLessons = ALL_LESSON_TOPICS.length;
  const totalCompletedInApp = ALL_LESSON_TOPICS.filter((t) =>
    progress.completedLessons.includes(t.id)
  ).length;
  const isAllAppCompleted = totalCompletedInApp === totalAppLessons;

  const isCompleted = (topicId: string) => progress.completedLessons.includes(topicId);

  return (
    <div className="space-y-4 pb-6">
      {/* Subject Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {SUBJECT_MODULES.map((sub) => {
          const isSelected = sub.id === selectedSubjectId;
          const stats = getSubjectProgressStats(sub.id, progress.completedLessons, sub.topics);

          return (
            <button
              key={sub.id}
              onClick={() => {
                soundManager.playPop();
                setSelectedSubjectId(sub.id);
                setActiveTopicId(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl whitespace-nowrap font-black text-xs transition-all active:scale-95 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md border-b-2 border-indigo-800'
                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-base">{sub.icon}</span>
              <span>{language === 'hi' ? sub.nameHi : sub.nameEn}</span>
              {stats.isComplete && (
                <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.2 rounded-full">
                  ✓ Done
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {!activeTopic ? (
        /* Topic List for Selected Subject */
        <div className="space-y-3">
          {/* Subject Progress Banner */}
          <div
            className={`p-4 rounded-3xl border-2 ${currentSubject.borderColor} ${currentSubject.bgGradient} shadow-sm space-y-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-white shadow-xs">
                  {currentSubject.icon}
                </span>
                <div>
                  <h2 className="font-display text-xl font-black text-slate-900">
                    {language === 'hi' ? currentSubject.nameHi : currentSubject.nameEn}
                  </h2>
                  <p className="text-xs font-bold text-slate-600">
                    {language === 'hi' ? currentSubject.badgeHi : currentSubject.badgeEn}
                  </p>
                </div>
              </div>

              {/* Subject Quiz Shortcut */}
              <button
                onClick={() => {
                  soundManager.playPop();
                  onNavigateToQuiz(currentSubject.id);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs shadow-sm border-b-2 border-amber-600 active:scale-95"
              >
                <Award className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'क्विज़' : 'Quiz'}</span>
              </button>
            </div>

            {/* Subject-specific accurate completion bar */}
            <div className="bg-white/80 p-3 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">
                  {language === 'hi' ? 'कोर्स प्रगति:' : 'Course Progress:'}
                </span>
                <span className="text-indigo-700 font-black">
                  {subjectStats.completed} / {subjectStats.total}{' '}
                  {language === 'hi' ? 'पाठ पूर्ण' : 'lessons'} ({subjectStats.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${subjectStats.percentage}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold flex items-center justify-between">
                <span>
                  {language === 'hi'
                    ? `कुल ऐप सामग्री: ${totalCompletedInApp}/${totalAppLessons} पाठ`
                    : `Total App Content: ${totalCompletedInApp}/${totalAppLessons} completed`}
                </span>
                {subjectStats.isComplete && (
                  <span className="text-emerald-700 font-black flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {language === 'hi' ? 'कोर्स महारत प्राप्त!' : 'Course Mastered!'}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Grand Academy Completion Celebration Banner if all app lessons done */}
          {isAllAppCompleted && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 border-2 border-amber-500 text-amber-950 shadow-md animate-bounce">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-amber-900 shrink-0" />
                <div>
                  <h3 className="font-display font-black text-base">
                    {language === 'hi'
                      ? 'बधाई! आपने सीखीस्टार के सभी पाठ पूरे कर लिए! 🏆'
                      : 'Congratulations! You mastered ALL SeekhoStar lessons! 🏆'}
                  </h3>
                  <p className="text-xs font-bold text-amber-900">
                    {language === 'hi'
                      ? 'आप कभी भी किसी भी पाठ को दोबारा अभ्यास (Replay) कर सकते हैं।'
                      : 'You are an Academy Graduate! You can replay any lesson for extra stars.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Topics Cards Grouped by Levels */}
          <div className="space-y-3">
            {currentSubject.topics.map((topic) => {
              const completed = isCompleted(topic.id);
              const unlocked = isTopicUnlocked(topic, progress.completedLessons, currentSubject.topics);
              const replayCount = progress.replayedLessons?.[topic.id] || 0;

              return (
                <div
                  key={topic.id}
                  className={`p-4 rounded-3xl bg-white border-2 transition-all flex flex-col justify-between ${
                    unlocked
                      ? 'border-slate-200 shadow-sm hover:border-indigo-300'
                      : 'border-slate-200/60 bg-slate-50/80 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="relative w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                        {topic.emoji}
                        {!unlocked && (
                          <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center text-white backdrop-blur-2xs">
                            <Lock className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="font-display font-black text-base text-slate-900">
                            {language === 'hi' ? topic.titleHi : topic.titleEn}
                          </h3>
                          <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                            {language === 'hi' ? topic.levelNameHi : topic.levelNameEn}
                          </span>
                          {completed && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              {language === 'hi' ? 'पूर्ण' : 'Completed'}
                            </span>
                          )}
                          {replayCount > 0 && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              Replayed {replayCount}x
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 font-semibold mt-1">
                          {language === 'hi' ? topic.descriptionHi : topic.descriptionEn}
                        </p>
                        <p className="text-[11px] font-bold text-indigo-600 mt-1">
                          {topic.content.items.length}{' '}
                          {language === 'hi' ? 'अभ्यास कार्ड' : 'Interactive Cards'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Level Lock Requirement Banner if locked */}
                  {!unlocked && (
                    <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        {language === 'hi'
                          ? `इस स्तर को खोलने के लिए इस विषय का पिछला पाठ पूरा करें।`
                          : `Complete ${topic.requiredCompletedInSubject} lesson in this subject to unlock.`}
                      </span>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        if (!unlocked) return;
                        soundManager.playPop();
                        setActiveTopicId(topic.id);
                      }}
                      disabled={!unlocked}
                      className={`flex-1 py-2 rounded-2xl font-extrabold text-xs text-center transition-all ${
                        !unlocked
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : completed
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs border-b-2 border-emerald-800 flex items-center justify-center gap-1'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs border-b-2 border-indigo-800'
                      }`}
                    >
                      {completed ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{language === 'hi' ? 'दोहराएं (Replay Lesson)' : 'Replay Lesson'}</span>
                        </>
                      ) : (
                        <span>{language === 'hi' ? 'पाठ शुरू करें' : 'Start Lesson'}</span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        soundManager.playPop();
                        onAskAiAboutTopic(
                          language === 'hi' ? topic.titleHi : topic.titleEn
                        );
                      }}
                      title="Ask Guru Star AI about this"
                      className="px-3 py-2 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs flex items-center gap-1 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>{language === 'hi' ? 'AI सवाल' : 'Ask AI'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Detailed Topic Flashcard / Lesson Reader */
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Back button & Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                soundManager.playPop();
                setActiveTopicId(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'hi' ? 'विषय सूची' : 'All Topics'}</span>
            </button>

            <div className="flex items-center gap-2">
              {isCompleted(activeTopic.id) ? (
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {language === 'hi' ? 'पूर्ण (Replaying)' : 'Mastered (Replaying)'}
                </span>
              ) : (
                <button
                  onClick={() => {
                    soundManager.playStar();
                    onLessonCompleteOrReplay(activeTopic);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-xs border-b-2 border-emerald-700"
                >
                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                  <span>
                    {language === 'hi' ? 'पूरा हुआ (+५ सितारे)' : 'Complete (+5 Stars)'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Active Topic Banner */}
          <div className="p-4 rounded-3xl bg-indigo-50 border-2 border-indigo-200">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeTopic.emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-black text-indigo-950">
                    {language === 'hi' ? activeTopic.titleHi : activeTopic.titleEn}
                  </h2>
                  <span className="text-[10px] font-bold bg-indigo-200 text-indigo-900 px-1.5 py-0.2 rounded">
                    {language === 'hi' ? activeTopic.levelNameHi : activeTopic.levelNameEn}
                  </span>
                </div>
                <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                  {language === 'hi'
                    ? activeTopic.descriptionHi
                    : activeTopic.descriptionEn}
                </p>
              </div>
            </div>
          </div>

          {/* Flashcard Items */}
          <div className="space-y-3.5">
            {activeTopic.content.items.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:border-amber-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-amber-50 border border-amber-200">
                      {item.icon}
                    </span>
                    <div>
                      <h4 className="font-display text-lg font-black text-slate-900">
                        {language === 'hi' ? item.termHi : item.termEn}
                      </h4>
                      {(item.subtitleHi || item.subtitleEn) && (
                        <p className="text-xs font-bold text-slate-500">
                          {language === 'hi'
                            ? item.subtitleHi || item.subtitleEn
                            : item.subtitleEn || item.subtitleHi}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Audio Read Aloud button */}
                  <button
                    onClick={() => {
                      soundManager.playPop();
                      const spokenText =
                        language === 'hi'
                          ? `${item.termHi}. ${item.exampleHi}`
                          : `${item.termEn}. ${item.exampleEn}`;
                      soundManager.speakText(spokenText, language);
                    }}
                    className="p-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 active:scale-95 transition-all"
                    title={language === 'hi' ? 'सुनें' : 'Read Aloud'}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Example box */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    {language === 'hi' ? 'उदाहरण' : 'Example'}
                  </p>
                  <p className="text-sm font-bold text-slate-800 leading-snug">
                    {language === 'hi' ? item.exampleHi : item.exampleEn}
                  </p>
                </div>

                {/* Fun Fact */}
                {(item.funFactHi || item.funFactEn) && (
                  <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-amber-900">
                        {language === 'hi' ? 'रोचक तथ्य: ' : 'Did You Know? '}
                      </span>
                      <span className="font-bold text-amber-800">
                        {language === 'hi'
                          ? item.funFactHi || item.funFactEn
                          : item.funFactEn || item.funFactHi}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Lesson Footer */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                soundManager.playStar();
                onLessonCompleteOrReplay(activeTopic);
              }}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-md border-b-4 border-emerald-700 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>
                {isCompleted(activeTopic.id)
                  ? language === 'hi'
                    ? 'पुनः अभ्यास पूरा हुआ! (+२ सितारे)'
                    : 'Replay Practice Done! (+2 Stars)'
                  : language === 'hi'
                  ? 'मैंने यह पाठ सीख लिया! (+५ सितारे)'
                  : 'I Finished This Lesson! (+5 Stars)'}
              </span>
            </button>

            <button
              onClick={() => {
                soundManager.playPop();
                onNavigateToQuiz(currentSubject.id);
              }}
              className="w-full py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs shadow-xs border-b-2 border-amber-600 flex items-center justify-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>
                {language === 'hi'
                  ? `${currentSubject.nameHi} क्विज़ में खुद को परखें`
                  : `Test skills in ${currentSubject.nameEn} Quiz`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
