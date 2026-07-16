import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Nơi lý tưởng để tự động đính kèm Access Token vào mọi request
api.interceptors.request.use(
  (config) => {
    // TODO: Lấy token từ Zustand hoặc LocalStorage và gắn vào header
    // const token = localStorage.getItem('accessToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Nơi lý tưởng để xử lý tự động refresh token khi nhận lỗi 401
api.interceptors.response.use(
  (response) => response.data, // Tự động trích xuất data từ response của Axios
  (error) => {
    // TODO: Xử lý logic tự động gọi API refresh token nếu mã lỗi là 401 (Unauthorized)
    
    return Promise.reject(error);
  }
);

export default api;
