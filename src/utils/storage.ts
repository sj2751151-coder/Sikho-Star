import { ChildProfile, UserProgress, QuizAttemptRecord, SubjectId, LessonTopic } from '../types';

const PROGRESS_STORAGE_KEY = 'seekhostar_user_progress_v2';
const PROFILE_STORAGE_KEY = 'seekhostar_child_profile_v2';

const DEFAULT_PROFILE: ChildProfile = {
  name: 'Aarav',
  avatar: 'star',
  age: 7,
};

// Pure, honest initial state: 0 completed lessons, 0 stars, 0 fake quiz scores
const DEFAULT_PROGRESS: UserProgress = {
  totalStars: 0,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedLessons: [],
  replayedLessons: {},
  quizHistory: [],
  earnedBadges: ['first_step'],
  unlockedCertificates: [],
  soundEnabled: true,
};

export function loadChildProfile(): ChildProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read child profile from localStorage', e);
  }
  return DEFAULT_PROFILE;
}

export function saveChildProfile(profile: ChildProfile) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Could not save child profile to localStorage', e);
  }
}

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw) {
      const data: UserProgress = JSON.parse(raw);
      // Ensure all fields exist
      if (!data.replayedLessons) data.replayedLessons = {};
      if (!data.unlockedCertificates) data.unlockedCertificates = [];
      if (!data.earnedBadges) data.earnedBadges = ['first_step'];

      // Update streak
      const today = new Date().toISOString().split('T')[0];
      if (data.lastActiveDate !== today) {
        const lastDate = new Date(data.lastActiveDate);
        const currDate = new Date(today);
        const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          data.streakDays = (data.streakDays || 1) + 1;
        } else if (diffDays > 1) {
          data.streakDays = 1;
        }
        data.lastActiveDate = today;
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
      }
      return data;
    }
  } catch (e) {
    console.warn('Could not read user progress from localStorage', e);
  }
  return DEFAULT_PROGRESS;
}

export function saveUserProgress(progress: UserProgress) {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Could not save user progress to localStorage', e);
  }
}

export function markLessonCompletedOrReplayed(
  topic: LessonTopic,
  allTopicsInSubject: LessonTopic[],
  allTopicsInApp: LessonTopic[],
  currentProgress: UserProgress
): { updatedProgress: UserProgress; isReplay: boolean; isCourseNewlyCompleted: boolean; isAppNewlyCompleted: boolean } {
  const isReplay = currentProgress.completedLessons.includes(topic.id);
  const replayed = { ...currentProgress.replayedLessons };
  const completed = [...currentProgress.completedLessons];
  const badges = [...currentProgress.earnedBadges];
  const certificates = [...currentProgress.unlockedCertificates];

  let starsAdded = 0;
  if (isReplay) {
    replayed[topic.id] = (replayed[topic.id] || 0) + 1;
    starsAdded = 2; // +2 bonus stars for revision practice
    if (!badges.includes('review_champion')) {
      badges.push('review_champion');
    }
  } else {
    completed.push(topic.id);
    starsAdded = 5; // +5 stars for first-time completion
    if (completed.length === 1 && !badges.includes('first_lesson_done')) {
      badges.push('first_lesson_done');
    }
    if (completed.length >= 5 && !badges.includes('eager_scholar')) {
      badges.push('eager_scholar');
    }
  }

  // Check subject course completion
  const subjectTopics = allTopicsInSubject.map((t) => t.id);
  const subjectDone = subjectTopics.every((id) => completed.includes(id));
  const subjectCertId = `${topic.subjectId}_master`;
  let isCourseNewlyCompleted = false;

  if (subjectDone && !certificates.includes(subjectCertId)) {
    certificates.push(subjectCertId);
    starsAdded += 10; // +10 bonus for completing full subject course
    isCourseNewlyCompleted = true;
  }

  // Check entire application graduation
  const allTopicIds = allTopicsInApp.map((t) => t.id);
  const allDone = allTopicIds.every((id) => completed.includes(id));
  let isAppNewlyCompleted = false;

  if (allDone && !certificates.includes('grand_graduate')) {
    certificates.push('grand_graduate');
    starsAdded += 25; // +25 bonus for grand graduation
    isAppNewlyCompleted = true;
  }

  const updatedProgress: UserProgress = {
    ...currentProgress,
    totalStars: currentProgress.totalStars + starsAdded,
    completedLessons: completed,
    replayedLessons: replayed,
    earnedBadges: badges,
    unlockedCertificates: certificates,
  };

  saveUserProgress(updatedProgress);
  return { updatedProgress, isReplay, isCourseNewlyCompleted, isAppNewlyCompleted };
}

export function recordQuizCompletion(
  record: QuizAttemptRecord,
  currentProgress: UserProgress
): UserProgress {
  const updatedStars = currentProgress.totalStars + record.starsEarned;
  const updatedHistory = [record, ...currentProgress.quizHistory.slice(0, 49)];

  const newBadges = [...currentProgress.earnedBadges];
  if (record.score === record.total && !newBadges.includes('perfect_quiz')) {
    newBadges.push('perfect_quiz');
  }
  if (updatedStars >= 50 && !newBadges.includes('fifty_stars')) {
    newBadges.push('fifty_stars');
  }
  if (updatedStars >= 100 && !newBadges.includes('century_star')) {
    newBadges.push('century_star');
  }

  const updatedProgress: UserProgress = {
    ...currentProgress,
    totalStars: updatedStars,
    quizHistory: updatedHistory,
    earnedBadges: newBadges,
  };

  saveUserProgress(updatedProgress);
  return updatedProgress;
}

export function resetAllData(): { profile: ChildProfile; progress: UserProgress } {
  localStorage.removeItem(PROGRESS_STORAGE_KEY);
  localStorage.removeItem(PROFILE_STORAGE_KEY);
  return {
    profile: DEFAULT_PROFILE,
    progress: DEFAULT_PROGRESS,
  };
}

// Helpers for accurate, non-invented calculation
export function getSubjectProgressStats(
  subjectId: SubjectId,
  completedLessons: string[],
  allSubjectTopics: LessonTopic[]
) {
  const total = allSubjectTopics.length;
  const completed = allSubjectTopics.filter((t) => completedLessons.includes(t.id)).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage, isComplete: completed === total };
}

export function isTopicUnlocked(
  topic: LessonTopic,
  completedLessons: string[],
  allSubjectTopics: LessonTopic[]
): boolean {
  if (topic.level === 1 || topic.requiredCompletedInSubject === 0) return true;
  const completedInSubject = allSubjectTopics.filter(
    (t) => t.subjectId === topic.subjectId && completedLessons.includes(t.id)
  ).length;
  return completedInSubject >= topic.requiredCompletedInSubject;
}
