import { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

/**
 * Ẩn splash screen HTML gốc (trong index.html) với hiệu ứng fade
 */
const hideNativeSplash = () => {
  const splash = document.getElementById('app-splash');
  if (!splash) return;
  splash.classList.add('hide');
  setTimeout(() => splash.remove(), 450);
};

/**
 * AuthInitializer:
 * - Splash screen hiển thị đúng 1.5s rồi ẩn (không đợi backend)
 * - Backend check chạy song song, cập nhật user state khi xong
 */
export default function AuthInitializer({ children }) {
  const { setAuth, logout } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Timer 1: Ẩn splash sau đúng 1.5s — không phụ thuộc backend
    const splashTimer = setTimeout(() => {
      hideNativeSplash();
      setReady(true);
    }, 1500);

    // Timer 2: Gọi backend check session song song (không block splash)
    const checkSession = async () => {
      try {
        const res = await api.get('/users/me');
        const user = res.data?.data;
        if (user) setAuth({ user });
      } catch {
        // Cookie hết hạn hoặc chưa đăng nhập → clear store, không cần làm gì thêm
        logout();
      }
    };
    checkSession();

    return () => clearTimeout(splashTimer);
  }, []);

  if (!ready) return null;

  return children;
}


