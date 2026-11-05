import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { InstructorStudioModal } from '../components/InstructorStudioModal';
import { FiArrowLeft } from 'react-icons/fi';

export const InstructorStudioPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300 font-semibold">
          Instructor Studio
        </span>
      </div>

      <InstructorStudioModal
        mode="page"
        isOpen={true}
        onClose={() => navigate('/dashboard')}
        onCourseCreated={(slug) => navigate(`/courses/${slug}`)}
      />
    </div>
  );
};

