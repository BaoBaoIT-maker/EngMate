import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore.js';

/**
 * ProtectedRoute: chặn route nếu chưa đăng nhập.
 * Nếu đã đăng nhập nhưng chưa hoàn thành Onboarding và đang truy cập /dashboard,
 * tự động redirect sang /onboarding.
 */
export default function ProtectedRoute({ children, requireOnboarding = true }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu cần onboarding và user chưa làm → redirect tới /onboarding
  // Trừ khi đang ở chính trang /onboarding (tránh vòng lặp)
  if (
    requireOnboarding &&
    user?.setting?.onboardingDone === false &&
    location.pathname !== '/onboarding'
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
