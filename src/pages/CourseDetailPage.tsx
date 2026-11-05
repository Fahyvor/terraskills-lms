import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiClock,
  FiBook,
  FiStar,
  FiUser,
  FiArrowRight,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiPlay,
  FiAward,
  FiShield,
  FiShare2,
  FiCheck,
  FiLayers,
  FiArrowLeft,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchCourseBySlug, enrollInCourse } from '../store/slices/courseSlice';
import { setProgressData } from '../store/slices/progressSlice';
import { fetchMe } from '../store/slices/authSlice';
import { toast } from 'sleek-toast';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { activeCourse, isLoading, error } = useAppSelector((state) => state.course);
  const { isAuthenticated, enrollments } = useAppSelector((state) => state.auth);

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (slug) {
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
  }, [dispatch, slug]);

  const course = activeCourse;

  // Check enrollment & facilitator approval status
  const enrollment = enrollments.find((e) => e.courseId === course?.id);
  const effectiveStatus =
    enrollment?.status ||
    (course as any)?.enrollmentStatus ||
    (course?.isEnrolled ? 'approved' : 'none');
  const isApproved = effectiveStatus === 'approved';
  const isPending = effectiveStatus === 'pending';
  const progressPercent = enrollment?.progressPercent || 0;

  // Calculate totals
  let totalLessons = 0;
  course?.modules?.forEach((m) => {
    totalLessons += m.lessons?.length || 0;
  });

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEnrollOrResume = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (isApproved) {
      navigate(`/courses/${slug}/learn`);
      return;
    }

    if (isPending) {
      toast.info('Your admission application is pending facilitator review.');
      return;
    }

    if (course) {
      const res = await dispatch(enrollInCourse(course.id));
      if (enrollInCourse.fulfilled.match(res)) {
        toast.success(
          'Admission application submitted! A Terraskills facilitator will review and grant access.'
        );
        dispatch(fetchMe());
      } else {
        toast.error((res.payload as string) || 'Enrollment request failed');
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success('Course URL copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (isLoading && !course) {
    return (
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="w-full mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <FiBook className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Course Not Found
        </h2>
        <p className="text-xs text-slate-500 mx-auto">
          The curriculum you are trying to view might have been moved, updated, or does not exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#004bbb] hover:bg-[#083eb3] transition-all"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Course Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Top Breadcrumb & Hero */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Breadcrumb row */}
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium">
              Home
            </Link>
            <span>/</span>
            <Link
              to={`/?category=${encodeURIComponent(course.category)}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 font-medium"
            >
              {course.category}
            </Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-xs sm:max-w-sm">
              {course.title}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Hero Main Info (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-bold uppercase rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#004bbb] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {course.category}
                </span>
                {course.badge && (
                  <span className="px-2.5 py-1 text-xs font-extrabold uppercase rounded-lg bg-[#e5192d] text-white shadow-xs">
                    {course.badge}
                  </span>
                )}
                <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {course.level}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {course.subtitle}
              </p>

              {/* Stats & Instructor */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-1.5 text-amber-500 font-bold">
                  <FiStar className="w-4 h-4 fill-current" />
                  <span>{course.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({course.reviewsCount} reviews)</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <FiClock className="w-4 h-4 text-slate-400" />
                  <span>{course.duration}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <FiBook className="w-4 h-4 text-slate-400" />
                  <span>{totalLessons || course.lessonCount || 0} Lessons</span>
                </div>

                <div className="flex items-center space-x-2">
                  {course.instructorAvatar ? (
                    <img
                      src={course.instructorAvatar}
                      alt={course.instructorName}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 flex items-center justify-center">
                      <FiUser className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Lead: {course.instructorName}
                  </span>
                </div>
              </div>
            </div>

            {/* Share action on mobile/tablet */}
            <div className="lg:col-span-4 flex justify-end">
              <button
                onClick={handleShare}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <FiShare2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied!' : 'Share Curriculum'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Details & Syllabus (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* What you'll learn */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <FiCheckCircle className="w-5 h-5 text-emerald-500" />
                <span>What You'll Master in this Program</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Architectural system fundamentals and production-grade best practices',
                  'Hands-on interactive implementation with real-time video guidance',
                  'Comprehensive security patterns and authenticated workflows',
                  'Official accredited graduation credential verified by Terraskills',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5">
                    <FiCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Course Curriculum Overview
              </h2>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
                <p>{course.description}</p>
              </div>
            </div>

            {/* Syllabus / Modules Accordion */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <FiLayers className="w-5 h-5 text-[#004bbb] dark:text-blue-400" />
                    <span>Curriculum Syllabus</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {course.modules?.length || 0} Modules • {totalLessons} Lectures • {course.duration} Total
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allOpen = Object.values(expandedModules).filter(Boolean).length === (course.modules?.length || 0);
                    const newMap: Record<string, boolean> = {};
                    course.modules?.forEach((m) => {
                      newMap[m.id] = !allOpen;
                    });
                    setExpandedModules(newMap);
                  }}
                  className="text-xs font-semibold text-[#004bbb] dark:text-blue-400 hover:underline cursor-pointer self-start sm:self-auto"
                >
                  Expand / Collapse All
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {(!course.modules || course.modules.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-850/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <FiLayers className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Curriculum Modules In Preparation
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      The assigned Terraskills facilitator is uploading the accredited lectures and resources for this masterclass. Check back shortly!
                    </p>
                  </div>
                ) : (
                  course.modules.map((mod, idx) => {
                    const isExpanded = expandedModules[mod.id] ?? (idx === 0);
                    const lessonCount = mod.lessons?.length || 0;

                    return (
                      <div
                        key={mod.id}
                        className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleModule(mod.id)}
                          className="w-full flex items-center justify-between p-4 bg-slate-50/70 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-[#004bbb] dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {mod.title}
                              </h3>
                              <p className="text-[11px] text-slate-500">
                                {lessonCount} lessons
                              </p>
                            </div>
                          </div>

                          {isExpanded ? (
                            <FiChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <FiChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                            {mod.lessons?.map((lesson, lIdx) => (
                              <div
                                key={lesson.id}
                                className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
                              >
                                <div className="flex items-center space-x-3 min-w-0">
                                  <span className="text-slate-400 dark:text-slate-500">
                                    <FiPlay className="w-3.5 h-3.5" />
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                      {lesson.title}
                                    </p>
                                    {lesson.summary && (
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                        {lesson.summary}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 shrink-0 ml-4">
                                  <span className="text-[11px] text-slate-400">
                                    {lesson.duration}
                                  </span>
                                  {isApproved && (
                                    <Link
                                      to={`/courses/${slug}/learn/${lesson.id}`}
                                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#004bbb] dark:text-blue-400 hover:bg-[#004bbb] hover:text-white transition-colors"
                                    >
                                      Watch
                                    </Link>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Instructor Profile Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Faculty Lead & Mentor
              </h2>
              <div className="flex items-center space-x-4">
                {course.instructorAvatar ? (
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructorName}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-600 flex items-center justify-center text-xl font-bold">
                    <FiUser className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {course.instructorName}
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    {course.instructorTitle || 'Senior Industry Faculty Lead'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Terraskills Fellow guiding engineers through applied enterprise systems and modern technology competencies.
                  </p>
                </div>
              </div>
            </div>

            {/* Student Reviews Section */}
            {course.reviews && course.reviews.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <FiStar className="w-5 h-5 text-amber-500 fill-current" />
                  <span>Student Feedback & Reviews</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {course.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                            {rev.user?.name?.charAt(0) || 'S'}
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {rev.user?.name}
                          </span>
                        </div>
                        <div className="flex text-amber-500 text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <FiStar key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Enrollment Card (4 cols) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xl space-y-6">
              {/* Thumbnail with overlay preview */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button
                  onClick={handleEnrollOrResume}
                  className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center group-hover:bg-black/50 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-white text-[#004bbb] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <FiPlay className="w-5 h-5 ml-1 fill-current" />
                  </div>
                </button>
              </div>

              {/* Price & Guarantee */}
              <div className="space-y-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    Free
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    Full Access Included
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Backed by Terraskills Learning Systems Limited
                </p>
              </div>

              {/* Progress bar if approved */}
              {isApproved && (
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#004bbb] dark:text-blue-300">
                      Your Course Progress
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#004bbb] to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Pending facilitator approval notification */}
              {isPending && (
                <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                    <FiClock className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                    <span>Admission Pending Facilitator Review</span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                    Your application is under review. A Terraskills facilitator will verify your profile and grant access to this curriculum on your student dashboard.
                  </p>
                </div>
              )}

              {/* Action Button */}
              {isApproved ? (
                <button
                  onClick={handleEnrollOrResume}
                  className="w-full py-3.5 px-6 rounded-2xl text-sm font-extrabold text-white bg-[#004bbb] hover:bg-[#083eb3] transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{progressPercent === 100 ? 'Review Lectures' : 'Continue to Classroom'}</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              ) : isPending ? (
                <button
                  disabled
                  className="w-full py-3.5 px-6 rounded-2xl text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-900/40 border border-amber-300/80 dark:border-amber-700/60 flex items-center justify-center space-x-2 cursor-not-allowed"
                >
                  <FiClock className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>Awaiting Facilitator Approval</span>
                </button>
              ) : (
                <button
                  onClick={handleEnrollOrResume}
                  className="w-full py-3.5 px-6 rounded-2xl text-sm font-extrabold text-white bg-[#004bbb] hover:bg-[#083eb3] transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Apply for Course Admission (Free)</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* What is included checklist */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Program Includes:
                </p>

                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center space-x-2.5">
                    <FiPlay className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{course.duration} on-demand video lectures</span>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <FiLayers className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{totalLessons} lessons with interactive checkpoints</span>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <FiBook className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Personalized timestamped lesson notes</span>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <FiAward className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Verifiable accredited Terraskills certificate</span>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <FiShield className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Lifetime curriculum access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

