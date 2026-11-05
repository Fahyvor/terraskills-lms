import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const RouteLoadingSpinner = () => (
  <div className="flex-1 min-h-[50vh] flex flex-col items-center justify-center space-y-3">
    <div className="w-8 h-8 border-3 border-[#004bbb] border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-semibold text-slate-400">Loading Terraskills LMS...</span>
  </div>
);

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar />

      {/* Main View Outlet with Code-Splitting Suspense */}
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<RouteLoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>

      {/* Terraskills Footer Component */}
      <Footer />
    </div>
  );
};

