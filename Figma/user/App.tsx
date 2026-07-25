import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = 'dashboard' | 'flashcards' | 'speaking' | 'games' | 'settings'

interface Theme {
  bg: string
  bgSub: string
  card: string
  cardBorder: string
  sidebar: string
  sidebarBorder: string
  text: string
  textSub: string
  textMuted: string
  gold: string
  goldDark: string
  goldBg: string
  shadow: string
  inputBg: string
  inputBorder: string
  msgAiBg: string
  msgAiBorder: string
}

// ─── Themes ───────────────────────────────────────────────────────────────────
const light: Theme = {
  bg: '#FAFAF8',
  bgSub: '#F3F0EB',
  card: 'rgba(255,255,255,0.72)',
  cardBorder: 'rgba(234,179,8,0.12)',
  sidebar: 'rgba(255,255,255,0.92)',
  sidebarBorder: 'rgba(234,179,8,0.1)',
  text: '#1F2937',
  textSub: '#4B5563',
  textMuted: '#9CA3AF',
  gold: '#D97706',
  goldDark: '#B45309',
  goldBg: '#FEF3C7',
  shadow: 'rgba(0,0,0,0.06)',
  inputBg: 'rgba(255,255,255,0.7)',
  inputBorder: 'rgba(234,179,8,0.25)',
  msgAiBg: 'rgba(255,255,255,0.65)',
  msgAiBorder: 'rgba(234,179,8,0.15)',
}
const dark: Theme = {
  bg: '#0D0D10',
  bgSub: '#161619',
  card: 'rgba(30,30,36,0.85)',
  cardBorder: 'rgba(234,179,8,0.14)',
  sidebar: 'rgba(18,18,22,0.97)',
  sidebarBorder: 'rgba(234,179,8,0.1)',
  text: '#F9FAFB',
  textSub: '#D1D5DB',
  textMuted: '#6B7280',
  gold: '#EAB308',
  goldDark: '#FBBF24',
  goldBg: 'rgba(234,179,8,0.12)',
  shadow: 'rgba(0,0,0,0.4)',
  inputBg: 'rgba(30,30,36,0.8)',
  inputBorder: 'rgba(234,179,8,0.2)',
  msgAiBg: 'rgba(30,30,36,0.9)',
  msgAiBorder: 'rgba(234,179,8,0.12)',
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const CARDS = [
  { word: 'Meticulous', phonetic: '/məˈtɪk.jʊ.ləs/', pos: 'adj', meaning: 'Tỉ mỉ, cẩn thận đến từng chi tiết', example: '"The report was prepared in a meticulous manner."', tag: 'TOEIC', difficulty: 2 },
  { word: 'Alleviate', phonetic: '/əˈliː.vi.eɪt/', pos: 'verb', meaning: 'Giảm nhẹ, làm bớt (khó khăn, nỗi đau)', example: '"The new measures aim to alleviate financial pressure on households."', tag: 'IELTS', difficulty: 3 },
  { word: 'Proliferate', phonetic: '/prəˈlɪf.ər.eɪt/', pos: 'verb', meaning: 'Phát triển, sinh sôi nhanh chóng', example: '"Online platforms have proliferated over the past decade."', tag: 'IELTS', difficulty: 3 },
  { word: 'Substantial', phonetic: '/səbˈstæn.ʃəl/', pos: 'adj', meaning: 'Đáng kể, có giá trị lớn, quan trọng', example: '"There has been a substantial increase in applications this year."', tag: 'TOEIC', difficulty: 1 },
  { word: 'Endeavor', phonetic: '/ɪnˈdev.ər/', pos: 'noun/verb', meaning: 'Nỗ lực, cố gắng hết sức', example: '"The team endeavored to deliver the project on schedule."', tag: 'TOEIC', difficulty: 2 },
]

const CHAT_INIT = [
  { id: 1, role: 'ai' as const, text: 'Xin chào! Tôi là AI Coach của bạn 🎯 Hôm nay chúng ta luyện IELTS Speaking Part 2. Chủ đề: **"Describe a memorable journey you have taken."** Bạn có 1 phút chuẩn bị và 2 phút để nói. Sẵn sàng chưa?' },
  { id: 2, role: 'user' as const, text: 'Sẵn sàng rồi ạ!' },
  { id: 3, role: 'ai' as const, text: 'Tuyệt vời! Hãy nhấn nút micro bên dưới và bắt đầu nói khi bạn sẵn sàng. Tôi sẽ phân tích phát âm, ngữ điệu và từ vựng của bạn sau khi bạn hoàn thành. 🎙️' },
  { id: 4, role: 'feedback' as const, text: 'Câu trả lời tốt! Phát âm rõ ràng và lưu loát. Hãy dùng thêm discourse markers như "Furthermore", "In addition" để mạch lạc hơn.', scores: { pronunciation: 88, fluency: 76, vocabulary: 82 } },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const card = (t: Theme, extra?: object) => ({
  background: t.card,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${t.cardBorder}`,
  borderRadius: 16,
  boxShadow: `0 4px 24px ${t.shadow}`,
  ...extra,
})

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icon = {
  home: (c: string) => <svg width="20" height="20" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  cards: (c: string) => <svg width="20" height="20" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  games: (c: string) => <svg width="20" height="20" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="5"/><line x1="12" y1="10" x2="12" y2="14"/><line x1="10" y1="12" x2="14" y2="12"/><circle cx="17" cy="11" r="1" fill={c}/><circle cx="19" cy="13" r="1" fill={c}/></svg>,
  mic: (c: string) => <svg width="20" height="20" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M19 10a7 7 0 01-14 0"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="9" y1="23" x2="15" y2="23"/></svg>,
  settings: (c: string) => <svg width="20" height="20" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  sun: (c: string) => <svg width="18" height="18" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon: (c: string) => <svg width="18" height="18" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  chevron: (c: string) => <svg width="16" height="16" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,
  send: (c: string) => <svg width="18" height="18" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  star: (c: string, filled?: boolean) => <svg width="16" height="16" fill={filled ? c : 'none'} stroke={c} strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
}

// ─── Radial Progress ──────────────────────────────────────────────────────────
function RadialProgress({ value, color, size = 72, strokeW = 6 }: { value: number; color: string; size?: number; strokeW?: number }) {
  const r = (size - strokeW) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  const c = size / 2
  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={strokeW} />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={strokeW}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`} style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
    </svg>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard' as Screen, label: 'Trang chủ', icon: Icon.home },
  { id: 'flashcards' as Screen, label: 'Flashcards', icon: Icon.cards },
  { id: 'games' as Screen, label: 'Mini-games', icon: Icon.games },
  { id: 'speaking' as Screen, label: 'AI Coach', icon: Icon.mic },
  { id: 'settings' as Screen, label: 'Cài đặt', icon: Icon.settings },
]

function Sidebar({ screen, setScreen, collapsed, setCollapsed, t, isDark }: {
  screen: Screen; setScreen: (s: Screen) => void
  collapsed: boolean; setCollapsed: (v: boolean) => void
  t: Theme; isDark: boolean
}) {
  const W = collapsed ? 64 : 232
  return (
    <div style={{
      width: W, minHeight: '100vh', flexShrink: 0,
      background: t.sidebar,
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderRight: `1px solid ${t.sidebarBorder}`,
      display: 'flex', flexDirection: 'column', padding: '1.25rem 0.75rem',
      transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden', zIndex: 50,
      boxShadow: isDark ? `2px 0 24px ${t.shadow}` : `2px 0 16px ${t.shadow}`,
    }}>
      {/* Logo + collapse toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', marginBottom: '1.75rem', padding: '0 0.25rem' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#EAB308,#B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>✦</div>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: t.text, letterSpacing: '-0.02em' }}>Eng<span style={{ color: t.gold }}>Mate</span></span>
          </div>
        )}
        {collapsed && (
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#EAB308,#B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✦</div>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
            {Icon.chevron(t.textMuted)}
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {NAV.map(item => {
          const active = screen === item.id
          return (
            <div key={item.id} className="nav-item"
              onClick={() => setScreen(item.id)}
              style={{
                background: active ? t.goldBg : 'transparent',
                color: active ? t.gold : t.textSub,
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}>
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon(active ? t.gold : t.textMuted)}</span>
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: t.gold }} />}
            </div>
          )
        })}
      </nav>

      {/* User avatar */}
      {!collapsed && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 12, background: t.goldBg, border: `1px solid ${t.cardBorder}`, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#EAB308,#B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>A</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: t.text, whiteSpace: 'nowrap' }}>Văn An</div>
            <div style={{ fontSize: '0.68rem', color: t.textMuted }}>IELTS · Level 7</div>
          </div>
        </div>
      )}
      {collapsed && (
        <button onClick={() => setCollapsed(false)} style={{ background: t.goldBg, border: 'none', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          <svg width="14" height="14" fill="none" stroke={t.gold} strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}
    </div>
  )
}

// ─── Bottom Nav (mobile) ──────────────────────────────────────────────────────
function BottomNav({ screen, setScreen, t }: { screen: Screen; setScreen: (s: Screen) => void; t: Theme }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: t.sidebar, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: `1px solid ${t.sidebarBorder}`,
      display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {NAV.map(item => {
        const active = screen === item.id
        return (
          <div key={item.id} className="bottom-nav-item" onClick={() => setScreen(item.id)} style={{ color: active ? t.gold : t.textMuted }}>
            <span style={{ display: 'flex' }}>{item.icon(active ? t.gold : t.textMuted)}</span>
            <span>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ title, subtitle, t, isDark, toggleDark }: { title: string; subtitle?: string; t: Theme; isDark: boolean; toggleDark: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: t.text, letterSpacing: '-0.025em', margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '0.875rem', color: t.textMuted, margin: '0.25rem 0 0' }}>{subtitle}</p>}
      </div>
      <button onClick={toggleDark} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', borderRadius: 10, border: `1px solid ${t.cardBorder}`, background: t.card, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600, color: t.textSub, transition: 'all 0.2s' }}>
        {isDark ? Icon.sun(t.gold) : Icon.moon(t.textSub)}
        {isDark ? 'Sáng' : 'Tối'}
      </button>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardScreen({ t, isDark, toggleDark, setScreen }: { t: Theme; isDark: boolean; toggleDark: () => void; setScreen: (s: Screen) => void }) {
  const skills = [
    { label: 'Từ vựng', value: 72, color: t.gold },
    { label: 'Ngữ pháp', value: 58, color: '#8B5CF6' },
    { label: 'Phát âm', value: 84, color: '#10B981' },
  ]
  const recent = [
    { word: 'Meticulous', correct: true, time: '2 giờ trước' },
    { word: 'Alleviate', correct: true, time: '2 giờ trước' },
    { word: 'Proliferate', correct: false, time: 'Hôm qua' },
    { word: 'Substantial', correct: true, time: 'Hôm qua' },
  ]
  return (
    <div className="screen-enter" style={{ maxWidth: 900, width: '100%' }}>
      <Header title="Chào buổi sáng, Văn An 👋" subtitle="Tiếp tục chuỗi ngày học của bạn nhé!" t={t} isDark={isDark} toggleDark={toggleDark} />

      {/* Top row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Streak */}
        <div className="streak-badge" style={{ ...card(t), padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: `1px solid rgba(234,179,8,0.3)` }}>
          <span className="anim-flame" style={{ fontSize: '2.5rem', lineHeight: 1 }}>🔥</span>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: t.gold, letterSpacing: '-0.04em', lineHeight: 1 }}>23</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: t.textMuted, marginTop: 2 }}>Ngày liên tiếp</div>
          </div>
          <div style={{ marginLeft: '0.5rem', paddingLeft: '1rem', borderLeft: `1px solid ${t.cardBorder}` }}>
            <div style={{ fontSize: '0.72rem', color: t.textMuted, marginBottom: 4 }}>Kỷ lục</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: t.text }}>31 🏆</div>
          </div>
        </div>

        {/* XP + Level */}
        <div style={{ ...card(t), padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cấp độ</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: t.text }}>Level 7 — Intermediate</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: t.textMuted }}>XP hôm nay</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: t.gold }}>840 / 1000</div>
            </div>
          </div>
          <div style={{ height: 8, borderRadius: 100, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '84%', borderRadius: 100, background: `linear-gradient(90deg, ${t.gold}, ${t.goldDark})`, transition: 'width 1s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: '0.68rem', color: t.textMuted }}>160 XP đến Level 8</span>
            <span style={{ fontSize: '0.68rem', color: t.textMuted }}>1.284 từ đã thuộc</span>
          </div>
        </div>
      </div>

      {/* Skills + Next lesson */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Skills */}
        <div style={{ ...card(t), padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.125rem' }}>Kỹ năng</div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {skills.map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <RadialProgress value={s.value} color={s.color} size={72} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: t.text }}>{s.value}%</div>
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: t.textSub }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Next lesson */}
        <div onClick={() => setScreen('flashcards')} style={{ ...card(t), padding: '1.25rem', cursor: 'pointer', border: `1px solid rgba(234,179,8,0.25)`, transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 36px ${t.shadow}` }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px ${t.shadow}` }}>
          <div style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${t.goldBg} 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>Bài học tiếp theo</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: t.goldBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>📚</div>
            <div>
              <div style={{ fontWeight: 700, color: t.text, fontSize: '0.9rem' }}>TOEIC — Từ vựng kinh doanh</div>
              <div style={{ fontSize: '0.72rem', color: t.textMuted }}>8 từ cần ôn tập hôm nay</div>
            </div>
          </div>
          <div style={{ height: 6, borderRadius: 100, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '68%', borderRadius: 100, background: `linear-gradient(90deg, ${t.gold}, ${t.goldDark})` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: t.textMuted }}>17 / 25 từ</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: t.gold }}>Tiếp tục →</span>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ ...card(t), padding: '1.25rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>Hoạt động gần đây</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {recent.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: r.correct ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>
                {r.correct ? '✓' : '✕'}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: t.text, fontSize: '0.875rem' }}>{r.word}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: t.textMuted }}>{r.time}</div>
              <div style={{ padding: '0.2rem 0.5rem', borderRadius: 6, background: r.correct ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', fontSize: '0.65rem', fontWeight: 700, color: r.correct ? '#10B981' : '#EF4444' }}>
                {r.correct ? 'Thuộc' : 'Cần ôn'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Flashcards ───────────────────────────────────────────────────────────────
function FlashcardsScreen({ t, isDark, toggleDark }: { t: Theme; isDark: boolean; toggleDark: () => void }) {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [rated, setRated] = useState<number[]>([])

  const card_ = CARDS[idx % CARDS.length]
  const total = CARDS.length

  const rate = (r: number) => {
    setRated(prev => [...prev, r])
    setFlipped(false)
    setTimeout(() => setIdx(i => i + 1), 200)
  }

  if (idx >= total) {
    return (
      <div className="screen-enter" style={{ maxWidth: 600, width: '100%', margin: '0 auto' }}>
        <Header title="Flashcards" t={t} isDark={isDark} toggleDark={toggleDark} />
        <div style={{ ...card(t), padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: t.text, marginBottom: '0.5rem' }}>Hoàn thành xuất sắc!</div>
          <div style={{ color: t.textMuted, marginBottom: '1.5rem' }}>Bạn đã ôn tập xong {total} thẻ hôm nay. +120 XP nhận được!</div>
          <button onClick={() => { setIdx(0); setFlipped(false); setRated([]) }} style={{ padding: '0.75rem 2rem', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`, color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            Ôn lại từ đầu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-enter" style={{ maxWidth: 560, width: '100%', margin: '0 auto' }}>
      <Header title="Flashcards" subtitle="SM-2 Spaced Repetition · Ôn từ thông minh" t={t} isDark={isDark} toggleDark={toggleDark} />

      {/* Progress bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.78rem', color: t.textMuted, fontWeight: 500 }}>Thẻ {idx + 1} / {total}</span>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 6, background: 'rgba(16,185,129,0.12)', color: '#10B981', fontWeight: 700 }}>✓ {rated.filter(r => r >= 3).length} thuộc</span>
            <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 6, background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontWeight: 700 }}>✕ {rated.filter(r => r < 3).length} khó</span>
          </div>
        </div>
        <div style={{ height: 4, borderRadius: 100, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(idx / total) * 100}%`, borderRadius: 100, background: `linear-gradient(90deg, ${t.gold}, ${t.goldDark})`, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* 3D Card */}
      <div className="fc-scene" style={{ height: 300, marginBottom: '1.25rem' }}>
        <div className={`fc-inner${flipped ? ' flipped' : ''}`} onClick={() => setFlipped(f => !f)}>
          {/* Front */}
          <div className="fc-face" style={{ background: t.card, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: `1.5px solid ${flipped ? 'transparent' : `rgba(234,179,8,0.3)`}`, boxShadow: `0 16px 48px ${t.shadow}, 0 2px 0 rgba(255,255,255,0.08) inset`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: `radial-gradient(circle, ${t.goldBg} 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ padding: '0.2rem 0.625rem', borderRadius: 6, background: t.goldBg, marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: t.gold, letterSpacing: '0.06em' }}>{card_.tag} · {card_.pos}</span>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: t.text, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>{card_.word}</div>
            <div style={{ fontSize: '0.9rem', color: t.textMuted, fontStyle: 'italic', marginBottom: '1rem' }}>{card_.phonetic}</div>
            <div style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: 'auto' }}>Nhấn để lật thẻ</div>
          </div>
          {/* Back */}
          <div className="fc-face fc-back" style={{ background: isDark ? 'linear-gradient(160deg, #1a1a22 0%, #22202a 100%)' : 'linear-gradient(160deg, #fffdf7 0%, #fef9ee 100%)', border: `1.5px solid rgba(234,179,8,0.35)`, boxShadow: `0 16px 48px ${t.shadow}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${t.goldBg} 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: t.gold, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Nghĩa</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: t.text, marginBottom: '0.75rem', lineHeight: 1.4 }}>{card_.meaning}</div>
            <div style={{ height: 1, background: `rgba(234,179,8,0.2)`, marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Ví dụ</div>
            <div style={{ fontSize: '0.875rem', color: t.textSub, fontStyle: 'italic', lineHeight: 1.6 }}>{card_.example}</div>
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.62rem', padding: '0.2rem 0.5rem', borderRadius: 6, background: t.goldBg, color: t.gold, fontWeight: 700 }}>{card_.tag}</span>
              <span style={{ fontSize: '0.62rem', padding: '0.2rem 0.5rem', borderRadius: 6, background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)', color: '#8B5CF6', fontWeight: 700 }}>{card_.pos}</span>
              {[1, 2, 3].map(i => <span key={i}>{Icon.star(t.gold, i <= card_.difficulty)}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Hint */}
      {!flipped && (
        <div style={{ textAlign: 'center', marginBottom: '0.875rem' }}>
          <span style={{ fontSize: '0.78rem', color: t.textMuted }}>Bạn có nhớ nghĩa từ này không?</span>
        </div>
      )}

      {/* Rating buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', opacity: flipped ? 1 : 0.35, transition: 'opacity 0.3s', pointerEvents: flipped ? 'auto' : 'none' }}>
        <button className="rate-btn" onClick={() => rate(1)} style={{ background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.3)', color: '#EF4444', boxShadow: '0 4px 16px rgba(239,68,68,0.1)' }}>
          😰 Khó
        </button>
        <button className="rate-btn" onClick={() => rate(3)} style={{ background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`, border: 'none', color: '#fff', boxShadow: `0 6px 20px rgba(234,179,8,0.4)`, flex: 1.4 }}>
          👍 Tốt
        </button>
        <button className="rate-btn" onClick={() => rate(5)} style={{ background: 'rgba(16,185,129,0.12)', border: '1.5px solid rgba(16,185,129,0.3)', color: '#10B981', boxShadow: '0 4px 16px rgba(16,185,129,0.1)' }}>
          😎 Dễ
        </button>
      </div>
    </div>
  )
}

// ─── Mini-games placeholder ───────────────────────────────────────────────────
function GamesScreen({ t, isDark, toggleDark }: { t: Theme; isDark: boolean; toggleDark: () => void }) {
  const games = [
    { emoji: '🔤', name: 'Điền từ vào chỗ trống', desc: 'Hoàn thành câu với từ đúng', tag: 'Ngữ pháp', coming: false },
    { emoji: '🔊', name: 'Nghe và chọn', desc: 'Nghe phát âm, chọn từ đúng', tag: 'Phát âm', coming: false },
    { emoji: '🧩', name: 'Ghép từ đồng nghĩa', desc: 'Nối cặp từ cùng nghĩa', tag: 'Từ vựng', coming: false },
    { emoji: '⚡', name: 'Thử thách tốc độ', desc: 'Dịch 20 từ trong 60 giây', tag: 'Tốc độ', coming: true },
    { emoji: '🤝', name: 'Đấu 1v1 online', desc: 'Thi đấu trực tiếp với người khác', tag: 'Cạnh tranh', coming: true },
    { emoji: '📖', name: 'Câu chuyện tương tác', desc: 'Học từ vựng qua truyện ngắn AI', tag: 'Đọc hiểu', coming: true },
  ]
  return (
    <div className="screen-enter" style={{ maxWidth: 800, width: '100%' }}>
      <Header title="Mini-games" subtitle="Học vui — không nhàm" t={t} isDark={isDark} toggleDark={toggleDark} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {games.map((g, i) => (
          <div key={i} style={{ ...card(t), padding: '1.25rem', cursor: g.coming ? 'default' : 'pointer', opacity: g.coming ? 0.6 : 1, transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { if (!g.coming) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)' } }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
            {g.coming && <div style={{ position: 'absolute', top: 10, right: 10, fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 6, background: t.goldBg, color: t.gold }}>Sắp ra mắt</div>}
            <div style={{ fontSize: '1.75rem', marginBottom: '0.625rem' }}>{g.emoji}</div>
            <div style={{ fontWeight: 700, color: t.text, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{g.name}</div>
            <div style={{ fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.75rem', lineHeight: 1.5 }}>{g.desc}</div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6, background: t.goldBg, color: t.gold }}>{g.tag}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Speaking Coach ───────────────────────────────────────────────────────────
type MicState = 'idle' | 'recording' | 'thinking'
type ChatMsg = { id: number; role: 'ai' | 'user' | 'feedback'; text: string; scores?: { pronunciation: number; fluency: number; vocabulary: number } }

function SpeakingScreen({ t, isDark, toggleDark }: { t: Theme; isDark: boolean; toggleDark: () => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>(CHAT_INIT)
  const [micState, setMicState] = useState<MicState>('idle')
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const toggleMic = () => {
    if (micState === 'idle') {
      setMicState('recording')
      setTimeout(() => {
        setMicState('thinking')
        setTimeout(() => {
          setMicState('idle')
          setMessages(m => [...m,
            { id: Date.now(), role: 'user', text: 'I would like to talk about a journey I took to Da Nang last summer. It was truly a memorable experience...' },
            { id: Date.now() + 1, role: 'feedback', text: 'Tốt lắm! Câu trả lời rõ ràng và có cấu trúc. Hãy sử dụng thêm từ vựng nâng cao và discourse markers.', scores: { pronunciation: 86, fluency: 79, vocabulary: 83 } },
          ])
        }, 2200)
      }, 3000)
    } else if (micState === 'recording') {
      setMicState('thinking')
      setTimeout(() => setMicState('idle'), 2200)
    }
  }

  const sendText = () => {
    if (!input.trim()) return
    setMessages(m => [...m, { id: Date.now(), role: 'user', text: input }])
    setInput('')
    setTimeout(() => {
      setMessages(m => [...m, { id: Date.now(), role: 'ai', text: 'Câu trả lời hay! Để nâng cao hơn, hãy thử dùng: "I vividly recall..." thay vì "I remember..." — mang lại cảm giác sinh động hơn. Bạn muốn thử lại không? 💬' }])
    }, 1200)
  }

  const micLabel = micState === 'idle' ? 'Micro sẵn sàng' : micState === 'recording' ? 'Đang ghi âm…' : 'AI đang phân tích…'
  const micColor = micState === 'idle' ? t.gold : micState === 'recording' ? '#EF4444' : '#8B5CF6'

  return (
    <div className="screen-enter" style={{ maxWidth: 720, width: '100%', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
      <Header title="AI Speaking Coach" subtitle="Luyện nói · Nhận phản hồi tức thì" t={t} isDark={isDark} toggleDark={toggleDark} />

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem', paddingRight: '0.25rem' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'ai' && (
              <div style={{ display: 'flex', gap: '0.625rem', maxWidth: '78%' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${t.gold},${t.goldDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, marginTop: 2 }}>✦</div>
                <div className="bubble-ai" style={{ background: t.msgAiBg, border: `1px solid ${t.msgAiBorder}`, borderRadius: '4px 16px 16px 16px', padding: '0.75rem 1rem', fontSize: '0.875rem', color: t.text, lineHeight: 1.6, boxShadow: `0 2px 12px ${t.shadow}` }}>
                  {msg.text}
                </div>
              </div>
            )}
            {msg.role === 'user' && (
              <div style={{ background: `linear-gradient(135deg, rgba(234,179,8,0.15), rgba(234,179,8,0.08))`, border: `1.5px solid rgba(234,179,8,0.3)`, borderRadius: '16px 4px 16px 16px', padding: '0.75rem 1rem', maxWidth: '72%', fontSize: '0.875rem', color: t.text, lineHeight: 1.6 }}>
                {msg.text}
              </div>
            )}
            {msg.role === 'feedback' && msg.scores && (
              <div style={{ width: '100%' }}>
                <div style={{ ...card(t), padding: '1rem 1.125rem', border: `1px solid rgba(16,185,129,0.25)` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>📊</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phân tích AI</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    {[['Phát âm', msg.scores.pronunciation, t.gold], ['Lưu loát', msg.scores.fluency, '#8B5CF6'], ['Từ vựng', msg.scores.vocabulary, '#10B981']].map(([l, v, c]) => (
                      <div key={l as string} style={{ flex: 1, textAlign: 'center', padding: '0.5rem', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: c as string }}>{v}</div>
                        <div style={{ fontSize: '0.62rem', color: t.textMuted, fontWeight: 500 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: t.textSub, lineHeight: 1.6 }}>{msg.text}</div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {micState === 'thinking' && (
          <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${t.gold},${t.goldDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>✦</div>
            <div className="bubble-ai" style={{ background: t.msgAiBg, border: `1px solid ${t.msgAiBorder}`, borderRadius: '4px 16px 16px 16px', padding: '0.875rem 1.125rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
              <div className="dot" style={{ background: t.textMuted }} />
              <div className="dot" style={{ background: t.textMuted }} />
              <div className="dot" style={{ background: t.textMuted }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Mic status */}
      <div style={{ textAlign: 'center', paddingBottom: '0.625rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.875rem', borderRadius: 100, background: t.goldBg, border: `1px solid ${t.cardBorder}` }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: micColor, transition: 'background 0.3s' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: t.textSub }}>{micLabel}</span>
        </div>
      </div>

      {/* Input footer */}
      <div style={{ ...card(t), padding: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'center', position: 'relative' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendText()}
          placeholder="Nhập câu hoặc hỏi AI Coach…"
          style={{ flex: 1, background: t.inputBg, border: `1.5px solid ${t.inputBorder}`, borderRadius: 12, padding: '0.65rem 1rem', fontFamily: 'inherit', fontSize: '0.875rem', color: t.text, outline: 'none', transition: 'border-color 0.2s' }} />

        <button onClick={sendText} style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: t.goldBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.send(t.gold)}
        </button>

        {/* Mic button */}
        <div style={{ position: 'relative' }}>
          {micState === 'recording' && <>
            <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: `2px solid ${micColor}`, animation: 'mic-ring 1.2s ease-out infinite' }} />
            <div style={{ position: 'absolute', inset: -14, borderRadius: '50%', border: `2px solid ${micColor}`, animation: 'mic-ring2 1.2s ease-out infinite 0.3s' }} />
          </>}
          <button onClick={toggleMic} style={{
            width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: micState === 'idle' ? `linear-gradient(135deg, ${t.gold}, ${t.goldDark})` : micState === 'recording' ? 'linear-gradient(135deg,#EF4444,#DC2626)' : 'linear-gradient(135deg,#8B5CF6,#6D28D9)',
            animation: micState === 'idle' ? 'mic-breathe 2.5s ease-in-out infinite' : 'none',
            transition: 'background 0.3s',
          }}>
            {micState === 'recording' ? <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="2"/></svg> : Icon.mic('#fff')}
          </button>
        </div>
      </div>

      {/* Waveform (recording only) */}
      {micState === 'recording' && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, height: 32, marginTop: '0.5rem' }}>
          {Array.from({ length: 18 }).map((_, i) => {
            const d = [0.55, 0.8, 0.65, 1, 0.7, 0.9, 0.6, 1.1, 0.75, 0.85, 0.65, 1, 0.7, 0.95, 0.6, 0.8, 0.65, 0.9][i]
            return <div key={i} style={{ width: 3, height: 28, borderRadius: 100, background: `linear-gradient(180deg,${t.gold},${t.goldDark})`, transformOrigin: 'center', animation: `wave-bar ${d}s ease-in-out infinite`, animationDelay: `${i * 0.06}s` }} />
          })}
        </div>
      )}
    </div>
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function SettingsScreen({ t, isDark, toggleDark }: { t: Theme; isDark: boolean; toggleDark: () => void }) {
  const [notif, setNotif] = useState(true)
  const [sound, setSound] = useState(true)
  const [goal, setGoal] = useState(20)

  const Toggle = ({ on, setOn }: { on: boolean; setOn: (v: boolean) => void }) => (
    <div onClick={() => setOn(!on)} style={{ width: 44, height: 24, borderRadius: 100, background: on ? t.gold : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'), cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
    </div>
  )

  const Row = ({ label, desc, right }: { label: string; desc?: string; right: React.ReactNode }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: `1px solid ${t.cardBorder}` }}>
      <div>
        <div style={{ fontWeight: 600, color: t.text, fontSize: '0.9rem' }}>{label}</div>
        {desc && <div style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: 2 }}>{desc}</div>}
      </div>
      {right}
    </div>
  )

  return (
    <div className="screen-enter" style={{ maxWidth: 620, width: '100%' }}>
      <Header title="Cài đặt" t={t} isDark={isDark} toggleDark={toggleDark} />

      {/* Profile */}
      <div style={{ ...card(t), padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.875rem' }}>Tài khoản</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>A</div>
          <div>
            <div style={{ fontWeight: 800, color: t.text, fontSize: '1.05rem' }}>Nguyễn Văn An</div>
            <div style={{ fontSize: '0.78rem', color: t.textMuted }}>van.an@gmail.com</div>
            <div style={{ marginTop: 6, display: 'flex', gap: '0.375rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6, background: t.goldBg, color: t.gold }}>Premium ✦</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6, background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>Level 7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div style={{ ...card(t), padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>Tuỳ chọn</div>
        <Row label="Chế độ tối" desc="Giao diện tối cho mắt" right={<Toggle on={isDark} setOn={toggleDark as (v: boolean) => void} />} />
        <Row label="Thông báo nhắc nhở" desc="Nhắc học vào 8:00 sáng mỗi ngày" right={<Toggle on={notif} setOn={setNotif} />} />
        <Row label="Âm thanh" desc="Phát âm từ khi học flashcard" right={<Toggle on={sound} setOn={setSound} />} />
        <Row label="Mục tiêu hàng ngày" desc={`${goal} từ / ngày`} right={
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {[10, 20, 30, 50].map(v => (
              <button key={v} onClick={() => setGoal(v)} style={{ padding: '0.3rem 0.625rem', borderRadius: 8, border: `1.5px solid ${goal === v ? t.gold : t.cardBorder}`, background: goal === v ? t.goldBg : 'transparent', color: goal === v ? t.gold : t.textMuted, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                {v}
              </button>
            ))}
          </div>
        } />
      </div>

      {/* Stats */}
      <div style={{ ...card(t), padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.875rem' }}>Thống kê tổng</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {[['1.284', 'Từ đã thuộc'], ['23', 'Ngày streak'], ['92%', 'Độ chính xác']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center', padding: '0.75rem', borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: t.gold }}>{v}</div>
              <div style={{ fontSize: '0.68rem', color: t.textMuted, fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [isDark, setIsDark] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const t = isDark ? dark : light
  const toggleDark = useCallback(() => setIsDark(d => !d), [])

  const screenProps = { t, isDark, toggleDark }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", display: 'flex', minHeight: '100vh', background: t.bg, color: t.text, transition: 'background 0.3s, color 0.3s' }}>

      {/* Sidebar — desktop only */}
      {!isMobile && (
        <Sidebar screen={screen} setScreen={setScreen} collapsed={collapsed} setCollapsed={setCollapsed} t={t} isDark={isDark} />
      )}

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1.25rem 1rem 80px' : '2rem 2.5rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%' }}>
          {screen === 'dashboard' && <DashboardScreen {...screenProps} setScreen={setScreen} />}
          {screen === 'flashcards' && <FlashcardsScreen {...screenProps} />}
          {screen === 'games' && <GamesScreen {...screenProps} />}
          {screen === 'speaking' && <SpeakingScreen {...screenProps} />}
          {screen === 'settings' && <SettingsScreen {...screenProps} />}
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      {isMobile && <BottomNav screen={screen} setScreen={setScreen} t={t} />}
    </div>
  )
}
