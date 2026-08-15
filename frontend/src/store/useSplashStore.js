import { create } from 'zustand';

/**
 * Global store để điều khiển Splash Screen
 * Có thể gọi useSplashStore.getState().show() ở bất kỳ đâu (kể cả ngoài React component)
 */
const useSplashStore = create((set) => ({
  isOpen: false,
  message: '', // Có thể hiển thị text dưới logo (VD: "Đang tải dữ liệu...")
  
  // Mở Splash Screen
  show: (message = '') => set({ isOpen: true, message }),
  
  // Đóng Splash Screen
  hide: () => set({ isOpen: false, message: '' }),
  
  // Helper: Mở splash screen một thời gian ngắn rồi tự đóng (ví dụ cho chuyển trang)
  pulse: (duration = 800, message = '') => {
    set({ isOpen: true, message });
    setTimeout(() => {
      set({ isOpen: false, message: '' });
    }, duration);
  }
}));

export default useSplashStore;
