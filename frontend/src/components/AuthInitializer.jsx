import { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import useSplashStore from '../store/useSplashStore';

/**
 * AuthInitializer: Gọi /users/me khi app khởi động để đồng bộ
 * user state từ server (dựa vào HttpOnly Cookie).
 * Nếu cookie hết hạn → logout. Nếu còn hợp lệ → cập nhật user mới nhất.
 */
export default function AuthInitializer({ children }) {
  const { setAuth, logout } = useAuthStore();
  const { show, hide } = useSplashStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      show('Đang tải dữ liệu...'); // Bật Splash Screen ngay lập tức
      try {
        const [res] = await Promise.all([
          api.get('/users/me'),
          new Promise(resolve => setTimeout(resolve, 1500)) // Hiển thị ít nhất 1.5s
        ]);
        const user = res.data?.data;
        if (user) {
          setAuth({ user });
        }
      } catch {
        logout();
      } finally {
        hide(); // Tắt Splash Screen
        setReady(true);
      }
    };

    init();
  }, []);

  if (!ready) return null;

  return children;
}
