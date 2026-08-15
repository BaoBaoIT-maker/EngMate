import { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import SplashScreen from './common/SplashScreen';

/**
 * AuthInitializer: Gọi /users/me khi app khởi động để đồng bộ
 * user state từ server (dựa vào HttpOnly Cookie).
 * Nếu cookie hết hạn → logout. Nếu còn hợp lệ → cập nhật user mới nhất.
 */
export default function AuthInitializer({ children }) {
  const { setAuth, logout } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [res] = await Promise.all([
          api.get('/users/me'),
          new Promise(resolve => setTimeout(resolve, 1500)) // Đảm bảo Splash Screen hiện ít nhất 1.5s
        ]);
        const user = res.data?.data;
        if (user) {
          setAuth({ user });
        }
      } catch {
        // Cookie hết hạn hoặc không hợp lệ → clear store
        logout();
      } finally {
        setReady(true);
      }
    };

    init();
  }, []);

  if (!ready) {
    // Hiển thị Splash Screen trong khi check session
    return <SplashScreen forceOpen={true} forceMessage="Đang tải dữ liệu..." />;
  }

  return children;
}
