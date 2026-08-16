import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import FlashcardsPage from './pages/dashboard/FlashcardsPage';
import FlashcardsSessionPage from './pages/dashboard/FlashcardsSessionPage';
import GamesPage from './pages/dashboard/GamesPage';
import MatchingGame from './pages/dashboard/MatchingGame';
import FillBlankGame from './pages/dashboard/FillBlankGame';
import SpeakingCoachPage from './pages/dashboard/SpeakingCoachPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingPage from './pages/OnboardingPage';
import PremiumPaywall from './pages/dashboard/PremiumPaywall';

import AdminRoute from './components/AdminRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminUserManagementPage from './pages/admin/UserManagementPage';
import AdminVocabularyPage from './pages/admin/VocabularyPage';
import AdminPlansPage from './pages/admin/PlansPage';
import AdminGamesPage from './pages/admin/GamesPage';
import AdminTransactionsPage from './pages/admin/TransactionsPage';
import AdminSupportChatPage from './pages/admin/SupportChatPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/verify-otp',
    element: <VerifyOtpPage />,
  },
  {
    path: '/onboarding',
    element: (
      // requireOnboarding=false để tránh vòng lặp redirect
      <ProtectedRoute requireOnboarding={false}>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardOverview />,
      },
      {
        path: 'flashcards',
        element: <FlashcardsPage />,
      },
      {
        path: 'flashcards/session',
        element: <FlashcardsSessionPage />,
      },
      {
        path: 'games',
        element: <GamesPage />,
      },
      {
        path: 'games/matching',
        element: <MatchingGame />,
      },
      {
        path: 'games/fill-blank',
        element: <FillBlankGame />,
      },
      {
        path: 'speaking',
        element: <SpeakingCoachPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'premium',
        element: <PremiumPaywall />,
      },
    ]
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUserManagementPage /> },
      { path: 'vocabulary', element: <AdminVocabularyPage /> },
      { path: 'plans', element: <AdminPlansPage /> },
      { path: 'games', element: <AdminGamesPage /> },
      { path: 'transactions', element: <AdminTransactionsPage /> },
      { path: 'support', element: <AdminSupportChatPage /> },
    ]
  }
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
