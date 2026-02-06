// Parent Profile
export interface ParentProfile {
  id: string;
  externalId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  code: string;
  familyId: string;
  avatarUrl: string | null;
}

// Course
export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: CourseCategory;
  isPublished: boolean;
  hasEvaluation: boolean;
  totalChapters: number;
  totalModules: number;
  totalDuration: number;
}

export type CourseCategory =
  | 'maternidad'
  | 'comunicacion'
  | 'limites'
  | 'emociones'
  | 'adolescencia';

export interface CourseWithProgress extends Course {
  isEnrolled: boolean;
  isCompleted: boolean;
  progressPercent: number;
  currentChapterIndex: number | null;
}

// Module
export interface Module {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
}

export interface ModuleWithChapters extends Module {
  chapters: ChapterWithProgress[];
  isCompleted: boolean;
  isUnlocked: boolean;
  completedChapters: number;
  totalChapters: number;
}

// Chapter
export interface Chapter {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  durationMinutes: number;
  orderIndex: number;
}

export interface ChapterWithProgress extends Chapter {
  isCompleted: boolean;
  completedAt: string | null;
  watchTimeSeconds: number;
}

// Material
export interface Material {
  id: string;
  chapterId: string;
  title: string;
  type: MaterialType;
  url: string;
  description: string | null;
  orderIndex: number;
}

export type MaterialType = 'video' | 'image' | 'pdf' | 'link';

// Enrollment
export interface Enrollment {
  id: string;
  parentId: string;
  courseId: string;
  progressPercent: number;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
}

export type EnrollmentStatus = 'active' | 'completed' | 'paused';

// Evaluation
export interface Evaluation {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  passingScore: number;
}

export interface EvaluationQuestion {
  id: string;
  evaluationId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  orderIndex: number;
}

export interface EvaluationAttempt {
  id: string;
  parentId: string;
  evaluationId: string;
  score: number;
  passed: boolean;
  answers: number[];
  attemptedAt: string;
}

// Post
export interface Post {
  id: string;
  parentId: string;
  content: string;
  imageUrl: string | null;
  postType: PostType;
  reactionCount: number;
  commentCount: number;
  isHidden: boolean;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  hasReacted: boolean;
}

export type PostType = 'experience' | 'question' | 'advice';

// Comment
export interface Comment {
  id: string;
  postId: string;
  parentId: string;
  content: string;
  isHidden: boolean;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

// Notification
export interface Notification {
  id: string;
  parentId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data: Record<string, unknown> | null;
  createdAt: string;
}

export type NotificationType =
  | 'comment'
  | 'reaction'
  | 'resource'
  | 'reminder'
  | 'system';

// User Stats (sin gamificación)
export interface UserStats {
  activeCourses: number;
  completedCourses: number;
  chaptersViewed: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
