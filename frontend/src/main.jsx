import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.warn('⚠️ THIẾU VITE_GOOGLE_CLIENT_ID TRONG FILE .ENV!');
}

// Tự động tải lại trang khi Vercel deploy bản mới khiến chunk cũ bị 404
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Phát hiện bản cập nhật mới, đang tải lại ứng dụng...', event);
  window.location.reload();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
