import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';

// URL của backend (thường là http://localhost:8080 trong dev)
const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8080';

export function useSocket() {
  const { user } = useAuthStore();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Chỉ kết nối khi đã có user đăng nhập
    if (!user) return;

    // Thay vì đọc JWT (chúng ta dùng HttpOnly Cookie nên không đọc được bằng JS),
    // ta cứ set withCredentials = true để trình duyệt tự gửi Cookie lên.
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Ưu tiên websocket
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  return { socket: socketRef.current, isConnected };
}
