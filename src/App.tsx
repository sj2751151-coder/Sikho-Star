/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Language,
  SubjectId,
  ChildProfile,
  UserProgress,
  QuizAttemptRecord,
  LessonTopic,
} from './types';
import {
  loadChildProfile,
  saveChildProfile,
  loadUserProgress,
  recordQuizCompletion,
  markLessonCompletedOrReplayed,
  resetAllData,
  saveUserProgress,
} from './utils/storage';
import { soundManager } from './utils/sound';
import { SUBJECT_MODULES, ALL_LESSON_TOPICS } from './data/lessons';

import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { LearnView } from './components/LearnView';
import { AiTeacherView } from './components/AiTeacherView';
import { QuizView } from './components/QuizView';
import { ParentView } from './components/ParentView';
import { VideoComingSoonModal } from './components/VideoComingSoonModal';
import { Trophy, Star, Sparkles, X } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId | undefined>(undefined);
  const [aiTeacherPrompt, setAiTeacherPrompt] = useState<string | undefined>(undefined);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Celebration state for subject mastery or academy graduation
  const [celebrationModal, setCelebrationModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    icon: string;
    starsWon: number;
  } | null>(null);

  const [profile, setProfile] = useState<ChildProfile>(() => loadChildProfile());
  const [progress, setProgress] = useState<UserProgress>(() => loadUserProgress());

  // Sync sound manager enabled state with user settings
  useEffect(() => {
    soundManager.enabled = progress.soundEnabled;
  }, [progress.soundEnabled]);

  // Load language preference from localStorage if saved
  useEffect(() => {
    const savedLang = localStorage.getItem('seekhostar_lang');
    if (savedLang === 'en' || savedLang === 'hi') {
      setLanguage(savedLang);
    }
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem('seekhostar_lang', newLang);
  };

  const handleToggleSound = () => {
    const updated: UserProgress = {
      ...progress,
      soundEnabled: !progress.soundEnabled,
    };
    setProgress(updated);
    saveUserProgress(updated);
  };

  const handleUpdateProfile = (newProfile: ChildProfile) => {
    setProfile(newProfile);
    saveChildProfile(newProfile);
  };

  const handleLessonCompleteOrReplay = (topic: LessonTopic) => {
    const subject = SUBJECT_MODULES.find((s) => s.id === topic.subjectId);
    const subjectTopics = subject ? subject.topics : [];

    const { updatedProgress, isReplay, isCourseNewlyCompleted, isAppNewlyCompleted } =
      markLessonCompletedOrReplayed(
        topic,
        subjectTopics,
        ALL_LESSON_TOPICS,
        progress
      );

    setProgress(updatedProgress);

    if (isAppNewlyCompleted) {
      soundManager.playVictory();
      setCelebrationModal({
        isOpen: true,
        title:
          language === 'hi'
            ? 'अद्भुत! सीखीस्टार ग्रैंड ग्रेजुएट! 🎓'
            : 'Magnificent! SeekhoStar Grand Graduate! 🎓',
        description:
          language === 'hi'
            ? 'आपने सभी विषयों (हिन्दी, इंग्लिश, गणित, विज्ञान) के सभी पाठ पूरे कर लिए हैं! आप सच्चे स्टार स्कॉलर हैं!'
            : 'You have completed every single lesson across all subjects! You are a genuine Star Scholar!',
        icon: '🏆',
        starsWon: 25,
      });
    } else if (isCourseNewlyCompleted && subject) {
      soundManager.playVictory();
      setCelebrationModal({
        isOpen: true,
        title:
          language === 'hi'
            ? `${subject.nameHi} कोर्स पूर्ण! 🌟`
            : `${subject.nameEn} Course Completed! 🌟`,
        description:
          language === 'hi'
            ? `बधाई! आपने ${subject.nameHi} के सभी पाठ पूरे कर लिए और प्रमाण पत्र अनलॉक कर लिया!`
            : `Congratulations! You mastered all lessons in ${subject.nameEn} and unlocked your certificate!`,
        icon: subject.icon,
        starsWon: 10,
      });
    } else if (isReplay) {
      soundManager.playStar();
    }
  };

  const handleQuizComplete = (record: QuizAttemptRecord) => {
    const updated = recordQuizCompletion(record, progress);
    setProgress(updated);
  };

  const handleResetProgress = () => {
    const { profile: defProfile, progress: defProgress } = resetAllData();
    setProfile(defProfile);
    setProgress(defProgress);
  };

  const handleNavigateToLearn = (subjectId?: SubjectId) => {
    if (subjectId) setSelectedSubjectId(subjectId);
    setActiveTab('learn');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToAiTeacher = (prompt?: string) => {
    setAiTeacherPrompt(prompt);
    setActiveTab('ai-teacher');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToQuiz = (subjectId?: SubjectId) => {
    if (subjectId) setSelectedSubjectId(subjectId);
    setActiveTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/70 via-slate-50 to-indigo-50/40 text-slate-800 pb-20">
      {/* Top Header */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        stars={progress.totalStars}
        streak={progress.streakDays}
        soundEnabled={progress.soundEnabled}
        onToggleSound={handleToggleSound}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Main View Area Container (max-w-md creates ideal mobile phone frame on desktop/tablet, full-width on mobile) */}
      <main className="max-w-md mx-auto px-3.5 pt-3">
        {activeTab === 'home' && (
          <HomeView
            language={language}
            profile={profile}
            progress={progress}
            onNavigateToLearn={handleNavigateToLearn}
            onNavigateToAiTeacher={handleNavigateToAiTeacher}
            onNavigateToQuiz={handleNavigateToQuiz}
            onOpenVideoComingSoon={() => setIsVideoModalOpen(true)}
          />
        )}

        {activeTab === 'learn' && (
          <LearnView
            language={language}
            initialSubjectId={selectedSubjectId || 'hindi'}
            progress={progress}
            onLessonCompleteOrReplay={handleLessonCompleteOrReplay}
            onNavigateToQuiz={handleNavigateToQuiz}
            onAskAiAboutTopic={(topicTitle) => {
              const query =
                language === 'hi'
                  ? `मुझे "${topicTitle}" के बारे में सरल और मजेदार तरीके से बताओ!`
                  : `Tell me about "${topicTitle}" in a simple and fun way!`;
              handleNavigateToAiTeacher(query);
            }}
          />
        )}

        {activeTab === 'ai-teacher' && (
          <AiTeacherView
            language={language}
            profile={profile}
            initialPrompt={aiTeacherPrompt}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            language={language}
            initialSubjectId={selectedSubjectId || 'math'}
            onQuizComplete={handleQuizComplete}
          />
        )}

        {activeTab === 'parent' && (
          <ParentView
            language={language}
            profile={profile}
            progress={progress}
            onResetProgress={handleResetProgress}
            soundEnabled={progress.soundEnabled}
            onToggleSound={handleToggleSound}
          />
        )}
      </main>

      {/* Course Completion Celebration Modal */}
      {celebrationModal && celebrationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-400 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center text-4xl shadow-md border-2 border-amber-400 animate-bounce">
              {celebrationModal.icon}
            </div>

            <div>
              <h3 className="font-display text-xl font-black text-slate-900">
                {celebrationModal.title}
              </h3>
              <p className="text-xs text-slate-600 font-bold mt-1.5 leading-relaxed">
                {celebrationModal.description}
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 inline-flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500 animate-spin" />
              <span className="font-black text-amber-900 text-sm">
                +{celebrationModal.starsWon}{' '}
                {language === 'hi' ? 'बोनस सितारे मिले!' : 'Bonus Stars Awarded!'}
              </span>
            </div>

            <button
              onClick={() => {
                soundManager.playPop();
                setCelebrationModal(null);
              }}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md border-b-4 border-indigo-800"
            >
              {language === 'hi' ? 'सीखते रहें!' : 'Keep Learning!'}
            </button>
          </div>
        </div>
      )}

      {/* Video Learning "Coming Soon" Modal */}
      <VideoComingSoonModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        language={language}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        language={language}
      />
    </div>
  );
}
