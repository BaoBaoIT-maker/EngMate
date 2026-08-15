import { create } from 'zustand';

/**
 * Global store để điều khiển Splash Screen
 * Có thể gọi useSplashStore.getState().show() ở bất kỳ đâu (kể cả ngoài React component)
 */
const useSplashStore = create((set, get) => ({
  isOpen: false,
  message: '', // Có thể hiển thị text dưới logo (VD: "Đang tải dữ liệu...")
  timer: null, // Lưu reference của setTimeout
  
  // Mở Splash Screen
  show: (message = '') => set({ isOpen: true, message }),
  
  // Đóng Splash Screen
  hide: () => set({ isOpen: false, message: '' }),
  
  // Helper: Mở splash screen một thời gian ngắn rồi tự đóng (ví dụ cho chuyển trang)
  pulse: (duration = 800, message = '') => {
    // Xóa timeout cũ nếu có để tránh lỗi đóng quá sớm khi bấm nhanh 2 tab
    const currentTimer = get().timer;
    if (currentTimer) clearTimeout(currentTimer);

    set({ isOpen: true, message });
    const newTimer = setTimeout(() => {
      set({ isOpen: false, message: '', timer: null });
    }, duration);
    
    set({ timer: newTimer });
  }
}));

export default useSplashStore;
