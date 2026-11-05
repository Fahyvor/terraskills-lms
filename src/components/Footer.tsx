import React from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiShield, FiBookOpen } from 'react-icons/fi';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 transition-colors mt-auto">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Company Name */}
          <div className="flex items-center space-x-3">
            <img
              src="/terraskills-logo.png"
              alt="Terraskills Learning Systems"
              className="h-10 w-auto object-contain"
            />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                TERRASKILLS LEARNING SYSTEMS LIMITED
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Empowering Professionals & Enterprises Through Practical Competency Systems
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Link to="/" className="hover:text-[#004bbb] dark:hover:text-blue-400 transition-colors">
              Courses
            </Link>
            <span>•</span>
            <Link to="/dashboard" className="hover:text-[#004bbb] dark:hover:text-blue-400 transition-colors">
              Student Portal
            </Link>
            <span>•</span>
            <span className="flex items-center space-x-1 text-slate-500">
              <FiAward className="w-3.5 h-3.5 text-amber-500" />
              <span>Accredited Credentials</span>
            </span>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Terraskills Learning Systems Limited. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

