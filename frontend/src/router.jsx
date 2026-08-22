import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SplashScreen from './components/common/SplashScreen';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// --- Lazy Load Public Pages ---
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const VerifyOtpPage = React.lazy(() => import('./pages/VerifyOtpPage'));

// --- Lazy Load Dashboard Pages ---
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage'));
const DashboardLayout = React.lazy(() => import('./layouts/DashboardLayout'));
const DashboardOverview = React.lazy(() => import('./pages/dashboard/DashboardOverview'));
const FlashcardsPage = React.lazy(() => import('./pages/dashboard/FlashcardsPage'));
const FlashcardsSessionPage = React.lazy(() => import('./pages/dashboard/FlashcardsSessionPage'));
const GamesPage = React.lazy(() => import('./pages/dashboard/GamesPage'));
const MatchingGame = React.lazy(() => import('./pages/dashboard/MatchingGame'));
const FillBlankGame = React.lazy(() => import('./pages/dashboard/FillBlankGame'));
const SpeakingCoachPage = React.lazy(() => import('./pages/dashboard/SpeakingCoachPage'));
const SettingsPage = React.lazy(() => import('./pages/dashboard/SettingsPage'));
const PremiumPaywall = React.lazy(() => import('./pages/dashboard/PremiumPaywall'));

// --- Lazy Load Admin Pages ---
const AdminLayout = React.lazy(() => import('./layouts/AdminLayout'));
const AdminDashboardPage = React.lazy(() => import('./pages/admin/DashboardPage'));
const AdminUserManagementPage = React.lazy(() => import('./pages/admin/UserManagementPage'));
const AdminVocabularyPage = React.lazy(() => import('./pages/admin/VocabularyPage'));
const AdminPlansPage = React.lazy(() => import('./pages/admin/PlansPage'));
const AdminGamesPage = React.lazy(() => import('./pages/admin/GamesPage'));
const AdminTransactionsPage = React.lazy(() => import('./pages/admin/TransactionsPage'));
const AdminSupportChatPage = React.lazy(() => import('./pages/admin/SupportChatPage'));

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<SplashScreen />}>
    {children}
  </Suspense>
);

const router = createBrowserRouter([
  { path: '/', element: <SuspenseWrapper><LandingPage /></SuspenseWrapper> },
  { path: '/about', element: <SuspenseWrapper><AboutPage /></SuspenseWrapper> },
  { path: '/login', element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
  { path: '/register', element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper> },
  { path: '/forgot-password', element: <SuspenseWrapper><ForgotPasswordPage /></SuspenseWrapper> },
  { path: '/reset-password', element: <SuspenseWrapper><ResetPasswordPage /></SuspenseWrapper> },
  { path: '/verify-otp', element: <SuspenseWrapper><VerifyOtpPage /></SuspenseWrapper> },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute requireOnboarding={false}>
        <SuspenseWrapper><OnboardingPage /></SuspenseWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <SuspenseWrapper><DashboardLayout /></SuspenseWrapper>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <SuspenseWrapper><DashboardOverview /></SuspenseWrapper> },
      { path: 'flashcards', element: <SuspenseWrapper><FlashcardsPage /></SuspenseWrapper> },
      { path: 'flashcards/session', element: <SuspenseWrapper><FlashcardsSessionPage /></SuspenseWrapper> },
      { path: 'games', element: <SuspenseWrapper><GamesPage /></SuspenseWrapper> },
      { path: 'games/matching', element: <SuspenseWrapper><MatchingGame /></SuspenseWrapper> },
      { path: 'games/fill-blank', element: <SuspenseWrapper><FillBlankGame /></SuspenseWrapper> },
      { path: 'speaking', element: <SuspenseWrapper><SpeakingCoachPage /></SuspenseWrapper> },
      { path: 'settings', element: <SuspenseWrapper><SettingsPage /></SuspenseWrapper> },
      { path: 'premium', element: <SuspenseWrapper><PremiumPaywall /></SuspenseWrapper> },
    ]
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <SuspenseWrapper><AdminLayout /></SuspenseWrapper>
      </AdminRoute>
    ),
    children: [
      { index: true, element: <SuspenseWrapper><AdminDashboardPage /></SuspenseWrapper> },
      { path: 'dashboard', element: <SuspenseWrapper><AdminDashboardPage /></SuspenseWrapper> },
      { path: 'users', element: <SuspenseWrapper><AdminUserManagementPage /></SuspenseWrapper> },
      { path: 'vocabulary', element: <SuspenseWrapper><AdminVocabularyPage /></SuspenseWrapper> },
      { path: 'plans', element: <SuspenseWrapper><AdminPlansPage /></SuspenseWrapper> },
      { path: 'games', element: <SuspenseWrapper><AdminGamesPage /></SuspenseWrapper> },
      { path: 'transactions', element: <SuspenseWrapper><AdminTransactionsPage /></SuspenseWrapper> },
      { path: 'support', element: <SuspenseWrapper><AdminSupportChatPage /></SuspenseWrapper> },
    ]
  }
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}