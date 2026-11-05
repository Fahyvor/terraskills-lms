import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiBookOpen,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiPlay,
  FiArrowRight,
  FiUser,
  FiPhone,
  FiMapPin,
} from 'react-icons/fi';
import { useAppSelector } from '../store';
import { Course } from '../types';

interface DashboardViewProps {
  onSelectCourseBySlug?: (slug: string) => void;
  onExploreCourses?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectCourseBySlug,
  onExploreCourses,
}) => {
  const navigate = useNavigate();
  const { user, enrollments } = useAppSelector((state) => state.auth);

  const handleExplore = () => {
    if (onExploreCourses) {
      onExploreCourses();
    } else {
      navigate('/');
    }
  };

  const handleSelectCourse = (slug: string) => {
    if (onSelectCourseBySlug) {
      onSelectCourseBySlug(slug);
    } else {
      navigate(`/courses/${slug}/learn`);
    }
  };

  // Separate approved curriculums from pending facilitator reviews
  const approvedEnrollments = enrollments.filter((e) => e.status === 'approved');
  const pendingEnrollments = enrollments.filter((e) => e.status === 'pending');

  const totalEnrolled = approvedEnrollments.length;
  const completedCourses = approvedEnrollments.filter(
    (e) => e.completed || e.progressPercent === 100
  );
  const totalCompleted = completedCourses.length;

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome Header */}
      <div className="bg-gradient-to-r from-blue-900 via-[#004bbb] to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center space-x-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Terraskills Student Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name || 'Scholar'}!
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/80 mt-1">
                Track your active curricula, review your video lesson completion, and access your accredited graduation certificates.
              </p>

              {(user?.whatsapp || user?.address) && (
                <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 text-xs text-blue-150">
                  {user?.whatsapp && (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-white backdrop-blur-xs">
                      <FiPhone className="w-3 h-3 text-emerald-300" />
                      <span>{user.whatsapp}</span>
                    </span>
                  )}
                  {user?.address && (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-white backdrop-blur-xs">
                      <FiMapPin className="w-3 h-3 text-amber-300" />
                      <span>{user.address}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleExplore}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-[#004bbb] hover:bg-blue-50 transition-all shadow-md cursor-pointer flex items-center space-x-2 shrink-0"
          >
            <span>Explore New Courses</span>
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-blue-200">Active Curriculums</p>
            <p className="text-2xl font-extrabold">{totalEnrolled}</p>
          </div>
          <div>
            <p className="text-xs text-blue-200">Pending Facilitator Review</p>
            <p className="text-2xl font-extrabold text-amber-300">
              {pendingEnrollments.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-200">Completed Programs</p>
            <p className="text-2xl font-extrabold text-emerald-300">{totalCompleted}</p>
          </div>
        </div>
      </div>

      {/* Pending Facilitator Admissions Section */}
      {pendingEnrollments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FiClock className="w-5 h-5 text-amber-500 animate-pulse" />
              <span>Pending Facilitator Admissions</span>
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800">
              {pendingEnrollments.length} Awaiting Approval
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            A Terraskills facilitator must review and grant access to these courses before you can enter the video classroom and track your progress.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingEnrollments.map((enr) => (
              <div
                key={enr.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200/90 dark:border-amber-900/60 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex space-x-4">
                  <img
                    src={enr.course.thumbnail}
                    alt={enr.course.title}
                    className="w-24 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      {enr.course.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {enr.course.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <FiClock className="w-3 h-3 text-amber-500" />
                      <span>
                        Applied {new Date(enr.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    <span>Awaiting Facilitator Grant</span>
                  </span>

                  <Link
                    to={`/courses/${enr.course.slug}`}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Syllabus
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrolled Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FiBookOpen className="w-5 h-5 text-[#004bbb] dark:text-blue-400" />
            <span>My Active Curriculums</span>
          </h2>
          <span className="text-xs text-slate-500">{totalEnrolled} Active</span>
        </div>

        {approvedEnrollments.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <FiBookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {pendingEnrollments.length > 0
                ? 'Your course admissions are awaiting facilitator approval.'
                : "You don't have any active approved courses yet."}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {pendingEnrollments.length > 0
                ? 'A Terraskills facilitator is reviewing your admission application. As soon as access is granted, your video lessons will appear here.'
                : 'Explore the Terraskills course catalog to apply for admission in digital marketing, software engineering, data analytics, cybersecurity, or graduate employability skills.'}
            </p>
            <button
              onClick={handleExplore}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#004bbb] hover:bg-[#083eb3] transition-colors cursor-pointer"
            >
              Browse Course Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedEnrollments.map((enr) => {
              const isCompleted = enr.completed || enr.progressPercent === 100;

              return (
                <div
                  key={enr.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-400 transition-colors"
                >
                  <div className="flex space-x-4">
                    <img
                      src={enr.course.thumbnail}
                      alt={enr.course.title}
                      className="w-24 h-20 rounded-xl object-cover shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {enr.course.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {enr.course.title}
                      </h3>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center space-x-1">
                          <FiClock className="w-3 h-3" />
                          <span>{enr.course.duration}</span>
                        </span>
                        <span>•</span>
                        <span>
                          {enr.completedLessonsCount} of {enr.totalLessonsCount} lessons
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-400">
                        {isCompleted ? 'Curriculum Finished' : 'Progress'}
                      </span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        {enr.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-[#004bbb] to-[#e5192d]'
                        }`}
                        style={{ width: `${enr.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    {isCompleted ? (
                      <Link
                        to={`/certificates/${enr.certificateId || enr.id}`}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        <FiAward className="w-4 h-4" />
                        <span>View Official Certificate</span>
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">In Progress</span>
                    )}

                    <button
                      onClick={() => handleSelectCourse(enr.course.slug)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#004bbb] hover:bg-[#083eb3] transition-colors cursor-pointer"
                    >
                      <FiPlay className="w-3 h-3" />
                      <span>{isCompleted ? 'Review Lectures' : 'Resume Learning'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

