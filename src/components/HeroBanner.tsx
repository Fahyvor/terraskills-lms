import React from 'react';
import { FiCheckCircle, FiPlayCircle, FiAward, FiUsers, FiTrendingUp } from 'react-icons/fi';

interface HeroBannerProps {
  onExploreCourses: () => void;
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreCourses,
  onSelectCategory,
  selectedCategory,
}) => {
  const categories = [
    'All',
    'Digital Marketing',
    'Frontend Development',
    'Backend Development',
    'Data Analytics',
    'AI Automation',
    'Cybersecurity',
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 pt-12 pb-14 border-b border-slate-200/60 dark:border-slate-800 transition-colors">
      {/* Subtle organic brand light glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-64 bg-gradient-to-r from-blue-500/10 via-red-500/5 to-blue-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Brand Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs mb-6">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e5192d]"></span>
            </span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Terraskills Learning Systems Limited
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
            <span className="text-xs font-bold text-[#004bbb] dark:text-blue-400">
              2026 Curriculum
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Learn Skills That Matter.{' '}
            <span className="bg-gradient-to-r from-[#004bbb] via-blue-600 to-[#e5192d] bg-clip-text text-transparent">
              Built for Real Careers.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Engage with masterclass video lectures, track your progress with granular milestones,
            take interactive timestamped notes, and earn verifiable industry-grade credentials.
          </p>

          {/* Quick Category Badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#004bbb] text-white shadow-md shadow-blue-500/20 scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-[#004bbb] dark:text-blue-400 flex items-center justify-center shrink-0">
              <FiPlayCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">HD Video Lectures</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">YouTube & Direct Streams</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/70 text-[#e5192d] dark:text-red-400 flex items-center justify-center shrink-0">
              <FiTrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Granular Progress</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Auto-saved checkpoints</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <FiAward className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Verifiable Certificate</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Official Terraskills ID</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FiCheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Hands-on Labs</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Prisma, React & Cloud</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

