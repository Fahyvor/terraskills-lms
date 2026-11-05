import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { FiLock, FiAlertTriangle, FiLogIn, FiArrowLeft, FiShield } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'instructor' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#004bbb] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-[#004bbb] dark:text-blue-400 flex items-center justify-center mx-auto">
            <FiLock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Authentication Required
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Please sign in to access your Terraskills learning space, curriculum progress, and student credentials.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              to="/login"
              state={{ from: location }}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#004bbb] hover:bg-[#083eb3] transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
            >
              <FiLogIn className="w-4 h-4" />
              <span>Sign In to Continue</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <FiAlertTriangle className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Access Restricted
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              This area is restricted. You do not have permission to view this resource.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#004bbb] hover:bg-[#083eb3] transition-all cursor-pointer"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Return to Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
