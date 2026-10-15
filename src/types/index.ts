export type Language = 'en' | 'hi';

export type SubjectId = 'hindi' | 'english' | 'math' | 'science';

export interface ChildProfile {
  name: string;
  avatar: string; // 'lion' | 'star' | 'robot' | 'bunny' | 'astronaut' | 'owl'
  age: number;
}

export type LessonLevel = 1 | 2 | 3;

export interface LessonTopic {
  id: string;
  subjectId: SubjectId;
  level: LessonLevel; // 1 = Beginner, 2 = Rising Star, 3 = Master
  levelNameEn: string;
  levelNameHi: string;
  requiredCompletedInSubject: number; // Prerequisite completed lessons in this subject to unlock
  titleEn: string;
  titleHi: string;
  emoji: string;
  descriptionEn: string;
  descriptionHi: string;
  content: {
    items: Array<{
      termEn: string;
      termHi: string;
      subtitleEn?: string;
      subtitleHi?: string;
      icon: string;
      exampleEn: string;
      exampleHi: string;
      funFactEn?: string;
      funFactHi?: string;
    }>;
  };
}

export interface SubjectModule {
  id: SubjectId;
  nameEn: string;
  nameHi: string;
  icon: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  badgeEn: string;
  badgeHi: string;
  certificateTitleEn: string;
  certificateTitleHi: string;
  topics: LessonTopic[];
}

export interface QuizQuestion {
  id: string;
  questionEn: string;
  questionHi: string;
  emoji: string;
  optionsEn: string[];
  optionsHi: string[];
  correctIndex: number;
  explanationEn: string;
  explanationHi: string;
}

export interface SubjectQuiz {
  id: string;
  subjectId: SubjectId;
  level: LessonLevel;
  isRevision?: boolean;
  titleEn: string;
  titleHi: string;
  emoji: string;
  accentColor: string;
  questions: QuizQuestion[];
}

export interface QuizAttemptRecord {
  id: string;
  quizId: string;
  subjectId: SubjectId;
  score: number;
  total: number;
  starsEarned: number;
  date: string;
}

export interface UserProgress {
  totalStars: number;
  streakDays: number;
  lastActiveDate: string;
  completedLessons: string[]; // Unique topic IDs completed
  replayedLessons: Record<string, number>; // topicId -> number of times replayed
  quizHistory: QuizAttemptRecord[];
  earnedBadges: string[];
  unlockedCertificates: string[]; // Subject courses or grand academy
  soundEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'teacher';
  text: string;
  timestamp: string;
  modelUsed?: string;
  audioBase64?: string;
  audioSource?: 'gemini-native' | 'device';
  isAudioLoading?: boolean;
  isPlaying?: boolean;
  audioError?: string;
}
