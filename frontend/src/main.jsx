import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || '287455141948-5gvapclpnc01f7n4ec7tamd1v6bkoppv.apps.googleusercontent.com'}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
