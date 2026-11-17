import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';

// Public Pages
import HomePage from './pages/public/LandingPage.js';
import InternshipsDiscoveryPage from './pages/public/InternshipsPage.js';
import InternshipDetailPage from './pages/public/InternshipDetailPage.js';
import FeaturesPage from './pages/public/FeaturesPage.js';
import HowItWorksPage from './pages/public/HowItWorksPage.js';
import LoginPage from './pages/public/LoginPage.js';
import StudentRegisterPage from './pages/public/StudentRegisterPage.js';
import RecruiterRegisterPage from './pages/public/RecruiterRegisterPage.js';
import PrivacyPage from './pages/public/PrivacyPage.js';
import TermsPage from './pages/public/TermsPage.js';

// Student Pages
import StudentDashboardPage from './pages/student/StudentDashboardPage.js';
import StudentApplicationsPage from './pages/student/StudentApplicationsPage.js';
import StudentApplicationDetailPage from './pages/student/StudentApplicationDetailPage.js';
import StudentAgentsPage from './pages/student/StudentAgentsPage.js';
import StudentInterviewsPage from './pages/student/StudentInterviewsPage.js';
import StudentInterviewPrepPage from './pages/student/StudentInterviewPrepPage.js';
import StudentProfilePage from './pages/student/StudentProfilePage.js';
import StudentPortfolioPage from './pages/student/StudentPortfolioPage.js';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage.js';
import StudentSettingsPage from './pages/student/StudentSettingsPage.js';

// Recruiter Pages
import RecruiterDashboardPage from './pages/recruiter/RecruiterDashboardPage.js';
import RecruiterInternshipsPage from './pages/recruiter/RecruiterInternshipsPage.js';
import RecruiterNewInternshipPage from './pages/recruiter/RecruiterNewInternshipPage.js';
import RecruiterEditInternshipPage from './pages/recruiter/RecruiterEditInternshipPage.js';
import RecruiterApplicantsPage from './pages/recruiter/RecruiterApplicantsPage.js';
import RecruiterApplicantDetailPage from './pages/recruiter/RecruiterApplicantDetailPage.js';
import RecruiterEvaluateApplicantPage from './pages/recruiter/RecruiterEvaluateApplicantPage.js';
import RecruiterPipelinePage from './pages/recruiter/RecruiterPipelinePage.js';
import RecruiterInterviewsPage from './pages/recruiter/RecruiterInterviewsPage.js';
import RecruiterAnalyticsPage from './pages/recruiter/RecruiterAnalyticsPage.js';
import RecruiterCompanyPage from './pages/recruiter/RecruiterCompanyPage.js';
import RecruiterNotificationsPage from './pages/recruiter/RecruiterNotificationsPage.js';
import RecruiterSettingsPage from './pages/recruiter/RecruiterSettingsPage.js';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#080808]">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/internships" element={<InternshipsDiscoveryPage />} />
          <Route path="/internships/:id" element={<InternshipDetailPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/student" element={<StudentRegisterPage />} />
          <Route path="/register/recruiter" element={<RecruiterRegisterPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboardPage />} />
          <Route path="/student/applications" element={<StudentApplicationsPage />} />
          <Route path="/student/applications/:id" element={<StudentApplicationDetailPage />} />
          <Route path="/student/agents" element={<StudentAgentsPage />} />
          <Route path="/student/interviews" element={<StudentInterviewsPage />} />
          <Route path="/student/interviews/:id/prep" element={<StudentInterviewPrepPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/portfolio" element={<StudentPortfolioPage />} />
          <Route path="/student/notifications" element={<StudentNotificationsPage />} />
          <Route path="/student/settings" element={<StudentSettingsPage />} />

          {/* Recruiter Routes */}
          <Route path="/recruiter/dashboard" element={<RecruiterDashboardPage />} />
          <Route path="/recruiter/internships" element={<RecruiterInternshipsPage />} />
          <Route path="/recruiter/internships/new" element={<RecruiterNewInternshipPage />} />
          <Route path="/recruiter/internships/:id/edit" element={<RecruiterEditInternshipPage />} />
          <Route path="/recruiter/applicants" element={<RecruiterApplicantsPage />} />
          <Route path="/recruiter/applicants/:id" element={<RecruiterApplicantDetailPage />} />
          <Route path="/recruiter/applicants/:id/evaluate" element={<RecruiterEvaluateApplicantPage />} />
          <Route path="/recruiter/pipeline" element={<RecruiterPipelinePage />} />
          <Route path="/recruiter/interviews" element={<RecruiterInterviewsPage />} />
          <Route path="/recruiter/analytics" element={<RecruiterAnalyticsPage />} />
          <Route path="/recruiter/company" element={<RecruiterCompanyPage />} />
          <Route path="/recruiter/notifications" element={<RecruiterNotificationsPage />} />
          <Route path="/recruiter/settings" element={<RecruiterSettingsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
