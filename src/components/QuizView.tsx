import React, { useState } from 'react';
import {
  Award,
  Star,
  RotateCcw,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  Trophy,
  Check,
  BookOpen,
} from 'lucide-react';
import { Language, QuizAttemptRecord, SubjectId, SubjectQuiz } from '../types';
import { SUBJECT_QUIZZES } from '../data/quizzes';
import { soundManager } from '../utils/sound';

interface QuizViewProps {
  language: Language;
  initialSubjectId?: SubjectId;
  onQuizComplete: (record: QuizAttemptRecord) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  language,
  initialSubjectId = 'math',
  onQuizComplete,
}) => {
  const [selectedQuizId, setSelectedQuizId] = useState<string>(() => {
    const matching = SUBJECT_QUIZZES.find((q) => q.subjectId === initialSubjectId);
    return matching ? matching.id : SUBJECT_QUIZZES[0].id;
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const activeQuiz: SubjectQuiz =
    SUBJECT_QUIZZES.find((q) => q.id === selectedQuizId) || SUBJECT_QUIZZES[0];

  const currentQuestion = activeQuiz.questions[currentQuestionIndex];
  const totalQuestions = activeQuiz.questions.length;

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    soundManager.playPop();
    setSelectedOptionIndex(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOptionIndex === null || isAnswerSubmitted) return;

    setIsAnswerSubmitted(true);
    const isCorrect = selectedOptionIndex === currentQuestion.correctIndex;

    if (isCorrect) {
      soundManager.playStar();
      setScore((prev) => prev + 1);
    } else {
      soundManager.playTryAgain();
    }
  };

  const handleNextQuestion = () => {
    soundManager.playPop();

    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerSubmitted(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    soundManager.playVictory();
    setIsQuizFinished(true);

    const calculatedStars =
      score === totalQuestions ? 15 : score >= Math.ceil(totalQuestions / 2) ? 10 : 5;

    const attemptRecord: QuizAttemptRecord = {
      id: `attempt-${Date.now()}`,
      quizId: activeQuiz.id,
      subjectId: activeQuiz.subjectId,
      score: score,
      total: totalQuestions,
      starsEarned: calculatedStars,
      date: new Date().toISOString(),
    };

    onQuizComplete(attemptRecord);
  };

  const restartQuiz = () => {
    soundManager.playPop();
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizFinished(false);
  };

  const switchQuiz = (quizId: string) => {
    soundManager.playPop();
    setSelectedQuizId(quizId);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizFinished(false);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Quiz Selector Pills: Standard & Revision */}
      <div className="space-y-1.5">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {SUBJECT_QUIZZES.map((quiz) => {
            const isSelected = quiz.id === selectedQuizId;
            return (
              <button
                key={quiz.id}
                onClick={() => switchQuiz(quiz.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl whitespace-nowrap font-black text-xs transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-amber-500 text-amber-950 shadow-md border-b-2 border-amber-700'
                    : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-base">{quiz.emoji}</span>
                <span>{language === 'hi' ? quiz.titleHi : quiz.titleEn}</span>
                {quiz.isRevision && (
                  <span className="text-[9px] bg-purple-100 text-purple-800 px-1 py-0.2 rounded font-black">
                    Rev
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {!isQuizFinished ? (
        /* Active Question Card */
        <div className="space-y-4">
          {/* Quiz Header & Progress Tracker */}
          <div className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeQuiz.emoji}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-black text-sm text-slate-900">
                    {language === 'hi' ? activeQuiz.titleHi : activeQuiz.titleEn}
                  </h3>
                  {activeQuiz.isRevision && (
                    <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-1.5 py-0.2 rounded">
                      Revision
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold text-slate-500">
                  {language === 'hi'
                    ? `प्रश्न ${currentQuestionIndex + 1} / ${totalQuestions}`
                    : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>
                {score} / {totalQuestions}
              </span>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="flex gap-1.5 px-1">
            {activeQuiz.questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  i < currentQuestionIndex
                    ? 'bg-emerald-500'
                    : i === currentQuestionIndex
                    ? 'bg-amber-400'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Question Box */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-md space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-4xl p-2 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs">
                {currentQuestion.emoji}
              </span>
              <div>
                <h2 className="font-display text-lg font-black text-slate-900 leading-snug">
                  {language === 'hi'
                    ? currentQuestion.questionHi
                    : currentQuestion.questionEn}
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  {language === 'hi'
                    ? currentQuestion.questionEn
                    : currentQuestion.questionHi}
                </p>
              </div>
            </div>

            {/* Options List */}
            <div className="space-y-2.5 pt-2">
              {(language === 'hi'
                ? currentQuestion.optionsHi
                : currentQuestion.optionsEn
              ).map((optionText, index) => {
                const isSelected = selectedOptionIndex === index;
                const isCorrect = index === currentQuestion.correctIndex;

                let buttonStyle = 'border-slate-200 bg-slate-50/70 hover:bg-slate-100';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    buttonStyle =
                      'border-emerald-500 bg-emerald-50 text-emerald-950 font-black shadow-sm';
                  } else if (isSelected && !isCorrect) {
                    buttonStyle =
                      'border-rose-400 bg-rose-50 text-rose-950 font-bold';
                  } else {
                    buttonStyle = 'border-slate-200 opacity-50 bg-slate-50';
                  }
                } else if (isSelected) {
                  buttonStyle =
                    'border-indigo-600 bg-indigo-50/90 text-indigo-950 font-black shadow-sm ring-2 ring-indigo-300';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(index)}
                    disabled={isAnswerSubmitted}
                    className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all active:scale-98 ${buttonStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 font-black text-xs flex items-center justify-center text-slate-700 shadow-xs">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {optionText}
                      </span>
                    </div>

                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Feedback & Explanation */}
            {isAnswerSubmitted && (
              <div
                className={`p-3.5 rounded-2xl border-2 animate-in fade-in zoom-in-95 duration-150 ${
                  selectedOptionIndex === currentQuestion.correctIndex
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>
                    {selectedOptionIndex === currentQuestion.correctIndex
                      ? language === 'hi'
                        ? 'शाबाश! सही उत्तर! 🌟'
                        : 'Superb! Correct Answer! 🌟'
                      : language === 'hi'
                      ? 'अच्छा प्रयास! उत्तर जानिए:'
                      : 'Good try! Here is why:'}
                  </span>
                </div>
                <p className="text-xs font-bold leading-relaxed">
                  {language === 'hi'
                    ? currentQuestion.explanationHi
                    : currentQuestion.explanationEn}
                </p>
              </div>
            )}

            {/* Action Button: Check or Next */}
            <div className="pt-2">
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={selectedOptionIndex === null}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black text-sm shadow-md border-b-4 border-indigo-800 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'hi' ? 'उत्तर जांचें' : 'Check Answer'}</span>
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm shadow-md border-b-4 border-amber-600 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <span>
                    {currentQuestionIndex + 1 < totalQuestions
                      ? language === 'hi'
                        ? 'अगला प्रश्न'
                        : 'Next Question'
                      : language === 'hi'
                      ? 'परिणाम देखें'
                      : 'See Results'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Results Celebration Card */
        <div className="bg-white rounded-3xl p-6 border-3 border-amber-300 shadow-xl text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center text-4xl shadow-md border-2 border-amber-400 animate-bounce">
            <Trophy className="w-10 h-10 text-amber-900" />
          </div>

          <div>
            <h2 className="font-display text-2xl font-black text-slate-900">
              {score === totalQuestions
                ? language === 'hi'
                  ? 'अद्भुत प्रदर्शन! सुपर स्टार! 🌟'
                  : 'Outstanding! Super Star! 🌟'
                : score >= Math.ceil(totalQuestions / 2)
                ? language === 'hi'
                  ? 'बहुत अच्छा प्रयास! 👏'
                  : 'Great Effort, Explorer! 👏'
                : language === 'hi'
                ? 'अभ्यास करते रहें! 💡'
                : 'Keep Practicing! 💡'}
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-1">
              {language === 'hi'
                ? `${activeQuiz.titleHi} सफलता से पूरा हुआ!`
                : `You finished the ${activeQuiz.titleEn}!`}
            </p>
          </div>

          {/* Score & Stars Display */}
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="block text-2xl font-black text-amber-600">
                {score} / {totalQuestions}
              </span>
              <span className="text-[11px] font-bold text-amber-800">
                {language === 'hi' ? 'सही उत्तर' : 'Correct Answers'}
              </span>
            </div>

            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200">
              <span className="block text-2xl font-black text-indigo-600">
                +{score === totalQuestions ? 15 : score >= Math.ceil(totalQuestions / 2) ? 10 : 5}
              </span>
              <span className="text-[11px] font-bold text-indigo-800">
                {language === 'hi' ? 'जीते गए सितारे' : 'Stars Earned'}
              </span>
            </div>
          </div>

          {/* Restart Button */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={restartQuiz}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md border-b-4 border-indigo-800 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'hi' ? 'फिर से खेलें' : 'Play Again'}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playPop();
                const currentIdx = SUBJECT_QUIZZES.findIndex((q) => q.id === activeQuiz.id);
                const nextQuiz = SUBJECT_QUIZZES[(currentIdx + 1) % SUBJECT_QUIZZES.length];
                switchQuiz(nextQuiz.id);
              }}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              {language === 'hi' ? 'अगला क्विज़ चुनें' : 'Try Another Quiz'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
