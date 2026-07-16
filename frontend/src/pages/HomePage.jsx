import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
      <h1 className="text-5xl font-bold mb-6">Chào mừng đến với EngMate</h1>
      <p className="text-xl mb-8">Nền tảng học tiếng Anh thích ứng thông minh</p>
      <div className="space-x-4">
        <Link to="/login" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg">
          Đăng nhập
        </Link>
        <Link to="/register" className="bg-transparent border-2 border-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition shadow-lg">
          Đăng ký
        </Link>
      </div>
    </div>
  );
}
