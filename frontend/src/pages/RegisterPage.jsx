import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import useAuthStore from '../store/useAuthStore';
import { register, googleLogin, facebookLogin } from '../services/authService';
import { GoogleLogin } from '@react-oauth/google';
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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      const res = await googleLogin({ idToken: credentialResponse.credential });
      setAuth(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi đăng ký Google');
    } finally {
      setLoading(false);
    }
  };

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
        <div style={{ width: '100%', overflow: 'hidden', borderRadius: 20 }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Đăng ký Google thất bại')}
            width="100%"
            size="large"
            shape="rectangular"
            theme="outline"
            text="signup_with"
            locale="vi"
            auto_select={false}
            use_fedcm_for_prompt={false}
          />
        </div>

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
            fontSize: '0.95rem', marginTop: '0.25rem', fontFamily: 'inherit',
            opacity: loading ? 0.7 : 1,
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
