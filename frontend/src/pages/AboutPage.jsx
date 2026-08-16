import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GOLD = '#F0B429';
const GOLD_DARK = '#C9920A';
const GOLD_LIGHT = '#FEF3C7';

export default function AboutPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#FAFAF8', minHeight: '100vh', overflowX: 'hidden', color: '#1C1407' }}>
      
      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(255,255,255,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(240,180,41,0.12)' : 'none',
        boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.35s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #F5BE36, #D4960A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 4px 12px rgba(240,180,41,0.4)' }}>
            ✦
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.025em' }}>
            Eng<span style={{ color: GOLD }}>Mate</span>
          </span>
        </div>

        <div className="landing-nav-links" style={{ display: 'flex', gap: '2rem' }}>
          {[['Khóa học', '/#courses'], ['Tính năng', '/#features'], ['Về chúng tôi', '/about']].map(([label, href]) => (
            <a key={label} href={href} onClick={(e) => {
              if (href.startsWith('/#')) {
                if (window.location.pathname === '/') return; 
                e.preventDefault();
                navigate(href);
              } else {
                e.preventDefault();
                navigate(href);
              }
            }} className="nav-link" style={href === '/about' ? { color: GOLD_DARK, fontWeight: 700 } : {}}>{label}</a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{ padding: '0.5rem 1.125rem', borderRadius: 10, border: '1.5px solid rgba(28,20,7,0.1)', background: 'transparent', color: '#1C1407', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.2s' }}>
            Đăng nhập
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 140, paddingBottom: 80, paddingLeft: '2rem', paddingRight: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,180,41,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-block', padding: '0.375rem 1rem', borderRadius: 100, background: GOLD_LIGHT, border: `1px solid rgba(240,180,41,0.3)`, marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: GOLD_DARK, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Về chúng tôi</span>
          </div>
          
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.035em', marginBottom: '2rem', color: '#1C1407' }}>
            Câu chuyện đằng sau<br />
            <span style={{ color: GOLD_DARK }}>EngMate</span>
          </h1>
          
          <p style={{ fontSize: '1.15rem', color: '#6B6047', lineHeight: 1.8 }}>
            Học tiếng Anh không nhất thiết phải là một quá trình nhàm chán và đầy áp lực. 
            EngMate ra đời với sứ mệnh mang công nghệ Trí tuệ Nhân tạo (AI) vào quá trình tự học, 
            giúp người Việt chinh phục ngoại ngữ theo cách tự nhiên, thông minh và thú vị nhất.
          </p>
        </div>
      </section>

      {/* ── STORY / AUTHOR ── */}
      <section style={{ padding: '4rem 2rem 8rem', background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          
          {/* Ảnh/Avatar Tác giả */}
          <div style={{ position: 'relative' }}>
            <div style={{ width: '100%', aspectRatio: '4/5', borderRadius: 32, background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', position: 'relative', overflow: 'hidden' }}>
              {/* Fallback Image if no avatar */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🧑‍💻</div>
            </div>
            <div style={{ position: 'absolute', bottom: -20, right: -20, width: 140, height: 140, borderRadius: '50%', background: GOLD_LIGHT, border: '8px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: GOLD_DARK, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>100%</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Tâm huyết</span>
            </div>
          </div>

          {/* Nội dung giới thiệu */}
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
              Được sáng lập bởi<br/> Huỳnh Hoài Bảo
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: '#4b5563', lineHeight: 1.7, fontSize: '1.05rem' }}>
              <p>
                Xin chào, tôi là <strong>Huỳnh Hoài Bảo</strong>. Trải qua những khó khăn trong việc tự học ngoại ngữ và luyện thi chứng chỉ, tôi nhận ra phương pháp học truyền thống đang tốn quá nhiều thời gian nhưng lại không mang lại hiệu quả ghi nhớ lâu dài.
              </p>
              <p>
                Từ đó, tôi đã xây dựng <strong>EngMate</strong> — một giải pháp EdTech kết hợp giữa thuật toán Spaced Repetition (Lặp lại ngắt quãng SM-2) và công nghệ AI đàm thoại hiện đại.
              </p>
              <p>
                Mục tiêu của tôi là tạo ra một "người bạn đồng hành" (Mate) luôn thấu hiểu điểm yếu của bạn, sẵn sàng luyện nói cùng bạn 24/7 và biến mỗi giờ học từ vựng thành một trải nghiệm nhẹ nhàng, bớt áp lực.
              </p>
            </div>

            <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#FAFAF8', borderRadius: 20, border: '1px solid rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#1C1407' }}>Kết nối với tôi</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', color: '#6B6047' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>✉️</span> <strong>Email:</strong> huynhhoaibao216@gmail.com
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>📍</span> <strong>Địa chỉ:</strong> Bình Chuẩn, Thuận An, Bình Dương
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '3.5rem 2rem 2.5rem', background: '#120D04' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem' }}>
            <div style={{ maxWidth: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #F0B429, #D4960A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>✦</div>
                <span style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Eng<span style={{ color: GOLD }}>Mate</span></span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', lineHeight: 1.6 }}>Nền tảng học tiếng Anh thích ứng với AI, Flashcard SM-2 và Mini-games thú vị giúp bạn chinh phục ngoại ngữ dễ dàng.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.5rem' }}>Thông tin liên hệ</h4>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Tác giả:</strong> Huỳnh Hoài Bảo</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Email:</strong> huynhhoaibao216@gmail.com</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}><strong style={{ color: 'rgba(255,255,255,0.7)' }}>Địa chỉ:</strong> Bình Chuẩn, Thuận An, Bình Dương</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.5rem' }}>Liên kết nhanh</h4>
              {[['Đăng nhập', '/login'], ['Đăng ký', '/register']].map(([label, path]) => (
                <button key={label} onClick={() => navigate(path)} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', background: 'transparent', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.82rem' }}>© 2026 EngMate Inc. All rights reserved.</p>
            <div className="landing-footer-links" style={{ display: 'flex', gap: '1.5rem' }}>
              {['Bảo mật', 'Điều khoản'].map(l => (
                <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
