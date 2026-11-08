import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import FeaturePage from './pages/FeaturePage';
import Pricing from './pages/Pricing';
import WhiteLabel from './pages/WhiteLabel';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import MfaSecurity from './pages/MfaSecurity';
import LogoutPage from './pages/LogoutPage';
import SessionsPage from './pages/SessionsPage';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import Forbidden from './pages/Forbidden';
import ServerError from './pages/ServerError';
import CrashTest from './pages/CrashTest';
import HealthStatus from './pages/HealthStatus';
import Assets from './pages/Assets';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import SecurityCenter from './pages/SecurityCenter';
import PrivacyCenter from './pages/PrivacyCenter';
import ComplianceCenter from './pages/ComplianceCenter';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Integrations from './pages/Integrations';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './features/auth/AuthContext';
import { WorkspaceProvider } from './features/workspaces/WorkspaceContext';
import LiveRadarSimulator from './components/LiveRadarSimulator';
import Workspaces from './pages/Workspaces';
import IdentityCenter from './pages/IdentityCenter';
import AutomationCenter from './pages/AutomationCenter';
import PlatformCenter from './pages/PlatformCenter';
import OperationsConsole from './pages/OperationsConsole';

function PublicLayout({ onOpenRadar }: { onOpenRadar: () => void }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white font-sans">
      <Navbar onOpenRadar={onOpenRadar} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing onOpenRadar={onOpenRadar} />} />
          <Route path="/features/:page" element={<FeaturePage />} />
          <Route path="/features" element={<Navigate to="/features/1" replace />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/white-label" element={<WhiteLabel />} />
          <Route path="/workspaces" element={<Navigate to="/app/workspaces" replace />} />
          
          {/* Authentication Suite */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/mfa" element={<MfaSecurity />} />

          {/* HTTP Error Pages & Diagnostics */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="/not-found" element={<NotFound />} />
          <Route path="/error" element={<ServerError />} />
          <Route path="/health" element={<HealthStatus />} />
          <Route path="/api/health" element={<HealthStatus />} />
          <Route path="/crash-test" element={<CrashTest />} />
          <Route path="/test-crash" element={<CrashTest />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [isRadarOpen, setIsRadarOpen] = useState(false);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <WorkspaceProvider>
          <BrowserRouter>
            <Routes>
              {/* Protected SkyGuard Application Console Routes */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="workspaces" element={<Workspaces />} />
                <Route path="assets" element={<Assets />} />
                
                {/* 1. Security Center - Admin / Owner / Analyst / Viewer */}
                <Route path="security" element={<SecurityCenter />} />
                
                {/* 2. Privacy Center - Privacy Officer / Admin / Owner / Viewer */}
                <Route path="privacy" element={<PrivacyCenter />} />
                
                {/* 3. Compliance Center */}
                <Route path="compliance" element={<ComplianceCenter />} />
                
                {/* 4. Identity Center */}
                <Route path="identity" element={<IdentityCenter />} />

                {/* 5. Automation Center */}
                <Route path="automation" element={<AutomationCenter />} />

                {/* 6. Platform Center */}
                <Route path="platform" element={<PlatformCenter />} />

                {/* Operations & Labs: E2E Testing, Load Benchmark, Security Hardening, Runbooks, Monitoring */}
                <Route path="operations" element={<OperationsConsole />} />

                {/* Alerts & Incidents - Security Analyst / Admin / Owner / Viewer */}
                <Route path="alerts" element={<Alerts />} />
                
                {/* Reports - Security Analyst / Admin / Owner / Viewer */}
                <Route path="reports" element={<Reports />} />
                
                {/* Active Sessions - Zero-Trust Device Management */}
                <Route path="sessions" element={<SessionsPage />} />
                
                {/* MFA Settings */}
                <Route path="mfa" element={<MfaSecurity />} />
                
                {/* Integrations */}
                <Route path="integrations" element={<Integrations />} />
              </Route>

              {/* Dashboard URL Aliases & Deep Links */}
              <Route path="/dashboard/workspaces" element={<Navigate to="/app/workspaces" replace />} />
              <Route path="/dashboard/assets" element={<Navigate to="/app/assets" replace />} />
              <Route path="/dashboard/privacy/consent" element={<Navigate to="/app/privacy?tab=consent" replace />} />
              <Route path="/dashboard/privacy" element={<Navigate to="/app/privacy" replace />} />
              <Route path="/dashboard/security" element={<Navigate to="/app/security" replace />} />
              <Route path="/dashboard/identity" element={<Navigate to="/app/identity" replace />} />
              <Route path="/dashboard/automation" element={<Navigate to="/app/automation" replace />} />
              <Route path="/dashboard/platform" element={<Navigate to="/app/platform" replace />} />
              <Route path="/dashboard/operations" element={<Navigate to="/app/operations" replace />} />
              <Route path="/operations" element={<Navigate to="/app/operations" replace />} />
              <Route path="/dashboard/alerts" element={<Navigate to="/app/alerts" replace />} />
              <Route path="/dashboard/compliance" element={<Navigate to="/app/compliance" replace />} />
              <Route path="/dashboard/sessions" element={<Navigate to="/app/sessions" replace />} />
              <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />

              {/* Public Website & Authentication Routes */}
              <Route path="/*" element={<PublicLayout onOpenRadar={() => setIsRadarOpen(true)} />} />
            </Routes>

            {/* Global Radar Simulator */}
            <LiveRadarSimulator
              isOpen={isRadarOpen}
              onClose={() => setIsRadarOpen(false)}
            />
          </BrowserRouter>
        </WorkspaceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
