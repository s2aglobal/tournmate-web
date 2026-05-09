import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { needsEmailVerification } from "./services/auth";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import LandingPage from "./pages/LandingPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import type { ReactNode } from "react";

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  );
}

/** Requires signed-in user. Redirects unverified email users to verification page (prod only). */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (needsEmailVerification(user)) return <Navigate to="/verify-email" replace />;
  return <>{children}</>;
}

/** Requires signed-in user + player profile. */
function ProfileGate({ children }: { children: ReactNode }) {
  const { user, player, loading, playerLoading } = useAuth();
  if (loading || playerLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (needsEmailVerification(user)) return <Navigate to="/verify-email" replace />;
  if (!player) return <Navigate to="/profile-setup" replace />;
  return <>{children}</>;
}

/** Redirect already-authenticated users away from login. */
function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { user, player, loading, playerLoading } = useAuth();
  if (loading || playerLoading) return <LoadingScreen />;
  if (user && needsEmailVerification(user)) return <Navigate to="/verify-email" replace />;
  if (user && player) return <Navigate to="/dashboard" replace />;
  if (user && !player) return <Navigate to="/profile-setup" replace />;
  return <>{children}</>;
}

/** Verification page: requires signed-in but unverified user. */
function VerificationRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!needsEmailVerification(user)) return <Navigate to="/profile-setup" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/verify-email"
          element={
            <VerificationRoute>
              <EmailVerificationPage />
            </VerificationRoute>
          }
        />
        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute>
              <ProfileSetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProfileGate>
              <DashboardPage />
            </ProfileGate>
          }
        />
        <Route
          path="/profile"
          element={
            <ProfileGate>
              <ProfilePage />
            </ProfileGate>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
