import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PhoneMockup from '../components/PhoneMockup';
import CourseCard from '../components/CourseCard';
import SpeakingCoach from '../components/SpeakingCoach';
import AdaptiveDashboard from '../components/AdaptiveDashboard';
import PricingCard from '../components/PricingCard';

const GOLD = '#F0B429';
const GOLD_DARK = '#C9920A';
const GOLD_LIGHT = '#FEF3C7';

const plans = [
  {
    name: 'Miễn phí',
    price: '0₫',
    period: '/tháng',
    desc: 'Dành cho người mới bắt đầu',
    features: ['50 từ mỗi ngày', '2 khóa học (TOEIC & IELTS)', 'Flashcard cơ bản', 'Báo cáo tiến độ hàng tuần', 'Diễn đàn cộng đồng'],
    locked: ['AI Speaking Coach', 'Lộ trình học cá nhân hóa', 'Học offline', 'Thi thử mô phỏng', 'Hỗ trợ ưu tiên'],
    cta: 'Bắt đầu miễn phí',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '199.000₫',
    period: '/tháng',
    desc: 'Dành cho người luyện thi nghiêm túc',
    features: ['Không giới hạn từ/ngày', 'Toàn bộ khóa học', 'AI Speaking Coach', 'Lộ trình học cá nhân hóa', 'Học offline', 'Phân tích tiến độ', 'Thi thử mô phỏng', 'Hỗ trợ 24/7'],
    locked: [],
    cta: 'Dùng thử 7 ngày miễn phí',
    highlight: true,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    // Fetch dynamic topics from DB
    const fetchTopics = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/vocabulary/topics`);
        const topics = res.data.data || res.data.topics || []; // Handle different wrapper formats
        
        const mappedCourses = topics.map((topic, i) => {
          const category = topic.category || 'GENERAL';
          return {
            id: topic.id,
            tag: category,
            title: topic.name || 'Chủ đề từ vựng',
            level: category === 'TOEIC' ? 'Trung cấp' : category === 'IELTS' ? 'Nâng cao' : 'Cơ bản',
            words: topic._count?.vocabularies || 30,
            progress: 0,
            emoji: category === 'TOEIC' ? '💼' : category === 'IELTS' ? '🎓' : '🌟',
            accent: category === 'TOEIC' ? '#F0B429' : category === 'IELTS' ? '#8B5CF6' : '#10B981',
            accentBg: category === 'TOEIC' ? 'rgba(240,180,41,0.1)' : category === 'IELTS' ? 'rgba(139,92,246,0.1)' : 'rgba(16,185,129,0.1)',
            desc: topic.description || 'Khám phá bộ từ vựng chuyên sâu giúp bạn chinh phục mục tiêu.'
          };
        });
        setCourses(mappedCourses);
      } catch (error) {
        console.error('Error fetching topics:', error);
        // Fallback for demo if API fails
        setCourses([
          { tag: 'TOEIC', title: 'Từ vựng TOEIC (Demo)', level: 'Trung cấp', words: 840, progress: 0, emoji: '💼', accent: '#F0B429', accentBg: 'rgba(240,180,41,0.1)', desc: 'Từ vựng kinh doanh' }
        ]);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchTopics();
  }, []);

  const tickerItems = ['Từ vựng TOEIC', 'Luyện thi IELTS', 'Giao tiếp văn phòng', 'Ngữ pháp nâng cao', 'Thành ngữ & Idioms', 'AI Speaking Coach', 'Thi thử mô phỏng', 'Học thích nghi AI'];

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

        <div style={{ display: 'flex', gap: '2rem' }}>
          {[['Khóa học', '#courses'], ['Tính năng', '#features'], ['Bảng giá', '#pricing']].map(([label, href]) => (
            <a key={label} href={href} className="nav-link">{label}</a>
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

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 2rem 4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', width: '100%' }}>
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

            <div style={{ display: 'flex', gap: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(28,20,7,0.06)' }}>
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
          
          {loadingCourses ? (
             <div style={{ textAlign: 'center', color: '#9D8E6F' }}>Đang tải danh sách khóa học...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {courses.map((c, i) => <CourseCard key={c.id || i} course={c} delay={(i%4) * 80} />)}
            </div>
          )}

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
              Trí tuệ nhân tạo trong từng từ
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.05rem', maxWidth: 460, margin: '0 auto' }}>
              Hai hệ thống AI phối hợp — một luyện tai nghe, một dẫn dắt tư duy học tập của bạn.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <SpeakingCoach />
            <AdaptiveDashboard />
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '6rem 2rem', background: '#FAFAF8' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-block', padding: '0.375rem 1rem', borderRadius: 100, background: GOLD_LIGHT, border: `1px solid rgba(240,180,41,0.3)`, marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: GOLD_DARK, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Bảng giá</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.875rem' }}>
              Đầu tư cho tương lai của bạn
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
            {plans.map(p => (
              <PricingCard key={p.name} plan={p} onCta={() => navigate('/register')} />
            ))}
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
      <footer style={{ padding: '2.5rem 2rem', background: '#120D04' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #F0B429, #D4960A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>✦</div>
            <span style={{ fontWeight: 800, color: '#fff', fontSize: '1rem', letterSpacing: '-0.02em' }}>Eng<span style={{ color: GOLD }}>Mate</span></span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.82rem' }}>© 2026 EngMate Inc. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Bảo mật', 'Điều khoản', 'Liên hệ'].map(l => (
              <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
