import { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

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
        const res = await api.get('/users/me');
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
    // Hiển thị màn hình trắng ngắn trong khi check session
    return null;
  }

  return children;
}
