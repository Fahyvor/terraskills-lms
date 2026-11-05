import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FiSun,
  FiMoon,
  FiUser,
  FiLogOut,
  FiBookOpen,
  FiPlusCircle,
  FiSearch,
  FiAward,
  FiCheckCircle,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleTheme } from '../store/slices/themeSlice';
import { logout } from '../store/slices/authSlice';
import { setSearchQuery } from '../store/slices/courseSlice';

interface NavbarProps {
  onOpenAuth?: () => void;
  onOpenStudio?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenStudio,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector((state) => state.theme.mode);
  const { user, isAuthenticated, enrollments } = useAppSelector((state) => state.auth);
  const searchQuery = useAppSelector((state) => state.course.searchQuery);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const completedCoursesCount = enrollments.filter((e) => e.completed || e.progressPercent === 100).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors duration-200">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-3 group text-left cursor-pointer focus:outline-none"
            >
              <img
                src="/terraskills-logo.png"
                alt="Terraskills Learning Systems"
                className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
              {/* <div className="hidden sm:block">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-[#004bbb] dark:text-blue-400">
                    TÉ<span className="text-[#e5192d]">RRASKILLS</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-[#004bbb] dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                    LMS
                  </span>
                </div>
                <p className="text-[10px] tracking-wide uppercase font-medium text-slate-500 dark:text-slate-400">
                  Learning Systems Limited
                </p>
              </div> */}
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center space-x-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-[#004bbb] dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                Browse Catalog
              </NavLink>

              {isAuthenticated && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center space-x-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-[#004bbb] dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <FiBookOpen className="w-4 h-4" />
                  <span>My Learning</span>
                  {enrollments.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold rounded-full bg-blue-600 text-white leading-none">
                      {enrollments.length}
                    </span>
                  )}
                </NavLink>
              )}

              {isAuthenticated && (user?.role === 'instructor' || user?.role === 'admin') && (
                <NavLink
                  to="/studio"
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center space-x-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <FiPlusCircle className="w-4 h-4 text-emerald-500" />
                  <span>Instructor Studio</span>
                </NavLink>
              )}
            </nav>
          </div>

          {/* Search bar in center (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FiSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                placeholder="Search courses, skills, or faculty..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-full border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    dispatch(setSearchQuery(''));
                    navigate('/');
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center space-x-3">
            {/* Light / Dark Mode Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-transform duration-200 hover:scale-105 cursor-pointer border border-slate-200/60 dark:border-slate-700"
            >
              {theme === 'light' ? (
                <FiMoon className="w-4 h-4 text-slate-700 hover:text-blue-600 transition-colors" />
              ) : (
                <FiSun className="w-4 h-4 text-amber-400 transition-colors" />
              )}
            </button>

            {/* Auth / User Profile */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2.5 p-1 rounded-full hover:ring-2 hover:ring-blue-500/30 transition-all cursor-pointer focus:outline-none"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-600/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden sm:block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                      <div className="mt-1.5 flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          {user.role}
                        </span>
                        {completedCoursesCount > 0 && (
                          <span className="text-[10px] font-semibold flex items-center text-emerald-600 dark:text-emerald-400">
                            <FiAward className="w-3 h-3 mr-1" />
                            {completedCoursesCount} Certified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center space-x-2 cursor-pointer"
                      >
                        <FiBookOpen className="w-4 h-4 text-blue-500" />
                        <span>My Enrolled Courses</span>
                      </Link>

                      {(user.role === 'instructor' || user.role === 'admin') && (
                        <Link
                          to="/studio"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center space-x-2 cursor-pointer font-semibold text-emerald-600 dark:text-emerald-400"
                        >
                          <FiPlusCircle className="w-4 h-4 text-emerald-500" />
                          <span>Instructor Studio</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          dispatch(logout());
                          navigate('/');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center space-x-2 cursor-pointer"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#004bbb] hover:bg-[#083eb3] dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

