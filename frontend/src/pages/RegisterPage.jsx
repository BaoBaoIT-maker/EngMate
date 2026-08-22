import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import useAuthStore from '../store/useAuthStore';
import { register, googleLogin, facebookLogin } from '../services/authService';
import { useGoogleLogin } from '@react-oauth/google';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons';
import { useFacebookSDK } from '../hooks/useFacebookSDK';

const GOLD = '#F0B429';
const GOLD_DARK = '#C9920A';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);
  const [ggLoading, setGgLoading] = useState(false);
  const setAuth = useAuthStore(s => s.setAuth);
  const { loginWithFacebook } = useFacebookSDK();

  const handleFacebookLogin = async () => {
    try {
      setFbLoading(true);
      setError('');
      const accessToken = await loginWithFacebook();
      const res = await facebookLogin({ accessToken });
      setAuth(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Đăng ký Facebook thất bại.');
    } finally {
      setFbLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGgLoading(true);
        setError('');
        const res = await googleLogin({ idToken: tokenResponse.access_token });
        setAuth(res.data);
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi đăng ký Google');
      } finally {
        setGgLoading(false);
      }
    },
    onError: () => setError('Đăng ký Google thất bại'),
    flow: 'implicit',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('Mật khẩu phải có ít nhất 1 chữ cái và 1 chữ số (ví dụ: Abc12345)');
      return;
    }
    setLoading(true);
    try {
      // Backend nhận username (không phải name)
      await register({ email, password, username });
      // Sau khi đăng ký thành công → chuyển sang trang verify OTP
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <button onClick={() => navigate('/')} style={{
        position: 'absolute', top: 16, right: 16,
        width: 32, height: 32, borderRadius: '50%',
        border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', color: '#6B6047',
      }}>✕</button>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #F0B429, #D4960A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✦</div>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Eng<span style={{ color: GOLD }}>Mate</span></span>
      </div>

      <h2 style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', marginBottom: 6, color: '#1C1407' }}>
        Bắt đầu học ngay hôm nay
      </h2>
      <p style={{ color: '#9D8E6F', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
        Tạo tài khoản miễn phí chỉ trong 30 giây.
      </p>

      {/* Social buttons — xếp dọc */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', width: '100%' }}>
        {/* Google custom button */}
        <button
          onClick={() => handleGoogleLogin()}
          disabled={ggLoading || loading || fbLoading}
          style={{
            width: '100%', padding: '0 1rem', borderRadius: 12, minHeight: 44,
            border: '1.5px solid rgba(0,0,0,0.15)', background: '#fff',
            color: '#3c4043', fontWeight: 600, fontSize: '0.875rem',
            cursor: ggLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
            transition: 'background 0.15s, box-shadow 0.15s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            opacity: ggLoading ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (!ggLoading) e.currentTarget.style.background = '#f8f8f8'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
        >
          {ggLoading ? (
            <FontAwesomeIcon icon={faSpinner} spin style={{ color: '#4285F4' }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
          )}
          {ggLoading ? 'Đang kết nối...' : 'Đăng ký với Google'}
        </button>

        <button
          onClick={handleFacebookLogin}
          disabled={fbLoading || loading}
          style={{
            padding: '0 1rem', borderRadius: 12, minHeight: 44,
            border: 'none', background: '#1877F2',
            color: '#fff', fontWeight: 700, fontSize: '0.85rem',
            cursor: fbLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            transition: 'opacity 0.15s',
            opacity: fbLoading ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (!fbLoading) e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={e => { if (!fbLoading) e.currentTarget.style.opacity = '1'; }}>
          {fbLoading
            ? <FontAwesomeIcon icon={faSpinner} spin />
            : <FontAwesomeIcon icon={faFacebookF} />}
          {fbLoading ? 'Đang kết nối...' : 'Facebook'}
        </button>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
        <span style={{ fontSize: '0.75rem', color: '#9D8E6F', fontWeight: 500 }}>hoặc dùng email</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {error && <div style={{ fontSize: '0.8rem', color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '0.6rem', borderRadius: 8 }}>{error}</div>}

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B6047', display: 'block', marginBottom: 6 }}>Tên người dùng</label>
          <input
            className="input-glass"
            value={username} onChange={e => setUsername(e.target.value)}
            placeholder="nguyenvanan" type="text"
            autoComplete="username"
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B6047', display: 'block', marginBottom: 6 }}>Địa chỉ email</label>
          <input
            className="input-glass"
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" type="email"
            autoComplete="email"
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B6047', display: 'block', marginBottom: 6 }}>Mật khẩu</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input-glass"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự, có chữ và số" type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              style={{ paddingRight: '2.75rem' }}
            />
            <button type="button" onClick={() => setShowPassword(v => !v)} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#9D8E6F',
              display: 'flex', alignItems: 'center', padding: 0,
            }}>
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </button>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B6047', display: 'block', marginBottom: 6 }}>Xác nhận mật khẩu</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input-glass"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu" type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              style={{ paddingRight: '2.75rem' }}
            />
            <button type="button" onClick={() => setShowConfirm(v => !v)} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#9D8E6F',
              display: 'flex', alignItems: 'center', padding: 0,
            }}>
              <FontAwesomeIcon icon={showConfirm ? faEye : faEyeSlash} />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gold"
          style={{
            width: '100%', padding: '0.875rem', borderRadius: 12,
            fontSize: '0.95rem', marginTop: '0.25rem', opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
          {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản miễn phí →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: '#9D8E6F' }}>
        Đã có tài khoản?{' '}
        <Link to="/login" style={{ color: GOLD_DARK, fontWeight: 700, textDecoration: 'none' }}>
          Đăng nhập
        </Link>
      </p>

      <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: '#C4B8A0' }}>
        Khi đăng ký, bạn đồng ý với <span style={{ color: GOLD_DARK, cursor: 'pointer' }}>Điều khoản</span> và <span style={{ color: GOLD_DARK, cursor: 'pointer' }}>Chính sách bảo mật</span>.
      </p>
    </AuthLayout>
  );
}
