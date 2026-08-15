import { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

/**
 * Hàm ẩn splash screen HTML gốc (trong index.html) với hiệu ứng fade
 */
const hideNativeSplash = () => {
  const splash = document.getElementById('app-splash');
  if (!splash) return;
  splash.classList.add('hide');
  // Xoá khỏi DOM sau khi animation kết thúc để không chiếm z-index
  setTimeout(() => splash.remove(), 450);
};

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
          new Promise(resolve => setTimeout(resolve, 1500)) // Hiển thị splash ít nhất 1.5s
        ]);
        const user = res.data?.data;
        if (user) {
          setAuth({ user });
        }
      } catch {
        // Cookie hết hạn hoặc không hợp lệ → clear store
        logout();
      } finally {
        hideNativeSplash(); // Ẩn splash HTML
        setReady(true);
      }
    };

    init();
  }, []);

  if (!ready) return null;

  return children;
}

