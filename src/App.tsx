import React, { useEffect, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SleekToast from 'sleek-toast';
import { useAppDispatch, useAppSelector } from './store';
import { fetchMe } from './store/slices/authSlice';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { ProtectedRoute } from './components/ProtectedRoute';

// Instant render for landing page
import { HomePage } from './pages/HomePage';

// Route-level code-splitting for on-demand bundle loading
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage').then(m => ({ default: m.CourseDetailPage })));
const CoursePlayerPage = lazy(() => import('./pages/CoursePlayerPage').then(m => ({ default: m.CoursePlayerPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const InstructorStudioPage = lazy(() => import('./pages/InstructorStudioPage').then(m => ({ default: m.InstructorStudioPage })));
const CertificatePage = lazy(() => import('./pages/CertificatePage').then(m => ({ default: m.CertificatePage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const InstructorLoginPage = lazy(() => import('./pages/InstructorLoginPage').then(m => ({ default: m.InstructorLoginPage })));
const InstructorRegisterPage = lazy(() => import('./pages/InstructorRegisterPage').then(m => ({ default: m.InstructorRegisterPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

export function App() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <SleekToast position="top-right" />
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          {/* Catalog / Landing Page */}
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<Navigate to="/" replace />} />

          {/* Authentication Routes (Full Page Experience) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signin" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/signup" element={<Navigate to="/register" replace />} />
          {/* Discrete Faculty / Instructor Portals (Not linked directly on public frontend) */}
          <Route path="/instructor/login" element={<InstructorLoginPage />} />
          <Route path="/instructor/signin" element={<Navigate to="/instructor/login" replace />} />
          <Route path="/instructor/singin" element={<Navigate to="/instructor/login" replace />} />
          <Route path="/instructor/register" element={<InstructorRegisterPage />} />
          <Route path="/instructor/signup" element={<Navigate to="/instructor/register" replace />} />
          <Route path="/instructor/signing" element={<Navigate to="/instructor/register" replace />} />

          {/* Deep-linkable Course Detail Overview */}
          <Route path="/courses/:slug" element={<CourseDetailPage />} />

          {/* Interactive Classroom Video Player */}
          <Route path="/courses/:slug/learn" element={<CoursePlayerPage />} />
          <Route path="/courses/:slug/learn/:lessonId" element={<CoursePlayerPage />} />

          {/* Student Dashboard (Protected) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Instructor Studio (Protected, role="instructor") */}
          <Route
            path="/studio"
            element={
              <ProtectedRoute requiredRole="instructor">
                <InstructorStudioPage />
              </ProtectedRoute>
            }
          />

          {/* Public Credential Verification */}
          <Route path="/certificates/:certificateId" element={<CertificatePage />} />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
