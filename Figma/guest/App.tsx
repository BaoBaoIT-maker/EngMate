import { useState, useEffect, CSSProperties } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────
const GOLD = '#F0B429'
const GOLD_DARK = '#C9920A'
const GOLD_LIGHT = '#FEF3C7'

// ─── Data ─────────────────────────────────────────────────────────────────────
const courses = [
  { tag: 'TOEIC', title: 'Từ vựng TOEIC', level: 'Trung cấp', words: 840, progress: 68, emoji: '💼', accent: '#F0B429', accentBg: 'rgba(240,180,41,0.1)', desc: 'Từ vựng kinh doanh, thương mại và giao tiếp văn phòng' },
  { tag: 'IELTS', title: 'Từ vựng IELTS', level: 'Nâng cao', words: 1200, progress: 35, emoji: '🎓', accent: '#8B5CF6', accentBg: 'rgba(139,92,246,0.1)', desc: 'Học thuật, luận văn và kỹ năng đọc hiểu chuyên sâu' },
]

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
    features: ['Không giới hạn từ/ngày', 'Toàn bộ khóa học TOEIC & IELTS', 'AI Speaking Coach', 'Lộ trình học cá nhân hóa', 'Học offline', 'Phân tích tiến độ hàng ngày', 'Thi thử mô phỏng', 'Hỗ trợ 24/7 ưu tiên'],
    locked: [],
    cta: 'Dùng thử 7 ngày miễn phí',
    highlight: true,
  },
]

const aiStats = [
  { label: 'Từ đã thuộc', value: '1.284', delta: '+48 hôm nay', color: GOLD },
  { label: 'Chuỗi ngày học', value: '23 ngày', delta: '🔥 Kỷ lục cá nhân', color: '#F97316' },
  { label: 'XP hôm nay', value: '840 pts', delta: 'Còn 160 lên cấp', color: '#8B5CF6' },
  { label: 'Độ chính xác', value: '94,2%', delta: '↑ 3,1% tuần này', color: '#10B981' },
]

// ─── PhoneMockup ──────────────────────────────────────────────────────────────
function PhoneMockup() {
  const [flipped, setFlipped] = useState(false)
  return (
    <div className="animate-float" style={{ position: 'relative' }}>
      {/* Glow behind phone */}
      <div style={{
        position: 'absolute', inset: -40, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(240,180,41,0.25) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Floating badge — top right */}
      <div className="animate-float-slow glass" style={{
        position: 'absolute', top: -16, right: -24, zIndex: 10,
        padding: '0.5rem 0.875rem', borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1C1407' }}>Streak: 23 days 🔥</span>
      </div>

      {/* Floating badge — bottom left */}
      <div className="animate-float-slow glass" style={{
        position: 'absolute', bottom: 24, left: -32, zIndex: 10,
        padding: '0.625rem 1rem', borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        animationDelay: '1.5s',
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9D8E6F', marginBottom: 2 }}>AI Score</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: GOLD_DARK }}>94 / 100</div>
      </div>

      {/* Phone frame */}
      <div style={{
        width: 240, height: 480,
        borderRadius: 36,
        background: 'linear-gradient(160deg, #2A2015 0%, #1A1208 100%)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset, 0 1px 0 rgba(255,255,255,0.12) inset',
        padding: '8px',
        position: 'relative',
        cursor: 'pointer',
      }} onClick={() => setFlipped(f => !f)}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          width: 80, height: 24, background: '#0E0A04', borderRadius: '0 0 14px 14px', zIndex: 2,
        }} />
        {/* Screen */}
        <div style={{
          width: '100%', height: '100%', borderRadius: 30,
          background: flipped
            ? 'linear-gradient(160deg, #1A1208 0%, #2D1E00 100%)'
            : 'linear-gradient(160deg, #FFFDF7 0%, #FEF9EE 100%)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          transition: 'background 0.4s',
        }}>
          {/* Status bar */}
          <div style={{ height: 36 }} />
          {/* App header */}
          <div style={{ padding: '0.5rem 1rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: flipped ? 'rgba(255,255,255,0.5)' : '#9D8E6F' }}>Bài học hôm nay</div>
            <div style={{ background: GOLD_LIGHT, borderRadius: 100, padding: '2px 8px' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: GOLD_DARK }}>TOEIC</span>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ padding: '0 1rem', marginBottom: '0.75rem' }}>
            <div style={{ height: 4, borderRadius: 4, background: flipped ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ width: '68%', height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${GOLD}, ${GOLD_DARK})` }} />
            </div>
            <div style={{ fontSize: '0.6rem', color: flipped ? 'rgba(255,255,255,0.4)' : '#9D8E6F', marginTop: 3 }}>17 / 25 từ</div>
          </div>
          {/* Flashcard */}
          <div style={{ margin: '0 0.875rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {!flipped ? (
              <div style={{
                background: 'white', borderRadius: 16, padding: '1rem',
                boxShadow: '0 4px 20px rgba(240,180,41,0.15), 0 1px 0 rgba(255,255,255,0.9) inset',
                border: '1px solid rgba(240,180,41,0.2)',
                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
                <div style={{ fontSize: '0.58rem', fontWeight: 700, color: GOLD_DARK, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Từ vựng</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1C1407', marginBottom: 4, letterSpacing: '-0.02em' }}>Meticulous</div>
                <div style={{ fontSize: '0.6rem', color: '#9D8E6F', fontStyle: 'italic', marginBottom: 8 }}>/məˈtɪk.jʊ.ləs/</div>
                <div style={{ fontSize: '0.62rem', color: '#6B6047', lineHeight: 1.5 }}>
                  adj. Tỉ mỉ, cẩn thận đến từng chi tiết.
                </div>
                <div style={{ marginTop: 8, padding: '0.4rem 0.6rem', background: GOLD_LIGHT, borderRadius: 8 }}>
                  <div style={{ fontSize: '0.58rem', color: GOLD_DARK, lineHeight: 1.5, fontStyle: 'italic' }}>
                    "She was meticulous in her TOEIC preparation."
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'linear-gradient(135deg, #F0B429, #C9920A)', borderRadius: 16, padding: '1rem',
                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                boxShadow: '0 8px 32px rgba(240,180,41,0.4)',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>Chính xác!</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)' }}>+40 XP nhận được</div>
              </div>
            )}
          </div>
          {/* Action buttons */}
          <div style={{ padding: '0.75rem 0.875rem', display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, padding: '0.5rem', borderRadius: 10, border: '1.5px solid rgba(236,72,153,0.3)', background: 'rgba(236,72,153,0.06)', fontSize: '0.62rem', fontWeight: 700, color: '#EC4899', cursor: 'pointer' }}>
              Ôn lại ↩
            </button>
            <button style={{ flex: 1, padding: '0.5rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #F0B429, #D4960A)', fontSize: '0.62rem', fontWeight: 700, color: 'white', cursor: 'pointer' }}>
              Thuộc rồi ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CourseCard ───────────────────────────────────────────────────────────────
function CourseCard({ course, delay }: { course: (typeof courses)[0]; delay: number }) {
  const s: CSSProperties = {
    background: 'rgba(255,255,255,0.62)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.88)',
    borderRadius: 20,
    padding: '1.5rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset',
    animation: `card-in 0.5s ease both`,
    animationDelay: `${delay}ms`,
  }
  return (
    <div className="course-card" style={s}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: course.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
          {course.emoji}
        </div>
        <div style={{ padding: '0.25rem 0.625rem', borderRadius: 100, background: course.accentBg, border: `1px solid ${course.accent}33` }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: course.accent }}>{course.tag}</span>
        </div>
      </div>
      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1C1407', marginBottom: 4, letterSpacing: '-0.01em' }}>{course.title}</div>
      <div style={{ fontSize: '0.78rem', color: '#9D8E6F', marginBottom: 6 }}>
        {course.level} · {course.words.toLocaleString()} từ
      </div>
      <div style={{ fontSize: '0.78rem', color: '#6B6047', lineHeight: 1.5, marginBottom: '1.25rem' }}>{course.desc}</div>
      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B6047' }}>Tiến độ</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: course.accent }}>{course.progress}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 100, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{
            width: `${course.progress}%`, height: '100%', borderRadius: 100,
            background: `linear-gradient(90deg, ${course.accent}, ${course.accent}aa)`,
            transition: 'width 0.8s ease',
          }} />
        </div>
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#9D8E6F' }}>{Math.round(course.words * course.progress / 100).toLocaleString()} từ đã học</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: course.accent, cursor: 'pointer' }}>Tiếp tục →</span>
      </div>
    </div>
  )
}

// ─── WaveBar ──────────────────────────────────────────────────────────────────
function WaveBar({ i }: { i: number }) {
  const durations = [0.6, 0.9, 0.7, 1.1, 0.8, 0.65, 0.95, 0.75, 1.0, 0.7, 0.85, 0.6, 1.2, 0.8, 0.7]
  const d = durations[i % durations.length]
  return (
    <div style={{
      width: 4, height: 48, borderRadius: 100,
      background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`,
      transformOrigin: 'center',
      animation: `wave-bar ${d}s ease-in-out infinite`,
      animationDelay: `${i * 0.07}s`,
    }} />
  )
}

// ─── SpeakingCoach ────────────────────────────────────────────────────────────
function SpeakingCoach() {
  const [recording, setRecording] = useState(false)
  return (
    <div className="glass-dark" style={{
      borderRadius: 24, padding: '2rem',
      boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
      animation: 'card-in 0.5s ease both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #F0B429, #D4960A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🎙️</div>
        <div>
          <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>AI Speaking Coach</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>Phản hồi phát âm theo thời gian thực</div>
        </div>
      </div>

      {/* Transcript box */}
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '1rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Câu của bạn</div>
        <div style={{ fontSize: '0.95rem', color: '#fff', lineHeight: 1.6, fontStyle: 'italic' }}>
          "The report was submitted{' '}
          <span style={{ color: GOLD, fontWeight: 700, textDecoration: 'underline', textDecorationStyle: 'dotted' }}>me-tic-u-lous-ly</span>
          {' '}on time."
        </div>
      </div>

      {/* Waveform */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 56, justifyContent: 'center', marginBottom: '1.5rem' }}>
        {Array.from({ length: 15 }).map((_, i) => <WaveBar key={i} i={i} />)}
      </div>

      {/* Score row */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[['Phát âm', '94'], ['Lưu loát', '88'], ['Ngữ điệu', '91']].map(([k, v]) => (
          <div key={k} style={{ flex: 1, background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)', borderRadius: 12, padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: GOLD }}>{v}</div>
            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{k}</div>
          </div>
        ))}
      </div>

      {/* Mic button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative' }}>
          {recording && <>
            <div style={{
              position: 'absolute', inset: -12, borderRadius: '50%',
              border: `2px solid ${GOLD}`,
              animation: 'pulse-ring 1.2s ease-out infinite',
            }} />
            <div style={{
              position: 'absolute', inset: -20, borderRadius: '50%',
              border: `2px solid ${GOLD}`,
              animation: 'pulse-ring2 1.2s ease-out infinite 0.4s',
            }} />
          </>}
          <button
            onClick={() => setRecording(r => !r)}
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: recording ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'linear-gradient(135deg, #F5BE36, #D4960A)',
              border: 'none', cursor: 'pointer', fontSize: '1.25rem',
              boxShadow: recording ? '0 0 0 4px rgba(239,68,68,0.2)' : '0 6px 20px rgba(240,180,41,0.5)',
              transition: 'all 0.3s',
            }}>
            {recording ? '⏹' : '🎤'}
          </button>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
        {recording ? 'Đang nghe… hãy nói tự nhiên' : 'Nhấn để bắt đầu nói'}
      </div>
    </div>
  )
}

// ─── AdaptiveDashboard ────────────────────────────────────────────────────────
function AdaptiveDashboard() {
  const weakAreas = ['Mệnh đề điều kiện', 'Câu bị động', 'Collocations']
  const path = [
    { label: 'Danh từ', done: true },
    { label: 'Động từ', done: true },
    { label: 'Tính từ', done: true },
    { label: 'Thành ngữ', done: false, active: true },
    { label: 'Collocation', done: false },
    { label: 'Thi thử', done: false },
  ]
  return (
    <div className="glass-dark" style={{
      borderRadius: 24, padding: '2rem',
      boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
      animation: 'card-in 0.5s ease 0.1s both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🧠</div>
        <div>
          <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>Học thích nghi thông minh</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>Cá nhân hóa theo điểm yếu của bạn</div>
        </div>
      </div>

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {aiStats.map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '0.875rem' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginBottom: 2, fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Learning path */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Lộ trình học của bạn</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {path.map((node, i) => (
            <div key={node.label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: node.done ? 'linear-gradient(135deg, #F0B429, #D4960A)'
                    : node.active ? 'rgba(240,180,41,0.25)' : 'rgba(255,255,255,0.08)',
                  border: node.active ? `2px solid ${GOLD}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem',
                  boxShadow: node.active ? `0 0 12px rgba(240,180,41,0.5)` : 'none',
                }}>
                  {node.done ? '✓' : node.active ? '▶' : ''}
                </div>
                <div style={{ fontSize: '0.52rem', color: node.done ? 'rgba(255,255,255,0.6)' : node.active ? GOLD : 'rgba(255,255,255,0.25)', fontWeight: node.active ? 700 : 500, textAlign: 'center', lineHeight: 1.2 }}>
                  {node.label}
                </div>
              </div>
              {i < path.length - 1 && (
                <div style={{ width: '100%', height: 2, background: node.done ? `linear-gradient(90deg, ${GOLD}, ${GOLD}aa)` : 'rgba(255,255,255,0.08)', borderRadius: 1, flex: 1, maxWidth: 16 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weak areas */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.625rem' }}>Cần tập trung</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {weakAreas.map(a => (
            <span key={a} style={{ padding: '0.25rem 0.625rem', borderRadius: 100, background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)', fontSize: '0.65rem', fontWeight: 600, color: '#F9A8D4' }}>
              {a}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── PricingCard ──────────────────────────────────────────────────────────────
function PricingCard({ plan, onCta }: { plan: typeof plans[0]; onCta: () => void }) {
  const hl = plan.highlight
  return (
    <div style={{
      borderRadius: 24, padding: '2rem',
      background: hl ? 'linear-gradient(160deg, #1C1407 0%, #2A1E08 100%)' : 'rgba(255,255,255,0.65)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: hl ? '1.5px solid rgba(240,180,41,0.4)' : '1px solid rgba(255,255,255,0.88)',
      boxShadow: hl ? '0 16px 48px rgba(240,180,41,0.2), 0 4px 16px rgba(0,0,0,0.15)' : '0 4px 24px rgba(0,0,0,0.06)',
      position: 'relative', overflow: 'hidden',
    }}>
      {hl && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          padding: '0.25rem 0.75rem', borderRadius: 100,
          background: 'linear-gradient(135deg, #F0B429, #D4960A)',
          fontSize: '0.7rem', fontWeight: 700, color: 'white',
        }}>
          Phổ biến nhất
        </div>
      )}
      {hl && (
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240,180,41,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: hl ? 'rgba(255,255,255,0.45)' : '#9D8E6F', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{plan.name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 6 }}>
        <span style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.04em', color: hl ? '#fff' : '#1C1407' }}>{plan.price}</span>
        <span style={{ fontSize: '0.9rem', color: hl ? 'rgba(255,255,255,0.4)' : '#9D8E6F' }}>{plan.period}</span>
      </div>
      <div style={{ fontSize: '0.85rem', color: hl ? 'rgba(255,255,255,0.5)' : '#9D8E6F', marginBottom: '1.5rem' }}>{plan.desc}</div>

      <button onClick={onCta} className={hl ? 'btn-gold' : ''} style={{
        width: '100%', padding: '0.875rem', borderRadius: 12,
        fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem',
        ...(hl ? {} : {
          background: 'transparent', border: '1.5px solid rgba(28,20,7,0.15)',
          color: '#1C1407', transition: 'background 0.2s',
        }),
      }}>
        {plan.cta}
      </button>

      <div style={{ borderTop: `1px solid ${hl ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {plan.features.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(240,180,41,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.55rem', color: GOLD }}>✓</span>
            </div>
            <span style={{ fontSize: '0.83rem', color: hl ? 'rgba(255,255,255,0.8)' : '#6B6047' }}>{f}</span>
          </div>
        ))}
        {plan.locked.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', opacity: 0.38 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.55rem', color: '#9D8E6F' }}>✕</span>
            </div>
            <span style={{ fontSize: '0.83rem', color: '#9D8E6F', textDecoration: 'line-through' }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── AuthModal ────────────────────────────────────────────────────────────────
function AuthModal({
  mode, onClose, onToggle,
  email, setEmail, password, setPassword, name, setName,
}: {
  mode: 'login' | 'register'
  onClose: () => void
  onToggle: () => void
  email: string; setEmail: (v: string) => void
  password: string; setPassword: (v: string) => void
  name: string; setName: (v: string) => void
}) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(28, 20, 7, 0.55)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}>
      <div className="animate-modal-in" style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        border: '1.5px solid rgba(255,255,255,0.95)',
        borderRadius: 28,
        boxShadow: '0 32px 80px rgba(28,20,7,0.2), 0 8px 24px rgba(240,180,41,0.12), 0 1px 0 rgba(255,255,255,0.9) inset',
        padding: '2.25rem',
        position: 'relative',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
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
          {mode === 'login' ? 'Chào mừng trở lại!' : 'Bắt đầu học ngay hôm nay'}
        </h2>
        <p style={{ color: '#9D8E6F', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          {mode === 'login' ? 'Đăng nhập để tiếp tục chuỗi ngày học của bạn.' : 'Tạo tài khoản miễn phí chỉ trong 30 giây.'}
        </p>

        {/* Social buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { icon: 'G', label: 'Google', bg: '#fff', color: '#1C1407', border: 'rgba(0,0,0,0.12)' },
            { icon: 'f', label: 'Facebook', bg: '#1877F2', color: '#fff', border: 'transparent' },

          ].map(b => (
            <button key={b.label} style={{
              flex: 1, padding: '0.7rem', borderRadius: 12,
              border: `1.5px solid ${b.border}`, background: b.bg,
              color: b.color, fontWeight: 700, fontSize: '0.85rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
              <span style={{ fontSize: '1rem', fontWeight: 900 }}>{b.icon}</span>
              {b.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
          <span style={{ fontSize: '0.75rem', color: '#9D8E6F', fontWeight: 500 }}>hoặc dùng email</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B6047', display: 'block', marginBottom: 6 }}>Họ và tên</label>
              <input className="input-glass" value={name} onChange={e => setName(e.target.value)} placeholder="Nguyễn Văn An" type="text" />
            </div>
          )}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B6047', display: 'block', marginBottom: 6 }}>Địa chỉ email</label>
            <input className="input-glass" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B6047' }}>Mật khẩu</label>
              {mode === 'login' && <span style={{ fontSize: '0.72rem', color: GOLD_DARK, fontWeight: 600, cursor: 'pointer' }}>Quên mật khẩu?</span>}
            </div>
            <input className="input-glass" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" />
          </div>
          <button className="btn-gold" style={{
            width: '100%', padding: '0.875rem', borderRadius: 12,
            fontSize: '0.95rem', marginTop: '0.25rem',
            fontFamily: 'inherit',
          }}>
            {mode === 'login' ? 'Đăng nhập →' : 'Tạo tài khoản miễn phí →'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: '#9D8E6F' }}>
          {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <span onClick={onToggle} style={{ color: GOLD_DARK, fontWeight: 700, cursor: 'pointer' }}>
            {mode === 'login' ? 'Đăng ký miễn phí' : 'Đăng nhập'}
          </span>
        </p>

        {mode === 'register' && (
          <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: '#C4B8A0' }}>
            Khi đăng ký, bạn đồng ý với <span style={{ color: GOLD_DARK, cursor: 'pointer' }}>Điều khoản</span> và <span style={{ color: GOLD_DARK, cursor: 'pointer' }}>Chính sách bảo mật</span> của chúng tôi.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [scrolled, setScrolled] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  const tickerItems = ['Từ vựng TOEIC', 'Luyện thi IELTS', 'Giao tiếp văn phòng', 'Ngữ pháp nâng cao', 'Thành ngữ & Idioms', 'AI Speaking Coach', 'Thi thử mô phỏng', 'Học thích nghi AI']

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
            onClick={() => openAuth('login')}
            style={{ padding: '0.5rem 1.125rem', borderRadius: 10, border: '1.5px solid rgba(28,20,7,0.1)', background: 'transparent', color: '#1C1407', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.2s' }}>
            Đăng nhập
          </button>
          <button
            onClick={() => openAuth('register')}
            className="btn-gold"
            style={{ padding: '0.5rem 1.25rem', borderRadius: 10, fontSize: '0.875rem', fontFamily: 'inherit' }}>
            Nâng cấp ✦
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 64, overflow: 'hidden' }}>
        {/* Background mesh */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(240,180,41,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(139,92,246,0.06) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '8%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,180,41,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 2rem 4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', width: '100%' }}>
          {/* Left */}
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
                onClick={() => openAuth('register')}
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

          {/* Right: Phone Mockup */}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {courses.map((c, i) => <CourseCard key={i} course={c} delay={i * 80} />)}
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
              Trí tuệ nhân tạo trong từng từ
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.05rem', maxWidth: 460, margin: '0 auto' }}>
              Hai hệ thống AI phối hợp — một luyện tai nghe, một dẫn dắt tư duy học tập của bạn.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: GOLD_DARK, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pricing</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.875rem' }}>
              Bảng giá rõ ràng, minh bạch
            </h2>
            <p style={{ color: '#6B6047', fontSize: '1.05rem' }}>Không phí ẩn. Hủy bất cứ lúc nào. 7 ngày đầu hoàn toàn miễn phí.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
            {plans.map(plan => <PricingCard key={plan.name} plan={plan} onCta={() => openAuth('register')} />)}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '5rem 2rem', background: 'linear-gradient(135deg, #F5BE36 0%, #D4960A 50%, #C9920A 100%)', position: 'relative', overflow: 'hidden' }}>
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
            onClick={() => openAuth('register')}
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

      {/* ── AUTH MODAL ── */}
      {authOpen && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthOpen(false)}
          onToggle={() => setAuthMode(m => m === 'login' ? 'register' : 'login')}
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          name={name} setName={setName}
        />
      )}
    </div>
  )
}
