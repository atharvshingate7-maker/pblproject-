import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import StoryPage from './pages/StoryPage';
import CaseAnalysisPage from './pages/CaseAnalysisPage';
import CreateCasePage from './pages/CreateCasePage';
import UploadEvidencePage from './pages/UploadEvidencePage';
import { GlassFilter } from './components/common/GlassButton';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <GlassFilter />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<StoryPage />} />
            <Route path="/dashboard" element={<StoryPage />} />
            <Route path="/story" element={<StoryPage />} />
            <Route path="/cases" element={<StoryPage />} />
            <Route path="/cases/:id/analysis" element={<CaseAnalysisPage />} />
            <Route path="/cases/:id" element={<CaseAnalysisPage />} />
            <Route path="/cases/new" element={<CreateCasePage />} />
            <Route path="/cases/:id/upload" element={<UploadEvidencePage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
