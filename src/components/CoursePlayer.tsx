import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCircle,
  FiChevronDown,
  FiChevronRight,
  FiChevronLeft,
  FiAward,
  FiFileText,
  FiDownload,
  FiShare2,
  FiYoutube,
  FiUploadCloud,
  FiClock,
  FiBookOpen,
} from 'react-icons/fi';
import { Course, Lesson } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { LessonNotes } from './LessonNotes';
import { useAppDispatch, useAppSelector } from '../store';
import { setCurrentLesson } from '../store/slices/courseSlice';
import { toggleLessonProgress } from '../store/slices/progressSlice';

interface CoursePlayerProps {
  course: Course;
  onBack: () => void;
  onOpenAuth: () => void;
  onSelectLesson?: (lesson: Lesson) => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({
  course,
  onBack,
  onOpenAuth,
  onSelectLesson,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentLesson } = useAppSelector((state) => state.course);
  const { completedLessonIds, progressPercent, isCourseCompleted, certificateId } =
    useAppSelector((state) => state.progress);
  const { user, isAuthenticated, enrollments } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'resources'>('overview');
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  const currentEnrollment = enrollments.find((e) => e.courseId === course.id);
  const targetCertId = certificateId || currentEnrollment?.certificateId || currentEnrollment?.id;

  // Flatten all lessons to enable Next / Previous navigation
  const allLessons: Lesson[] = [];
  course.modules?.forEach((mod) => {
    mod.lessons?.forEach((l) => allLessons.push(l));
  });

  const activeLesson = currentLesson || (allLessons.length > 0 ? allLessons[0] : null);
  const activeIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const hasNext = activeIndex >= 0 && activeIndex < allLessons.length - 1;
  const hasPrev = activeIndex > 0;

  const isCurrentLessonCompleted = activeLesson
    ? completedLessonIds.includes(activeLesson.id)
    : false;

  const toggleModuleCollapse = (moduleId: string) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleToggleLesson = (lessonId: string) => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    dispatch(toggleLessonProgress({ lessonId, courseId: course.id }));
  };

  const handleNextLesson = () => {
    if (hasNext) {
      const nextL = allLessons[activeIndex + 1];
      dispatch(setCurrentLesson(nextL));
      if (onSelectLesson) onSelectLesson(nextL);
    }
  };

  const handlePrevLesson = () => {
    if (hasPrev) {
      const prevL = allLessons[activeIndex - 1];
      dispatch(setCurrentLesson(prevL));
      if (onSelectLesson) onSelectLesson(prevL);
    }
  };

  const studentName = user?.name || 'Valued Terraskills Student';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors flex flex-col">
      {/* Sticky Top Classroom Bar */}
      <div className="sticky top-18 z-30 w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left: Back & Course Title */}
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                title="Return to catalog"
              >
                <FiArrowLeft className="w-4 h-4" />
              </button>

              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {course.category}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  {course.title}
                </h2>
              </div>
            </div>

            {/* Right: Real-time Progress Bar & Certificate */}
            <div className="flex items-center space-x-4">
              {/* Progress metric */}
              <div className="flex flex-col items-end min-w-[170px]">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Course Progress:</span>
                  <span className="font-extrabold text-[#004bbb] dark:text-blue-400">
                    {progressPercent}%
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({completedLessonIds.length}/{allLessons.length})
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      progressPercent === 100
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-[#004bbb] via-blue-500 to-[#e5192d]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Certificate Button (Active when 100%) */}
              {progressPercent === 100 && targetCertId && (
                <button
                  onClick={() => navigate(`/certificates/${targetCertId}`)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md hover:shadow-lg transition-all animate-bounce cursor-pointer flex items-center space-x-1.5"
                >
                  <FiAward className="w-4 h-4" />
                  <span>View Certificate</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Classroom Layout (Split: Video Player + Curriculum Drawer) */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Stage: Left & Center (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {activeLesson ? (
              <>
                {/* Responsive Video Player */}
                <VideoPlayer
                  lesson={activeLesson}
                  isCompleted={isCurrentLessonCompleted}
                  onLessonComplete={() => handleToggleLesson(activeLesson.id)}
                />

                {/* Lesson Action Header */}
                <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#004bbb] dark:text-blue-400">
                        Lesson {activeIndex + 1} of {allLessons.length}
                      </span>
                      <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 leading-snug">
                        {activeLesson.title}
                      </h1>
                    </div>

                    {/* Mark as Complete button */}
                    <button
                      onClick={() => handleToggleLesson(activeLesson.id)}
                      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrentLessonCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-[#004bbb] hover:bg-[#083eb3] text-white shadow-xs'
                      }`}
                    >
                      {isCurrentLessonCompleted ? (
                        <>
                          <FiCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <FiCircle className="w-4 h-4" />
                          <span>Mark as Complete</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Previous / Next Lesson Navigation Strip */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <button
                      onClick={handlePrevLesson}
                      disabled={!hasPrev}
                      className="inline-flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                      <span>Previous Lesson</span>
                    </button>

                    <button
                      onClick={handleNextLesson}
                      disabled={!hasNext}
                      className="inline-flex items-center space-x-1.5 text-[#004bbb] dark:text-blue-400 font-bold hover:underline disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span>Next Lesson</span>
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Classroom Tabs: Overview, Notes, Resources */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                  {/* Tab Strip */}
                  <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-3 bg-slate-50/50 dark:bg-slate-850/50">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                        activeTab === 'overview'
                          ? 'border-[#004bbb] text-[#004bbb] dark:border-blue-400 dark:text-blue-400'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Lecture Notes & Summary
                    </button>
                    <button
                      onClick={() => setActiveTab('notes')}
                      className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                        activeTab === 'notes'
                          ? 'border-[#004bbb] text-[#004bbb] dark:border-blue-400 dark:text-blue-400'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      My Private Study Notes
                    </button>
                    <button
                      onClick={() => setActiveTab('resources')}
                      className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                        activeTab === 'resources'
                          ? 'border-[#004bbb] text-[#004bbb] dark:border-blue-400 dark:text-blue-400'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Resources & Labs
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === 'overview' && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                            Lesson Description
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {activeLesson.description ||
                              'Follow along with this lecture. Take practical notes, experiment with the code examples, and mark the lesson complete once finished.'}
                          </p>
                        </div>

                        {activeLesson.summary && (
                          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60">
                            <h4 className="text-xs font-bold text-[#004bbb] dark:text-blue-300 mb-1">
                              Key Curricular Takeaway
                            </h4>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                              {activeLesson.summary}
                            </p>
                          </div>
                        )}

                        <div className="pt-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Faculty Mentorship
                          </h4>
                          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                            {course.instructorAvatar && (
                              <img
                                src={course.instructorAvatar}
                                alt={course.instructorName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                {course.instructorName}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {course.instructorTitle || 'Terraskills Certified Lead Instructor'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'notes' && <LessonNotes lessonId={activeLesson.id} />}

                    {activeTab === 'resources' && (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Supplementary materials, code templates, and reference cheat sheets provided by Terraskills Faculty.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                            <div className="flex items-center space-x-2.5">
                              <FiFileText className="w-4 h-4 text-blue-500" />
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                Terraskills Course Slides & Architecture Cheatsheet (PDF)
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              2.4 MB
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                            <div className="flex items-center space-x-2.5">
                              <FiBookOpen className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                Official Terraskills Exercise Sandbox Repo
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-blue-500">
                              GitHub
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-10 sm:p-14 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#004bbb] dark:text-blue-400 flex items-center justify-center mx-auto">
                  <FiBookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Curriculum In Preparation
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  The syllabus and video lectures for this course are currently being uploaded by your Terraskills facilitator. Please check back shortly or explore other available courses.
                </p>
                <button
                  onClick={onBack}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#004bbb] hover:bg-[#083eb3] transition-all cursor-pointer"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span>Return to Course Overview</span>
                </button>
              </div>
            )}
          </div>

          {/* Curriculum Sidebar: Right (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                    Course Syllabus
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {course.modules?.length || 0} Modules • {allLessons.length} Total Lessons
                  </p>
                </div>

                <span className="px-2 py-1 text-[10px] font-bold rounded bg-blue-100 dark:bg-blue-950 text-[#004bbb] dark:text-blue-300">
                  {completedLessonIds.length}/{allLessons.length} Done
                </span>
              </div>

              {/* Modules Accordion */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {(!course.modules || course.modules.length === 0) ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No curriculum modules uploaded yet. Facilitator will publish lectures shortly.
                  </div>
                ) : (
                  course.modules?.map((mod, mIdx) => {
                  const isCollapsed = collapsedModules[mod.id];
                  const modLessons = mod.lessons || [];
                  const completedInMod = modLessons.filter((l) =>
                    completedLessonIds.includes(l.id)
                  ).length;
                  const isModComplete =
                    modLessons.length > 0 && completedInMod === modLessons.length;

                  return (
                    <div key={mod.id} className="bg-white dark:bg-slate-900">
                      {/* Module Header Toggle */}
                      <button
                        onClick={() => toggleModuleCollapse(mod.id)}
                        className="w-full p-3.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2 min-w-0 pr-2">
                          {isModComplete ? (
                            <FiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {mod.title}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[10px] text-slate-400">
                            {completedInMod}/{modLessons.length}
                          </span>
                          {isCollapsed ? (
                            <FiChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <FiChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Lesson Items */}
                      {!isCollapsed && (
                        <div className="space-y-1 p-2 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800">
                          {modLessons.map((lesson, lIdx) => {
                            const isCurrent = activeLesson?.id === lesson.id;
                            const isDone = completedLessonIds.includes(lesson.id);

                            return (
                              <div
                                key={lesson.id}
                                className={`flex items-center justify-between p-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                                  isCurrent
                                    ? 'bg-blue-50 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-800 shadow-2xs'
                                    : 'hover:bg-white dark:hover:bg-slate-800 border border-transparent'
                                }`}
                                onClick={() => {
                                  dispatch(setCurrentLesson(lesson));
                                  if (onSelectLesson) onSelectLesson(lesson);
                                }}
                              >
                                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                                  {/* Checkbox */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleLesson(lesson.id);
                                    }}
                                    className="p-1 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer shrink-0"
                                    title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                                  >
                                    {isDone ? (
                                      <FiCheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                                    ) : (
                                      <FiCircle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                    )}
                                  </button>

                                  <div className="min-w-0">
                                    <p
                                      className={`text-xs font-semibold truncate leading-tight ${
                                        isCurrent
                                          ? 'text-[#004bbb] dark:text-blue-400 font-bold'
                                          : isDone
                                          ? 'text-slate-500 dark:text-slate-400 line-through'
                                          : 'text-slate-800 dark:text-slate-200'
                                      }`}
                                    >
                                      {lesson.title}
                                    </p>
                                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                                      <span className="flex items-center space-x-0.5">
                                        <FiClock className="w-3 h-3" />
                                        <span>{lesson.duration}</span>
                                      </span>
                                      <span>•</span>
                                      {lesson.videoType === 'youtube' ? (
                                        <span className="flex items-center space-x-0.5 text-red-500">
                                          <FiYoutube className="w-3 h-3" />
                                          <span>YouTube</span>
                                        </span>
                                      ) : (
                                        <span className="flex items-center space-x-0.5 text-blue-500">
                                          <FiUploadCloud className="w-3 h-3" />
                                          <span>Video</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {isCurrent && (
                                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

