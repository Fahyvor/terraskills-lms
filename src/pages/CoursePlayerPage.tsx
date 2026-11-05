import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchCourseBySlug, setCurrentLesson } from '../store/slices/courseSlice';
import { setProgressData } from '../store/slices/progressSlice';
import { CoursePlayer } from '../components/CoursePlayer';
import { Lesson } from '../types';
import { FiBookOpen, FiArrowLeft, FiClock, FiShield } from 'react-icons/fi';

export const CoursePlayerPage: React.FC = () => {
  const { slug, lessonId } = useParams<{ slug: string; lessonId?: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { activeCourse, isLoading, error } = useAppSelector((state) => state.course);
  const { isAuthenticated, enrollments, user } = useAppSelector((state) => state.auth);

  // Load course and progress if slug changes or activeCourse doesn't match
  useEffect(() => {
    if (slug && (!activeCourse || activeCourse.slug !== slug)) {
      dispatch(fetchCourseBySlug(slug)).then((action: any) => {
        if (action.payload && action.payload.progress) {
          dispatch(
            setProgressData({
              completedLessonIds: action.payload.progress.completedLessonIds || [],
              progressPercent: action.payload.progress.progressPercent || 0,
            })
          );
        }
      });
    }
  }, [dispatch, slug, activeCourse]);

  // Sync lessonId from URL if provided
  useEffect(() => {
    if (activeCourse && lessonId) {
      for (const mod of activeCourse.modules || []) {
        const found = mod.lessons?.find((l) => l.id === lessonId);
        if (found) {
          dispatch(setCurrentLesson(found));
          break;
        }
      }
    }
  }, [dispatch, activeCourse, lessonId]);

  const handleSelectLesson = (lesson: Lesson) => {
    if (slug) {
      navigate(`/courses/${slug}/learn/${lesson.id}`, { replace: true });
    }
  };

  const handleBack = () => {
    if (slug) {
      navigate(`/courses/${slug}`);
    } else {
      navigate('/');
    }
  };

  if (isLoading && !activeCourse) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#004bbb] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Loading Terraskills Classroom...
        </p>
      </div>
    );
  }

  if (error || !activeCourse) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 sm:px-8 lg:px-16 py-12">
        <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <FiBookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Classroom Unavailable
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {error || 'The requested course could not be loaded.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#004bbb] hover:bg-[#083eb3] transition-all cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </button>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 sm:px-8 lg:px-16 py-12">
        <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-[#004bbb] dark:text-blue-400 flex items-center justify-center mx-auto">
            <FiShield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Authentication Required
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please log in with your Terraskills student or facilitator account to access this classroom.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/login', { state: { from: location } })}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#004bbb] hover:bg-[#083eb3] transition-all cursor-pointer"
            >
              Sign In to Continue
            </button>
            <button
              onClick={() => navigate(`/courses/${slug}`)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Course Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Facilitator admission approval gate
  const enrollment = enrollments.find((e) => e.courseId === activeCourse.id);
  const status =
    enrollment?.status ||
    (activeCourse as any)?.enrollmentStatus ||
    (activeCourse?.isEnrolled ? 'approved' : 'none');
  const isApproved =
    status === 'approved' || user?.role === 'instructor' || user?.role === 'admin';

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 sm:px-8 lg:px-16 py-12">
        <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <FiClock className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
              Facilitator Approval Required
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white pt-1">
              Admission Pending Approval
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mx-auto">
              You have applied for <span className="font-semibold text-slate-900 dark:text-white">{activeCourse.title}</span>, but a Terraskills facilitator must grant you access before you can enter the video classroom.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-left text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Student Account:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.name} ({user?.email})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Admission Status:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                Awaiting Facilitator Review
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#004bbb] hover:bg-[#083eb3] transition-all shadow-sm cursor-pointer"
            >
              Go to Student Dashboard
            </button>
            <button
              onClick={() => navigate(`/courses/${slug}`)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              View Course Syllabus
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CoursePlayer
      course={activeCourse}
      onBack={handleBack}
      onOpenAuth={() => navigate('/login', { state: { from: location } })}
      onSelectLesson={handleSelectLesson}
    />
  );
};

