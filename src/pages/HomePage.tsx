import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiFilter,
  FiBookOpen,
  FiCode,
  FiShield,
  FiAward,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchCourses,
  setCategory,
  setLevel,
  setSearchQuery,
} from '../store/slices/courseSlice';
import { HeroBanner } from '../components/HeroBanner';
import { CourseCard } from '../components/CourseCard';

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    courses,
    selectedCategory,
    selectedLevel,
    searchQuery,
    isLoading: isCoursesLoading,
  } = useAppSelector((state) => state.course);
  const { enrollments } = useAppSelector((state) => state.auth);

  // Sync URL search params with store
  const urlCategory = searchParams.get('category') || 'All';
  const urlLevel = searchParams.get('level') || 'All';
  const urlSearch = searchParams.get('search') || '';

  // Synchronize URL params to store and fetch courses
  useEffect(() => {
    dispatch(setCategory(urlCategory));
    dispatch(setLevel(urlLevel));
    dispatch(setSearchQuery(urlSearch));

    dispatch(
      fetchCourses({
        category: urlCategory,
        level: urlLevel,
        search: urlSearch,
      })
    );
  }, [dispatch, urlCategory, urlLevel, urlSearch]);

  const updateFilters = (newCategory?: string, newLevel?: string, newSearch?: string) => {
    const params = new URLSearchParams(searchParams);

    const cat = newCategory !== undefined ? newCategory : urlCategory;
    const lvl = newLevel !== undefined ? newLevel : urlLevel;
    const q = newSearch !== undefined ? newSearch : urlSearch;

    if (cat && cat !== 'All') params.set('category', cat);
    else params.delete('category');

    if (lvl && lvl !== 'All') params.set('level', lvl);
    else params.delete('level');

    if (q && q.trim()) params.set('search', q.trim());
    else params.delete('search');

    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    dispatch(setCategory('All'));
    dispatch(setLevel('All'));
    dispatch(setSearchQuery(''));
  };

  // Build a map of courseId -> user progress percent from auth enrollments
  const enrollmentProgressMap = new Map<string, number>();
  enrollments.forEach((e) => {
    enrollmentProgressMap.set(e.courseId, e.progressPercent);
  });

  return (
    <div>
      {/* Hero Section */}
      <HeroBanner
        onExploreCourses={() => {
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectCategory={(cat) => updateFilters(cat, undefined, undefined)}
        selectedCategory={urlCategory}
      />

      {/* Catalog Grid Section */}
      <section id="catalog-section" className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Filter and Heading Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Curated Professional Programs</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#004bbb] dark:text-blue-300">
                {courses.length} Available
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Accredited curricula designed and reviewed by Terraskills industry fellows.
            </p>
          </div>

          {/* Level selector */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
              <FiFilter className="w-3.5 h-3.5" />
              <span>Level:</span>
            </span>
            <select
              value={urlLevel}
              onChange={(e) => updateFilters(undefined, e.target.value, undefined)}
              className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="All">All Competency Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Active filter pills */}
        {(urlCategory !== 'All' || urlLevel !== 'All' || urlSearch) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400">Active filters:</span>
            {urlCategory !== 'All' && (
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#004bbb] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Category: {urlCategory}
              </span>
            )}
            {urlLevel !== 'All' && (
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Level: {urlLevel}
              </span>
            )}
            {urlSearch && (
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Search: "{urlSearch}"
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Courses Grid */}
        {isCoursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800/60"
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <FiBookOpen className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No courses found matching your criteria.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your category filter or search keywords.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl text-white bg-[#004bbb] hover:bg-[#083eb3] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                progressPercent={enrollmentProgressMap.get(course.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Why Terraskills Value Section */}
      <section className="bg-slate-100/70 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800 py-16">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#004bbb] dark:text-blue-400">
              The Terraskills Advantage
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Engineered for Career Mastery
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              Unlike surface-level tutorials, Terraskills curriculum systems combine rigorous architectural fundamentals with real-time video demonstrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-[#004bbb] dark:text-blue-400 flex items-center justify-center mb-4">
                <FiCode className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Dual Video Stream Options
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Leverage official embeddable YouTube lectures or upload proprietary enterprise media streams directly with native speed controls and resume memory.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/80 text-[#e5192d] dark:text-red-400 flex items-center justify-center mb-4">
                <FiShield className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Zero-Library Native Security
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Built following battle-tested engineering best practices: 12-round bcrypt salt hashing, signed JWT sessions, sliding-window rate limiters, and Prisma parameterized defense.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4">
                <FiAward className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Accredited Graduation Credentials
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Earn verifiable Terraskills certificates complete with unique verification serial codes, lead faculty signatures, and printable high-resolution PDF exports.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

