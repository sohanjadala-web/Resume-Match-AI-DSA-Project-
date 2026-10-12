import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';

// Public pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DSAPlaygroundPage } from './pages/DSAPlaygroundPage';

// Candidate pages
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { CandidateProfilePage } from './pages/candidate/CandidateProfilePage';
import { ResumeUploadPage } from './pages/candidate/ResumeUploadPage';
import { JobRecommendationsPage } from './pages/candidate/JobRecommendationsPage';
import { ApplicationsPage } from './pages/candidate/ApplicationsPage';
import { SavedJobsPage } from './pages/candidate/SavedJobsPage';

// Recruiter pages
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { JobManagementPage } from './pages/recruiter/JobManagementPage';
import { JobApplicantsPage } from './pages/recruiter/JobApplicantsPage';
import { CandidateSearchPage } from './pages/recruiter/CandidateSearchPage';
import { TalentAllocationPage } from './pages/recruiter/TalentAllocationPage';
import { TeamBuilderPage } from './pages/recruiter/TeamBuilderPage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AdminJobsPage } from './pages/admin/AdminJobsPage';
import { DSAInsightsPage } from './pages/admin/DSAInsightsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('CANDIDATE' | 'RECRUITER' | 'ADMIN')[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-slate-400">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'RECRUITER') return <Navigate to="/recruiter/dashboard" replace />;
    return <Navigate to="/candidate/dashboard" replace />;
  }

  return <>{children}</>;
};

// Dashboard Layout with Sidebar
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

// Standard Layout for Public & Non-Dashboard pages
const StandardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
                <Navbar />
                <LandingPage />
                <Footer />
              </div>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/playground"
            element={
              <StandardLayout>
                <DSAPlaygroundPage />
              </StandardLayout>
            }
          />

          {/* Candidate Portal Routes */}
          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <DashboardLayout>
                  <CandidateDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/profile"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <DashboardLayout>
                  <CandidateProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/resume"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <DashboardLayout>
                  <ResumeUploadPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/recommendations"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <DashboardLayout>
                  <JobRecommendationsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/applications"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <DashboardLayout>
                  <ApplicationsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/saved-jobs"
            element={
              <ProtectedRoute allowedRoles={['CANDIDATE']}>
                <DashboardLayout>
                  <SavedJobsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Recruiter Portal Routes */}
          <Route
            path="/recruiter/dashboard"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <DashboardLayout>
                  <RecruiterDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <DashboardLayout>
                  <JobManagementPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs/:jobId/applicants"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <DashboardLayout>
                  <JobApplicantsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/candidates"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <DashboardLayout>
                  <CandidateSearchPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/talent-allocation"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <DashboardLayout>
                  <TalentAllocationPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/team-builder"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <DashboardLayout>
                  <TeamBuilderPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Portal Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout>
                  <UserManagementPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout>
                  <AdminJobsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dsa-insights"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout>
                  <DSAInsightsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout>
                  <AuditLogsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
