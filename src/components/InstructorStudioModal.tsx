import React, { useState, useEffect, useCallback } from 'react';
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiYoutube,
  FiUploadCloud,
  FiCheck,
  FiLayers,
  FiVideo,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiPhone,
  FiMapPin,
  FiSearch,
  FiUserCheck,
  FiUserX,
  FiRefreshCw,
  FiExternalLink,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../store';
import { createNewCourse, updateExistingCourse, fetchCourses } from '../store/slices/courseSlice';
import { AdmissionRecord, StudentSummary } from '../types';
import { toast } from 'sleek-toast';

interface InstructorStudioModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  mode?: 'modal' | 'page';
  onCourseCreated?: (slug: string) => void;
}

interface TempLesson {
  title: string;
  duration: string;
  videoType: 'youtube' | 'upload';
  videoUrl: string;
  description: string;
  file?: File;
}

interface TempModule {
  title: string;
  lessons: TempLesson[];
}

export const InstructorStudioModal: React.FC<InstructorStudioModalProps> = ({
  isOpen = true,
  onClose,
  mode = 'modal',
  onCourseCreated,
}) => {
  const isPage = mode === 'page';
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  // Studio Navigation Tab
  const [activeTab, setActiveTab] = useState<'admissions' | 'authoring'>('admissions');

  // Admissions & Access Control state
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [coursesList, setCoursesList] = useState<
    Array<{ id: string; title: string; slug: string; category: string }>
  >([]);
  const [isLoadingAdmissions, setIsLoadingAdmissions] = useState(false);
  const [admissionFilter, setAdmissionFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Direct student admission form state
  const [directStudentId, setDirectStudentId] = useState('');
  const [directCourseId, setDirectCourseId] = useState('');
  const [isDirectEnrolling, setIsDirectEnrolling] = useState(false);

  // Action busy states
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  // Course Authoring Form State
  const [selectedCourseId, setSelectedCourseId] = useState<string>('new');
  const [isLoadingCourseDetails, setIsLoadingCourseDetails] = useState<boolean>(false);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Digital Marketing');
  const [level, setLevel] = useState('All Levels');
  const [thumbnail, setThumbnail] = useState('');
  const [duration, setDuration] = useState('');

  const [modules, setModules] = useState<TempModule[]>([
    {
      title: '',
      lessons: [
        {
          title: '',
          duration: '',
          videoType: 'youtube',
          videoUrl: '',
          description: '',
        },
      ],
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Load Admissions Data
  const loadAdmissions = useCallback(async () => {
    if (!token) return;
    setIsLoadingAdmissions(true);
    try {
      const res = await fetch('/api/facilitator/admissions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAdmissions(data.admissions || []);
        setStudents(data.students || []);
        setCoursesList(data.courses || []);

        // Default direct admission selectors if available
        if (data.students?.length > 0 && !directStudentId) {
          setDirectStudentId(data.students[0].id);
        }
        if (data.courses?.length > 0 && !directCourseId) {
          setDirectCourseId(data.courses[0].id);
        }
      } else {
        toast.error(data.error || 'Failed to load admissions.');
      }
    } catch (err: any) {
      console.error('Admissions load error:', err);
      toast.error('Network error loading student admissions.');
    } finally {
      setIsLoadingAdmissions(false);
    }
  }, [token, directStudentId, directCourseId]);

  useEffect(() => {
    if (token) {
      loadAdmissions();
    }
  }, [token, loadAdmissions]);

  // Ensure course catalog list is available for authoring
  useEffect(() => {
    if (coursesList.length === 0) {
      fetch('/api/courses')
        .then((res) => res.json())
        .then((data) => {
          if (data?.courses && Array.isArray(data.courses)) {
            setCoursesList(
              data.courses.map((c: any) => ({
                id: c.id,
                title: c.title,
                slug: c.slug,
                category: c.category,
              }))
            );
          }
        })
        .catch((err) => console.error('Error fetching course catalog list:', err));
    }
  }, [coursesList.length]);

  if (!isPage && !isOpen) return null;

  // Handle Facilitator Approving Access
  const handleGrantAccess = async (enrollmentId: string) => {
    if (!token) return;
    setActionInProgressId(enrollmentId);
    try {
      const res = await fetch('/api/facilitator/grant-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enrollmentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to grant access');
        return;
      }
      toast.success(data.message || 'Course access granted!');
      setAdmissions((prev) =>
        prev.map((a) =>
          a.id === enrollmentId
            ? { ...a, status: 'approved', approvedAt: new Date().toISOString() }
            : a
        )
      );
    } catch (err: any) {
      console.error(err);
      toast.error('Network error while granting access');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle Facilitator Revoking Access
  const handleRevokeAccess = async (enrollmentId: string) => {
    if (!token) return;
    setActionInProgressId(enrollmentId);
    try {
      const res = await fetch('/api/facilitator/revoke-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enrollmentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to revoke access');
        return;
      }
      toast.info(data.message || 'Course access revoked.');
      setAdmissions((prev) =>
        prev.map((a) =>
          a.id === enrollmentId
            ? { ...a, status: 'pending', approvedAt: null }
            : a
        )
      );
    } catch (err: any) {
      console.error(err);
      toast.error('Network error while revoking access');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle Direct Enrollment
  const handleDirectEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !directStudentId || !directCourseId) {
      toast.error('Please select both a student and a course.');
      return;
    }
    setIsDirectEnrolling(true);
    try {
      const res = await fetch('/api/facilitator/direct-enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: directStudentId, courseId: directCourseId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to assign course');
        return;
      }
      toast.success(data.message || 'Student enrolled and granted access!');
      await loadAdmissions();
    } catch (err: any) {
      console.error(err);
      toast.error('Network error while assigning course');
    } finally {
      setIsDirectEnrolling(false);
    }
  };

  // Filtering admissions
  const filteredAdmissions = admissions.filter((adm) => {
    // Status filter
    if (admissionFilter === 'pending' && adm.status !== 'pending') return false;
    if (admissionFilter === 'approved' && adm.status !== 'approved') return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchName = adm.user.name?.toLowerCase().includes(q);
      const matchEmail = adm.user.email?.toLowerCase().includes(q);
      const matchCourse = adm.course.title?.toLowerCase().includes(q);
      const matchCategory = adm.course.category?.toLowerCase().includes(q);
      const matchPhone = adm.user.whatsapp?.toLowerCase().includes(q);
      return matchName || matchEmail || matchCourse || matchCategory || matchPhone;
    }
    return true;
  });

  const pendingCount = admissions.filter((a) => a.status === 'pending').length;
  const approvedCount = admissions.filter((a) => a.status === 'approved').length;

  // Course Selector Handler for Editing & Filling In
  const handleSelectCourseToEdit = async (courseIdOrNew: string) => {
    setSelectedCourseId(courseIdOrNew);
    if (courseIdOrNew === 'new') {
      setTitle('');
      setSubtitle('');
      setDescription('');
      setCategory('Digital Marketing');
      setLevel('All Levels');
      setThumbnail('');
      setDuration('');
      setModules([
        {
          title: '',
          lessons: [
            {
              title: '',
              duration: '',
              videoType: 'youtube',
              videoUrl: '',
              description: '',
            },
          ],
        },
      ]);
      return;
    }

    const targetCourse = coursesList.find((c) => c.id === courseIdOrNew);
    if (!targetCourse) return;

    setIsLoadingCourseDetails(true);
    try {
      const res = await fetch(`/api/courses/${targetCourse.slug}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.course) {
        const c = data.course;
        setTitle(c.title || '');
        setSubtitle(c.subtitle || '');
        setDescription(c.description || '');
        setCategory(c.category || 'Digital Marketing');
        setLevel(c.level || 'All Levels');
        setThumbnail(c.thumbnail || '');
        setDuration(c.duration || '');

        if (c.modules && c.modules.length > 0) {
          setModules(
            c.modules.map((m: any) => ({
              title: m.title || '',
              lessons:
                m.lessons && m.lessons.length > 0
                  ? m.lessons.map((l: any) => ({
                      title: l.title || '',
                      duration: l.duration || '',
                      videoType: l.videoType === 'upload' ? 'upload' : 'youtube',
                      videoUrl: l.videoUrl || '',
                      description: l.description || '',
                    }))
                  : [
                      {
                        title: '',
                        duration: '',
                        videoType: 'youtube',
                        videoUrl: '',
                        description: '',
                      },
                    ],
            }))
          );
        } else {
          setModules([
            {
              title: '',
              lessons: [
                {
                  title: '',
                  duration: '',
                  videoType: 'youtube',
                  videoUrl: '',
                  description: '',
                },
              ],
            },
          ]);
        }
        toast.success(`Loaded "${c.title}" for editing.`);
      } else {
        toast.error('Failed to load course details.');
      }
    } catch (err) {
      console.error('Error loading course details:', err);
      toast.error('Failed to load course details.');
    } finally {
      setIsLoadingCourseDetails(false);
    }
  };

  // Course Authoring helpers
  const handleAddModule = () => {
    setModules((prev) => [
      ...prev,
      {
        title: '',
        lessons: [
          {
            title: '',
            duration: '',
            videoType: 'youtube',
            videoUrl: '',
            description: '',
          },
        ],
      },
    ]);
  };

  const handleAddLesson = (moduleIndex: number) => {
    setModules((prev) => {
      const copy = [...prev];
      copy[moduleIndex].lessons.push({
        title: '',
        duration: '',
        videoType: 'youtube',
        videoUrl: '',
        description: '',
      });
      return copy;
    });
  };

  const handleRemoveLesson = (moduleIndex: number, lessonIndex: number) => {
    setModules((prev) => {
      const copy = [...prev];
      copy[moduleIndex].lessons.splice(lessonIndex, 1);
      return copy;
    });
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    if (!token) throw new Error('Authentication required to upload videos.');
    const formData = new FormData();
    formData.append('video', file);

    const res = await fetch('/api/upload/video', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to upload video file.');
    }
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a course title.');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a course description.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Preparing course syllabus...');

    try {
      const processedModules = [];
      for (let mIdx = 0; mIdx < modules.length; mIdx++) {
        const mod = modules[mIdx];
        // If module has no title and no lessons with titles/videos, skip
        const hasContent =
          Boolean(mod.title.trim()) ||
          mod.lessons.some((l) => Boolean(l.title.trim()) || Boolean(l.videoUrl.trim()) || Boolean(l.file));

        if (!hasContent) continue;

        const processedLessons = [];

        for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
          const l = mod.lessons[lIdx];
          if (!l.title.trim() && !l.videoUrl.trim() && !l.file) {
            continue;
          }

          let finalVideoUrl = l.videoUrl;

          if (l.videoType === 'upload' && l.file) {
            setStatusMessage(`Uploading video for: ${l.title || 'lesson'}...`);
            finalVideoUrl = await handleFileUpload(l.file);
          }

          processedLessons.push({
            title: l.title || `Lesson ${lIdx + 1}`,
            duration: l.duration || 'Self-paced',
            videoType: l.videoType,
            videoUrl: finalVideoUrl,
            description: l.description || '',
          });
        }

        processedModules.push({
          title: mod.title || `Module ${mIdx + 1}`,
          lessons: processedLessons,
        });
      }

      setStatusMessage('Saving to Terraskills LMS...');

      if (selectedCourseId !== 'new') {
        const updated = await dispatch(
          updateExistingCourse({
            courseId: selectedCourseId,
            courseData: {
              title,
              subtitle: subtitle || 'Terraskills Professional Certification Program',
              description,
              category,
              level,
              thumbnail:
                thumbnail ||
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
              duration: duration || 'Self-paced',
              modules: processedModules,
            },
          })
        ).unwrap();

        toast.success(`"${title}" course syllabus updated successfully!`);
        dispatch(fetchCourses());
        loadAdmissions();

        if (onCourseCreated) {
          onCourseCreated(updated.slug);
        } else if (onClose) {
          onClose();
        }
      } else {
        const created = await dispatch(
          createNewCourse({
            title,
            subtitle: subtitle || 'Terraskills Professional Certification Program',
            description,
            category,
            level,
            thumbnail:
              thumbnail ||
              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
            duration: duration || 'Self-paced',
            modules: processedModules,
          })
        ).unwrap();

        toast.success(`Course "${created.title}" created and published successfully!`);
        dispatch(fetchCourses());
        loadAdmissions();

        if (onCourseCreated) {
          onCourseCreated(created.slug);
        } else if (onClose) {
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Course publish error', err);
      const msg = err.message || 'Failed to save course';
      toast.error(msg);
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardContent = (
    <div
      className={`relative w-full ${
        isPage ? 'w-full my-4' : 'w-full max-h-[92vh]'
      } bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col`}
    >
      {/* Studio Header */}
      <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block ring-4 ring-emerald-100 dark:ring-emerald-950" />
            <span>Terraskills Facilitator & Instructor Studio</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Admit students to curricula, grant video classroom access, and publish accredited courses.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 sm:px-8 gap-6 pt-3">
        <button
          type="button"
          onClick={() => setActiveTab('admissions')}
          className={`pb-3 px-1 text-xs font-bold transition-all relative flex items-center space-x-2 cursor-pointer ${
            activeTab === 'admissions'
              ? 'text-[#004bbb] dark:text-blue-400 border-b-2 border-[#004bbb] dark:border-blue-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FiUsers className="w-4 h-4" />
          <span>Student Admissions & Access Control</span>
          {pendingCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
              {pendingCount} Pending
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('authoring')}
          className={`pb-3 px-1 text-xs font-bold transition-all relative flex items-center space-x-2 cursor-pointer ${
            activeTab === 'authoring'
              ? 'text-[#004bbb] dark:text-blue-400 border-b-2 border-[#004bbb] dark:border-blue-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FiLayers className="w-4 h-4" />
          <span>Course Authoring & Publishing</span>
        </button>
      </div>

      {/* Tab 1: Student Admissions & Access Control */}
      {activeTab === 'admissions' && (
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Pending Review
                </span>
                <FiClock className="w-4 h-4 text-amber-600 animate-pulse" />
              </div>
              <p className="text-2xl font-extrabold text-amber-900 dark:text-amber-200 mt-1">
                {pendingCount}
              </p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                Awaiting your approval
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Access Granted
                </span>
                <FiCheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-1">
                {approvedCount}
              </p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                Active in classroom
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#004bbb] dark:text-blue-300">
                  Total Applications
                </span>
                <FiUsers className="w-4 h-4 text-[#004bbb]" />
              </div>
              <p className="text-2xl font-extrabold text-blue-900 dark:text-blue-200 mt-1">
                {admissions.length}
              </p>
              <p className="text-[11px] text-blue-700/80 dark:text-blue-400/80 mt-0.5">
                Across all programs
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Registered Students
                </span>
                <FiShield className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {students.length}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                In student directory
              </p>
            </div>
          </div>

          {/* Quick Direct Enrollment Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-white dark:from-slate-850 dark:to-slate-800 border border-blue-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiUserCheck className="w-4 h-4 text-[#004bbb] dark:text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Direct Student Course Assignment
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Instantly admit any registered student to any course
              </span>
            </div>

            <form
              onSubmit={handleDirectEnroll}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
            >
              <div className="sm:col-span-5 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Select Registered Student:
                </label>
                <select
                  value={directStudentId}
                  onChange={(e) => setDirectStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name || st.email} ({st.email}) {st.whatsapp ? `• ${st.whatsapp}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Select Terraskills Course:
                </label>
                <select
                  value={directCourseId}
                  onChange={(e) => setDirectCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {coursesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={isDirectEnrolling || students.length === 0 || coursesList.length === 0}
                  className="w-full py-2 px-3 text-xs font-bold text-white bg-[#004bbb] hover:bg-[#083eb3] transition-all rounded-xl shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <FiCheck className="w-3.5 h-3.5" />
                  <span>{isDirectEnrolling ? 'Assigning...' : 'Grant Instant Access'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setAdmissionFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  admissionFilter === 'all'
                    ? 'bg-[#004bbb] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Applications ({admissions.length})
              </button>

              <button
                type="button"
                onClick={() => setAdmissionFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  admissionFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60'
                }`}
              >
                <FiClock className="w-3.5 h-3.5" />
                <span>Pending Review ({pendingCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setAdmissionFilter('approved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  admissionFilter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60'
                }`}
              >
                <FiCheckCircle className="w-3.5 h-3.5" />
                <span>Approved ({approvedCount})</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <FiSearch className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student or course..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={loadAdmissions}
                disabled={isLoadingAdmissions}
                title="Refresh admissions list"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <FiRefreshCw className={`w-3.5 h-3.5 ${isLoadingAdmissions ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Admissions List */}
          {isLoadingAdmissions && admissions.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#004bbb] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading student admissions...</p>
            </div>
          ) : filteredAdmissions.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <FiUsers className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                No course admission records found matching this filter.
              </p>
              <p className="text-[11px] text-slate-400">
                When students apply for courses from the catalog, their applications appear here for facilitator approval.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAdmissions.map((adm) => {
                const isPending = adm.status === 'pending';
                const isActionBusy = actionInProgressId === adm.id;

                return (
                  <div
                    key={adm.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isPending
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-800/80 shadow-xs'
                        : 'bg-white dark:bg-slate-850 border-slate-200/90 dark:border-slate-800'
                    } flex flex-col md:flex-row md:items-center justify-between gap-4`}
                  >
                    {/* Student Info */}
                    <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                      {adm.user.avatar ? (
                        <img
                          src={adm.user.avatar}
                          alt={adm.user.name}
                          className="w-11 h-11 rounded-2xl object-cover shrink-0 ring-2 ring-slate-200 dark:ring-slate-700"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {adm.user.name?.charAt(0) || 'S'}
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                            {adm.user.name || 'Student Candidate'}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                              isPending
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            }`}
                          >
                            {isPending ? 'Pending Review' : 'Access Approved'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {adm.user.email}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {adm.user.whatsapp && (
                            <a
                              href={`https://wa.me/${adm.user.whatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              <FiPhone className="w-3 h-3" />
                              <span>{adm.user.whatsapp}</span>
                              <FiExternalLink className="w-2.5 h-2.5 ml-0.5" />
                            </a>
                          )}

                          {adm.user.address && (
                            <span className="inline-flex items-center space-x-1 text-slate-500">
                              <FiMapPin className="w-3 h-3 text-amber-500" />
                              <span className="truncate max-w-xs">{adm.user.address}</span>
                            </span>
                          )}

                          <span>
                            Applied: {new Date(adm.enrolledAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Course applied for & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                      {/* Course badge */}
                      <div className="text-left md:text-right max-w-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Curriculum
                        </span>
                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {adm.course.title}
                        </p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                          {adm.course.category}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-2 shrink-0">
                        {isPending ? (
                          <button
                            type="button"
                            disabled={isActionBusy}
                            onClick={() => handleGrantAccess(adm.id)}
                            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs hover:shadow disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
                          >
                            <FiCheckCircle className="w-3.5 h-3.5" />
                            <span>{isActionBusy ? 'Granting...' : 'Grant Course Access'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isActionBusy}
                            onClick={() => handleRevokeAccess(adm.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center space-x-1"
                          >
                            <FiUserX className="w-3.5 h-3.5" />
                            <span>{isActionBusy ? 'Revoking...' : 'Revoke Access'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Course Authoring & Publishing Form */}
      {activeTab === 'authoring' && (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Section 0: Course Target Selector */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Course Authoring Target
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Select a course to fill in curriculum, or create a brand new course:
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can select an existing course to populate its syllabus, video URLs, and descriptions.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <select
                value={selectedCourseId}
                onChange={(e) => handleSelectCourseToEdit(e.target.value)}
                disabled={isLoadingCourseDetails}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="new">+ Create New Course</option>
                {coursesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    Fill in: {c.title} ({c.category})
                  </option>
                ))}
              </select>
              {isLoadingCourseDetails && (
                <div className="w-4 h-4 border-2 border-[#004bbb] border-t-transparent rounded-full animate-spin shrink-0" />
              )}
            </div>
          </div>

          {/* Section: Basic Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              1. Course Overview & Metadata
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Next-Generation Cloud Systems & Microservices"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Frontend Development">Frontend Development</option>
                  <option value="Backend Development">Backend Development</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="AI Automation">AI Automation</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Experience Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Master enterprise cloud patterns with hands-on labs and architecture blueprints."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed curriculum breakdown, prerequisites, and learning outcomes..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cover Thumbnail URL
                </label>
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Total Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 5h 45m"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Modules & Lessons */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  2. Modules & Video Lectures
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Include embeddable YouTube links or upload video files directly.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddModule}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <FiPlus className="w-3.5 h-3.5" />
                <span>Add Module</span>
              </button>
            </div>

            {modules.map((mod, mIdx) => (
              <div
                key={mIdx}
                className="bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={mod.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setModules((prev) => {
                        const copy = [...prev];
                        copy[mIdx].title = val;
                        return copy;
                      });
                    }}
                    placeholder={`Module ${mIdx + 1} Title`}
                    className="font-bold text-xs bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white w-2/3"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleAddLesson(mIdx)}
                      className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                    >
                      + Lesson
                    </button>
                    {modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setModules((prev) => prev.filter((_, idx) => idx !== mIdx));
                        }}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded cursor-pointer"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pl-2">
                  {mod.lessons.map((lesson, lIdx) => (
                    <div
                      key={lIdx}
                      className="bg-white dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setModules((prev) => {
                              const copy = [...prev];
                              copy[mIdx].lessons[lIdx].title = val;
                              return copy;
                            });
                          }}
                          placeholder={`Lesson ${lIdx + 1} Title`}
                          className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none w-2/3"
                        />
                        {mod.lessons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLesson(mIdx, lIdx)}
                            className="text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Video Source Picker */}
                      <div className="flex items-center space-x-4 text-xs">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`vtype-${mIdx}-${lIdx}`}
                            checked={lesson.videoType === 'youtube'}
                            onChange={() => {
                              setModules((prev) => {
                                const copy = [...prev];
                                copy[mIdx].lessons[lIdx].videoType = 'youtube';
                                return copy;
                              });
                            }}
                            className="text-blue-600 focus:ring-0"
                          />
                          <span className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                            <FiYoutube className="w-3.5 h-3.5 text-red-500" />
                            <span>YouTube Link</span>
                          </span>
                        </label>

                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`vtype-${mIdx}-${lIdx}`}
                            checked={lesson.videoType === 'upload'}
                            onChange={() => {
                              setModules((prev) => {
                                const copy = [...prev];
                                copy[mIdx].lessons[lIdx].videoType = 'upload';
                                return copy;
                              });
                            }}
                            className="text-blue-600 focus:ring-0"
                          />
                          <span className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                            <FiUploadCloud className="w-3.5 h-3.5 text-blue-500" />
                            <span>Video Upload</span>
                          </span>
                        </label>
                      </div>

                      {/* Input based on type */}
                      {lesson.videoType === 'youtube' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={lesson.videoUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              setModules((prev) => {
                                const copy = [...prev];
                                copy[mIdx].lessons[lIdx].videoUrl = val;
                                return copy;
                              });
                            }}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="flex-1 px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                          />
                          <input
                            type="text"
                            value={lesson.duration}
                            onChange={(e) => {
                              const val = e.target.value;
                              setModules((prev) => {
                                const copy = [...prev];
                                copy[mIdx].lessons[lIdx].duration = val;
                                return copy;
                              });
                            }}
                            placeholder="Duration (e.g. 15m)"
                            className="w-24 px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setModules((prev) => {
                                  const copy = [...prev];
                                  copy[mIdx].lessons[lIdx].file = file;
                                  copy[mIdx].lessons[lIdx].videoUrl = URL.createObjectURL(file);
                                  return copy;
                                });
                              }
                            }}
                            className="flex-1 text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={lesson.duration}
                            onChange={(e) => {
                              const val = e.target.value;
                              setModules((prev) => {
                                const copy = [...prev];
                                copy[mIdx].lessons[lIdx].duration = val;
                                return copy;
                              });
                            }}
                            placeholder="Duration"
                            className="w-24 px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {statusMessage && (
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 animate-pulse">
              {statusMessage}
            </p>
          )}

          {/* Footer Submit */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#004bbb] hover:bg-[#083eb3] rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
            >
              <FiCheck className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Saving Course...'
                  : selectedCourseId !== 'new'
                  ? 'Save & Publish Course Updates'
                  : 'Publish Course to Terraskills'}
              </span>
            </button>
          </div>
        </form>
      )}
    </div>
  );

  if (isPage) {
    return cardContent;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      {cardContent}
    </div>
  );
};
