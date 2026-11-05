import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiCompass, FiAlertCircle } from 'react-icons/fi';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-8 py-12">
      <div className="w-full text-center space-y-6">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-blue-100 dark:bg-blue-950/60 text-[#004bbb] dark:text-blue-400 flex items-center justify-center mx-auto text-4xl font-extrabold shadow-inner">
            404
          </div>
          <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#e5192d] text-white">
            <FiAlertCircle className="w-4 h-4" />
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Page or Program Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            The page, lesson, or resource you are looking for might have been updated, relocated, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#004bbb] hover:bg-[#083eb3] transition-all shadow-md cursor-pointer"
          >
            <FiHome className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <FiCompass className="w-4 h-4" />
            <span>My Learning</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

