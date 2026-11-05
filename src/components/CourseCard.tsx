import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiClock, FiBook, FiStar, FiUser, FiArrowRight, FiCheck, FiPlay } from 'react-icons/fi';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onSelectCourse?: (course: Course) => void;
  progressPercent?: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onSelectCourse,
  progressPercent,
}) => {
  const navigate = useNavigate();
  const isEnrolled = course.isEnrolled || typeof progressPercent === 'number';
  const progress = progressPercent || 0;

  const handleClick = () => {
    if (onSelectCourse) {
      onSelectCourse(course);
    } else {
      navigate(`/courses/${course.slug}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1.5"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
          <span className="px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase rounded-md bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-xs shadow-xs border border-white/20">
            {course.category}
          </span>
          {course.badge && (
            <span className="px-2 py-1 text-[10px] font-extrabold uppercase rounded-md bg-[#e5192d] text-white shadow-xs">
              {course.badge}
            </span>
          )}
        </div>

        {/* Level Tag */}
        <div className="absolute bottom-3 right-3">
          <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded bg-slate-900/80 text-white backdrop-blur-xs">
            {course.level}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row: Rating & Duration */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <div className="flex items-center space-x-1 text-amber-500 font-bold">
              <FiStar className="w-3.5 h-3.5 fill-current" />
              <span>{course.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({course.reviewsCount})</span>
            </div>

            <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <FiClock className="w-3.5 h-3.5" />
                <span>{course.duration}</span>
              </span>
              {course.lessonCount && (
                <span className="flex items-center space-x-1">
                  <FiBook className="w-3.5 h-3.5" />
                  <span>{course.lessonCount} lessons</span>
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#004bbb] dark:group-hover:text-blue-400 transition-colors leading-snug">
            {course.title}
          </h3>

          {/* Subtitle */}
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {course.subtitle}
          </p>
        </div>

        {/* Footer info: Instructor and Progress / Action */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              {course.instructorAvatar ? (
                <img
                  src={course.instructorAvatar}
                  alt={course.instructorName}
                  className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <FiUser className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {course.instructorName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">Faculty Mentor</p>
              </div>
            </div>

            <div className="shrink-0 pl-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#004bbb] dark:text-blue-400 group-hover:bg-[#004bbb] group-hover:text-white transition-all">
                <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>

          {/* Progress Bar if enrolled */}
          {isEnrolled && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {progress === 100 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                      <FiCheck className="w-3 h-3 mr-1" /> Completed
                    </span>
                  ) : (
                    'Your Progress'
                  )}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    progress === 100
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-[#004bbb] to-[#e5192d]'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

