export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
  whatsapp?: string;
  address?: string;
  avatar?: string;
  headline?: string;
  bio?: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  duration: string;
  durationSeconds?: number;
  videoType: 'youtube' | 'upload';
  videoUrl: string;
  description?: string;
  summary?: string;
  resourcesJson?: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  thumbnail: string;
  instructorName: string;
  instructorTitle?: string;
  instructorAvatar?: string;
  duration: string;
  rating: number;
  reviewsCount: number;
  price: number;
  badge?: string;
  featured?: boolean;
  published?: boolean;
  modules?: Module[];
  reviews?: Review[];
  moduleCount?: number;
  lessonCount?: number;
  isEnrolled?: boolean;
  enrollmentStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

export interface Note {
  id: string;
  userId: string;
  lessonId: string;
  content: string;
  timestampSeconds: number;
  createdAt: string;
}

export interface EnrollmentSummary {
  id: string;
  courseId: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string | null;
  approvedBy?: string | null;
  enrolledAt: string;
  completed: boolean;
  completedAt?: string;
  certificateId?: string | null;
  progressPercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    duration: string;
    category: string;
  };
}

export interface AdmissionRecord {
  id: string;
  userId: string;
  courseId: string;
  status: 'pending' | 'approved' | 'rejected';
  enrolledAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    whatsapp?: string | null;
    address?: string | null;
    avatar?: string | null;
  };
  course: {
    id: string;
    title: string;
    slug: string;
    category: string;
    thumbnail: string;
    duration: string;
  };
}

export interface StudentSummary {
  id: string;
  name: string;
  email: string;
  whatsapp?: string | null;
  address?: string | null;
  createdAt: string;
}

