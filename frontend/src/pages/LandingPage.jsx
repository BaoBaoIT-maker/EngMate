import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneMockup from '../components/PhoneMockup';
import CourseCard from '../components/CourseCard';

const GOLD = '#F0B429';
const GOLD_DARK = '#C9920A';
const GOLD_LIGHT = '#FEF3C7';

// ─── 1. KHÓA HỌC (STATIC) ────────────────────────────────────────────────
const STATIC_COURSES = [
  {
    id: 'toeic', tag: 'TOEIC', title: 'Luyện thi TOEIC 900+', level: 'Trung cấp',
    words: 1200, progress: 0, emoji: '💼',
    accent: '#F0B429', accentBg: 'rgba(240,180,41,0.1)',
    desc: 'Lộ trình từ vựng công sở và luyện nghe chuyên sâu giúp bạn bứt phá điểm số TOEIC.'
  },
  {
    id: 'ielts', tag: 'IELTS', title: 'IELTS Học Thuật 8.0+', level: 'Nâng cao',
    words: 2500, progress: 0, emoji: '🎓',
    accent: '#8B5CF6', accentBg: 'rgba(139,92,246,0.1)',
    desc: 'Nền tảng từ vựng học thuật cao cấp và phát âm chuẩn xác cho kỳ thi IELTS.'
  },
  {
    id: 'comm', tag: 'GIAO TIẾP', title: 'Tiếng Anh Giao Tiếp', level: 'Cơ bản',
    words: 800, progress: 0, emoji: '🗣️',
    accent: '#10B981', accentBg: 'rgba(16,185,129,0.1)',
    desc: 'Phá bỏ rào cản ngôn ngữ, tự tin giao tiếp trong đời sống hằng ngày và công việc.'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  
  // Scroll effect
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const tickerItems = ['Từ vựng TOEIC', 'Luyện thi IELTS', 'Giao tiếp văn phòng', 'AI Conversation', 'Spaced Repetition', 'Học qua Game', 'Thi thử mô phỏng', 'Học thích nghi AI'];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#FAFAF8', minHeight: '100vh', overflowX: 'hidden', color: '#1C1407' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(240,180,41,0.12)' : 'none',
        boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.35s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                // Let anchor links work normally if on the same page, or redirect to landing
                if (window.location.pathname === '/') return; 
                e.preventDefault();
                navigate(href);
              } else {
                e.preventDefault();
                navigate(href);
              }
            }} className="nav-link">{label}</a>
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
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 64, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(240,180,41,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(139,92,246,0.06) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '8%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,180,41,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="landing-hero-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 2rem 4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', width: '100%' }}>
          <div style={{ animation: 'slide-up 0.6s ease forwards' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', borderRadius: 100, background: GOLD_LIGHT, border: `1px solid rgba(240,180,41,0.35)`, marginBottom: '1.5rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, display: 'inline-block' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: GOLD_DARK, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Học tiếng Anh cùng AI</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.6rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.035em', marginBottom: '1.5rem', color: '#1C1407' }}>
              Chinh phục tiếng Anh<br />
              <span style={{ background: 'linear-gradient(135deg, #F0B429 0%, #C9920A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                cùng AI thích nghi<br />theo bạn
              </span>
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#6B6047', lineHeight: 1.72, maxWidth: 460, marginBottom: '2.25rem' }}>
              EngMate phát hiện điểm yếu, xây dựng lộ trình cá nhân và đưa bạn đến TOEIC 900+ hoặc IELTS 8.0 — trong nửa thời gian thông thường.
            </p>

            <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <button
                onClick={() => navigate('/register')}
                className="btn-gold"
                style={{ padding: '0.9rem 2rem', borderRadius: 14, fontSize: '1rem', fontFamily: 'inherit' }}>
                Bắt đầu miễn phí →
              </button>
              <button style={{
                padding: '0.9rem 2rem', borderRadius: 14,
                border: '1.5px solid rgba(28,20,7,0.1)',
                background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
                color: '#1C1407', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'transform 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                ▶ Xem Demo
              </button>
            </div>

            <div className="landing-hero-stats" style={{ display: 'flex', gap: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(28,20,7,0.06)' }}>
              {[['50K+', 'Học viên'], ['4,9 ★', 'Đánh giá App'], ['92%', 'Tỉ lệ đậu kỳ thi']].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1C1407', letterSpacing: '-0.025em' }}>{val}</div>
                  <div style={{ fontSize: '0.78rem', color: '#9D8E6F', fontWeight: 500, marginTop: 1 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background: 'linear-gradient(135deg, #F0B429, #D4960A)', padding: '0.875rem 0', overflow: 'hidden' }}>
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.04em', textTransform: 'uppercase', padding: '0 2.5rem' }}>
                ✦ {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── COURSE CATALOG ── */}
      <section id="courses" style={{ padding: '6rem 2rem', background: 'linear-gradient(180deg, #FAFAF8 0%, #FEF9EE 100%)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-block', padding: '0.375rem 1rem', borderRadius: 100, background: GOLD_LIGHT, border: `1px solid rgba(240,180,41,0.3)`, marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: GOLD_DARK, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Khóa học</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.875rem' }}>
              Lộ trình chinh phục kỳ thi
            </h2>
            <p style={{ color: '#6B6047', fontSize: '1.05rem', maxWidth: 460, margin: '0 auto' }}>
              Bộ từ vựng chuyên biệt cho TOEIC và IELTS — dẫn dắt bởi AI, tăng cường bằng spaced repetition.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {STATIC_COURSES.map((c, i) => <CourseCard key={c.id || i} course={c} delay={(i%3) * 80} />)}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button style={{ padding: '0.75rem 2rem', borderRadius: 12, border: `1.5px solid rgba(240,180,41,0.35)`, background: 'transparent', color: GOLD_DARK, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = GOLD_LIGHT)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              Xem tất cả khóa học →
            </button>
          </div>
        </div>
      </section>

      {/* ── AI FEATURES ── */}
      <section id="features" style={{ padding: '6rem 2rem', background: '#1C1407', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,180,41,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-block', padding: '0.375rem 1rem', borderRadius: 100, background: 'rgba(240,180,41,0.12)', border: '1px solid rgba(240,180,41,0.25)', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: GOLD, letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI Features</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', marginBottom: '0.875rem' }}>
              Trí tuệ nhân tạo dẫn dắt lộ trình
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.05rem', maxWidth: 460, margin: '0 auto' }}>
              EngMate sở hữu bộ 3 công cụ cốt lõi giúp bạn nhớ lâu, phát âm chuẩn và học không nhàm chán.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Feature 1: Flashcard SM-2 */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem' }}>🧠</div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Flashcard Thông Minh (SM-2)</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontSize: '0.95rem' }}>Tối ưu hóa ghi nhớ dài hạn bằng thuật toán Spaced Repetition. Hệ thống tự động phân loại từ thành "Cần ôn gấp", "Đang ghi nhớ", "Đã khắc sâu" và tính toán thời điểm lặp lại tốt nhất cho não bộ của bạn.</p>
              </div>
            </div>

            {/* Feature 2: AI Conversation */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem' }}>🎙️</div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>AI Conversation</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontSize: '0.95rem' }}>Luyện giao tiếp 1-1 với AI bằng giọng nói. Nhận phản hồi về ngữ pháp và gợi ý từ vựng tự nhiên hơn ngay lập tức. Vượt qua nỗi sợ giao tiếp tiếng Anh.</p>
              </div>
            </div>

            {/* Feature 3: Mini-games */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem' }}>🎮</div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Hệ thống Mini-games</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontSize: '0.95rem' }}>Học mà chơi, chơi mà học qua các game như Matching (Nối từ) và Fill-in-the-blank (Điền vào chỗ trống). Loại bỏ sự nhàm chán của việc học từ vựng truyền thống.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section style={{ padding: '6rem 2rem', background: 'linear-gradient(135deg, #F0B429, #D4960A)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 80, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🚀</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Kỳ thi đang chờ. Bắt đầu ngay hôm nay.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Hơn 50.000 học viên đã đạt điểm mục tiêu với hệ thống AI của EngMate.
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '1rem 2.5rem', borderRadius: 14, border: 'none',
              background: '#1C1407', color: '#F0B429', fontWeight: 800, fontSize: '1.05rem',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 8px 32px rgba(28,20,7,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(28,20,7,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(28,20,7,0.3)' }}>
            Bắt đầu miễn phí ✦
          </button>
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
