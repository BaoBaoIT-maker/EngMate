import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';

// URL của backend — bỏ phần /api vì socket kết nối thẳng vào server
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  : 'http://localhost:8080';

export function useSocket() {
  const { user } = useAuthStore();
  const [socketInstance, setSocketInstance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Chỉ kết nối khi đã đăng nhập
    if (!user) return;

    // Tạo kết nối socket — trình duyệt sẽ tự gửi Cookie kèm theo nhờ withCredentials: true
    const socket = io(SOCKET_URL, {
      withCredentials: true,        // Gửi HttpOnly Cookie (accessToken) lên server
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      // Không spam console — chỉ log 1 lần
      console.warn('[Socket] Connection error:', err.message);
    });

    setSocketInstance(socket);

    return () => {
      socket.disconnect();
      setSocketInstance(null);
      setIsConnected(false);
    };
  }, [user?.id]); // Chỉ re-connect khi user thay đổi (đăng nhập / đăng xuất)

  return { socket: socketInstance, isConnected };
}
