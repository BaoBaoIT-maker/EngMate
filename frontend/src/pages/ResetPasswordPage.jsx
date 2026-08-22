import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { resetPassword } from '../services/authService';

const GOLD = '#F0B429';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (!email || !otp || !newPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword });
      setMsg('Đặt lại mật khẩu thành công!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng kiểm tra lại OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <button onClick={() => navigate('/login')} style={{
        position: 'absolute', top: 16, right: 16,
        width: 32, height: 32, borderRadius: '50%',
        border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', color: '#6B6047',
      }}>✕</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #F0B429, #D4960A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✦</div>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Eng<span style={{ color: GOLD }}>Mate</span></span>
      </div>

      <h2 style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', marginBottom: 6, color: '#1C1407' }}>
        Đặt lại mật khẩu
      </h2>
      <p style={{ color: '#9D8E6F', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
        Nhập OTP bạn nhận được qua email và mật khẩu mới.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {error && <div style={{ fontSize: '0.8rem', color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: 8 }}>{error}</div>}
        {msg && <div style={{ fontSize: '0.8rem', color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '0.5rem', borderRadius: 8 }}>{msg}</div>}
        
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B6047', display: 'block', marginBottom: 6 }}>Email</label>
          <input 
            className="input-glass" 
            value={email} onChange={e => setEmail(e.target.value)} 
            placeholder="you@example.com" type="email" 
          />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B6047', display: 'block', marginBottom: 6 }}>Mã OTP</label>
          <input 
            className="input-glass" 
            value={otp} onChange={e => setOtp(e.target.value)} 
            placeholder="123456" type="text" maxLength={6}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B6047', display: 'block', marginBottom: 6 }}>Mật khẩu mới</label>
          <input 
            className="input-glass" 
            value={newPassword} onChange={e => setNewPassword(e.target.value)} 
            placeholder="••••••••" type="password" 
          />
        </div>
        
        <button type="submit" disabled={loading} className="btn-gold" style={{
          width: '100%', padding: '0.875rem', borderRadius: 12,
          fontSize: '0.95rem', marginTop: '0.5rem',
          opacity: loading ? 0.7 : 1
        }}>
          {loading ? 'Đang xử lý...' : 'Xác nhận →'}
        </button>
      </form>
    </AuthLayout>
  );
}
