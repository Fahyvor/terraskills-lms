import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiMapPin,
  FiEye,
  FiEyeOff,
  FiShield,
  FiCheckCircle,
  FiArrowLeft,
  FiBookOpen,
  FiPlus,
} from 'react-icons/fi';
import { toast } from 'sleek-toast';
import { useAppDispatch, useAppSelector } from '../store';
import { registerUser, fetchMe, clearAuthError } from '../store/slices/authSlice';

interface CourseOption {
  id: string;
  title: string;
  category: string;
  thumbnail?: string;
}

export const InstructorRegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);

  // Profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Course registration fields
  const [coursesList, setCoursesList] = useState<CourseOption[]>([]);
  const [courseMode, setCourseMode] = useState<'existing' | 'new'>('existing');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Digital Marketing');
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Load available courses on mount
  useEffect(() => {
    async function loadCourses() {
      setIsLoadingCourses(true);
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        if (data.courses && Array.isArray(data.courses)) {
          setCoursesList(data.courses);
          if (data.courses.length > 0) {
            setSelectedCourseId(data.courses[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load courses for registration', err);
      } finally {
        setIsLoadingCourses(false);
      }
    }
    loadCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      toast.error('Please provide your full name, faculty email, and password.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match. Please verify both password fields.');
      return;
    }

    if (courseMode === 'existing' && !selectedCourseId) {
      toast.error('Please select the curriculum you will be facilitating.');
      return;
    }

    if (courseMode === 'new' && !newCourseTitle.trim()) {
      toast.error('Please provide a title for the new course curriculum.');
      return;
    }

    const res = await dispatch(
      registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        whatsapp: whatsapp.trim() || undefined,
        address: address.trim() || undefined,
        role: 'instructor',
        courseId: courseMode === 'existing' ? selectedCourseId : undefined,
        courseTitle: courseMode === 'new' ? newCourseTitle.trim() : undefined,
        courseCategory: courseMode === 'new' ? newCourseCategory : undefined,
      })
    );

    if (registerUser.fulfilled.match(res)) {
      toast.success('Faculty mentor account created and course assigned! Welcome to Terraskills Studio.');
      dispatch(fetchMe());
      navigate('/studio', { replace: true });
    } else {
      toast.error((res.payload as string) || 'Faculty registration failed. Please try again.');
    }
  };

  const selectedCourse = coursesList.find((c) => c.id === selectedCourseId);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-8 lg:px-16 py-8">
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-emerald-200/80 dark:border-emerald-900/60 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <FiShield className="w-3.5 h-3.5" />
            <span>Faculty & Instructor Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Register as Faculty Mentor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mx-auto">
            Create your instructor account, link your assigned curriculum, and manage student admissions.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Legal Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiUser className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Aminu Bello / Engr. Fatima Yusuf"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Faculty Email Address *
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
                  placeholder="faculty@terraskills.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* WhatsApp Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Contact Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiPhone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department / Office Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiMapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Terraskills Learning Complex, Abuja, Nigeria"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Dedicated Course Assignment Section */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/90 dark:border-emerald-800/80 space-y-4">
            <div className="flex items-center space-x-2">
              <FiBookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Assigned Faculty Course & Track *
              </h3>
            </div>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed">
              Register for the course you will lead. You will be designated as the faculty mentor with studio publishing privileges and direct access control over student admissions.
            </p>

            {/* Radio mode selection */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-800 dark:text-slate-200">
                <input
                  type="radio"
                  name="courseMode"
                  checked={courseMode === 'existing'}
                  onChange={() => setCourseMode('existing')}
                  className="text-emerald-600 focus:ring-0"
                />
                <span>Select Accredited Course</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-slate-800 dark:text-slate-200">
                <input
                  type="radio"
                  name="courseMode"
                  checked={courseMode === 'new'}
                  onChange={() => setCourseMode('new')}
                  className="text-emerald-600 focus:ring-0"
                />
                <span>Register New Course Track</span>
              </label>
            </div>

            {courseMode === 'existing' ? (
              <div className="space-y-3 pt-2">
                <div className="relative">
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {coursesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Course Preview */}
                {selectedCourse && (
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60">
                    {selectedCourse.thumbnail && (
                      <img
                        src={selectedCourse.thumbnail}
                        alt={selectedCourse.title}
                        className="w-14 h-11 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {selectedCourse.category}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {selectedCourse.title}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 shrink-0">
                      Assigned Lead
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Course Title *
                  </label>
                  <input
                    type="text"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    placeholder="e.g. Applied Artificial Intelligence & Enterprise Agentic Systems"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Discipline / Category *
                  </label>
                  <select
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Frontend Development">Frontend Development</option>
                    <option value="Backend Development">Backend Development</option>
                    <option value="Data Analytics">Data Analytics</option>
                    <option value="AI Automation">AI Automation</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Faculty Account Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiLock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FiLock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-11 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">
                  Passwords do not match.
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || (confirmPassword.length > 0 && password !== confirmPassword)}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2 mt-4"
          >
            <FiCheckCircle className="w-4 h-4" />
            <span>
              {isLoading
                ? 'Creating Faculty Account...'
                : 'Complete Registration & Course Assignment'}
            </span>
          </button>
        </form>

        {/* Footer links */}
        <div className="space-y-3 pt-3 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            Already have a faculty account?{' '}
            <Link
              to="/instructor/login"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Sign In to Faculty Portal
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
