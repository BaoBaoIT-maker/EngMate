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
      const startTime = Date.now();
      const MIN_SPLASH_MS = 1500; // Hiển thị splash ít nhất 1.5s

      try {
        // Giới hạn tối đa 4s cho API call (tránh Render đang ngủ → splash bị treo)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 4000)
        );
        const res = await Promise.race([api.get('/users/me'), timeoutPromise]);
        const user = res.data?.data;
        if (user) setAuth({ user });
      } catch {
        // Cookie hết hạn, không hợp lệ, hoặc backend timeout → clear store
        logout();
      } finally {
        // Đảm bảo splash hiển tối thiểu 1.5s dù API nhanh hay chậm
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
        await new Promise(resolve => setTimeout(resolve, remaining));
        hideNativeSplash();
        setReady(true);
      }
    };

    init();
  }, []);

  if (!ready) return null;

  return children;
}

