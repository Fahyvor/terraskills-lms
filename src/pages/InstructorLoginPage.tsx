import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiLogIn, FiArrowLeft, FiShield, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'sleek-toast';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser, fetchMe, clearAuthError } from '../store/slices/authSlice';

export const InstructorLoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'instructor' || user?.role === 'admin') {
        navigate('/studio', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please provide faculty email and password.');
      return;
    }

    const res = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(res)) {
      toast.success('Faculty session verified! Welcome to Course Studio.');
      dispatch(fetchMe());
      navigate('/studio', { replace: true });
    } else {
      toast.error((res.payload as string) || 'Invalid faculty credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-8 lg:px-16 py-8">
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-emerald-200/80 dark:border-emerald-900/60 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <FiShield className="w-3.5 h-3.5" />
            <span>Faculty & Instructor Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Instructor Access
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your course studio, manage video lessons, and review student progress
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Faculty Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiMail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="instructor@terraskills.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Security Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
          >
            <FiLogIn className="w-4 h-4" />
            <span>{isLoading ? 'Verifying Faculty Session...' : 'Sign In as Faculty Mentor'}</span>
          </button>
        </form>

        {/* Footer links */}
        <div className="space-y-3 pt-3 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            New faculty member?{' '}
            <Link
              to="/instructor/register"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Register Faculty Account
            </Link>
          </p>

          <p className="text-xs text-slate-500">
            Student or Scholar?{' '}
            <Link to="/login" className="font-bold text-[#004bbb] dark:text-blue-400 hover:underline">
              Go to Student Sign In
            </Link>
          </p>

          <div>
            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <FiArrowLeft className="w-3 h-3" />
              <span>Back to Course Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
