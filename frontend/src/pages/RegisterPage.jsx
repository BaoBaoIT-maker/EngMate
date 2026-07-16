import React from 'react';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Đăng Ký</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Tên hiển thị</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500" placeholder="Nhập tên của bạn" />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input type="email" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500" placeholder="Nhập email của bạn" />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Mật khẩu</label>
            <input type="password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500" placeholder="Nhập mật khẩu" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-semibold">
            Đăng ký
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Đã có tài khoản? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Đăng nhập</Link>
        </p>
        <p className="mt-2 text-center">
          <Link to="/" className="text-gray-500 hover:underline text-sm">Về trang chủ</Link>
        </p>
      </div>
    </div>
  );
}
