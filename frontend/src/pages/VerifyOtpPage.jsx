import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import useAuthStore from '../store/useAuthStore';
import { verifyOtp, resendOtp } from '../services/authService';

const GOLD = '#F0B429';
const GOLD_DARK = '#C9920A';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const setAuth = useAuthStore(s => s.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 chữ số');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp });
      setAuth(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMsg('');
    setResendLoading(true);
    try {
      await resendOtp({ email });
      setMsg('Đã gửi lại OTP! Vui lòng kiểm tra email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi lại OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #F0B429, #D4960A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✦</div>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Eng<span style={{ color: GOLD }}>Mate</span></span>
      </div>

      {/* Icon */}
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(240,180,41,0.15), rgba(240,180,41,0.05))',
          border: '2px solid rgba(240,180,41,0.3)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.75rem', marginBottom: '0.75rem'
        }}>📧</div>
        <h2 style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', marginBottom: 6, color: '#1C1407' }}>
          Xác thực email
        </h2>
        <p style={{ color: '#9D8E6F', fontSize: '0.875rem' }}>
          Chúng tôi đã gửi mã OTP 6 chữ số đến
        </p>
        <p style={{ color: GOLD_DARK, fontWeight: 700, fontSize: '0.9rem', marginTop: 4 }}>
          {email || 'email của bạn'}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {error && <div style={{ fontSize: '0.8rem', color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '0.6rem', borderRadius: 8 }}>{error}</div>}
        {msg && <div style={{ fontSize: '0.8rem', color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '0.6rem', borderRadius: 8 }}>{msg}</div>}

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B6047', display: 'block', marginBottom: 6 }}>Mã OTP</label>
          <input
            className="input-glass"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            type="text"
            maxLength={6}
            autoComplete="one-time-code"
            style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: 700 }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gold"
          style={{
            width: '100%', padding: '0.875rem', borderRadius: 12,
            fontSize: '0.95rem', opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Đang xác thực...' : 'Xác nhận →'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
        <p style={{ fontSize: '0.82rem', color: '#9D8E6F', marginBottom: 8 }}>Không nhận được email?</p>
        <button
          onClick={handleResend}
          disabled={resendLoading}
          style={{
            background: 'none', border: 'none', cursor: resendLoading ? 'not-allowed' : 'pointer',
            color: GOLD_DARK, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'underline',
            opacity: resendLoading ? 0.6 : 1, }}
        >
          {resendLoading ? 'Đang gửi...' : 'Gửi lại OTP'}
        </button>
      </div>

      <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.82rem', color: '#9D8E6F' }}>
        <Link to="/register" style={{ color: GOLD_DARK, fontWeight: 600, textDecoration: 'none' }}>
          ← Quay lại đăng ký
        </Link>
      </p>
    </AuthLayout>
  );
}
