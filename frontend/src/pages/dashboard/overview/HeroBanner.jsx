import React, { useState } from 'react';

function StarSvg({ size = 16, color = 'white' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M7 0L8.2 5.8L14 7L8.2 8.2L7 14L5.8 8.2L0 7L5.8 5.8L7 0Z" fill={color} />
    </svg>
  );
}

function FlameIcon({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1C7 1 10.5 4.5 10.5 7.5C10.5 9.43 8.93 11 7 11C5.07 11 3.5 9.43 3.5 7.5C3.5 6.5 4 5.5 4 5.5C4 5.5 4.5 7 5.5 7C5.5 5.5 6 3 7 1Z"
        fill={color}
      />
    </svg>
  );
}

function TrophyIcon({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M3 2h9v5a4.5 4.5 0 0 1-9 0V2z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M1.5 3.5H3M12 3.5h1.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M7.5 11.5v2M5 13.5h5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BoltIcon({ color }) {
  return (
    <svg width="14" height="15" viewBox="0 0 14 15" fill="none">
      <path
        d="M8.5 1.5L3 8.5h4L5.5 13.5l6-7H8L8.5 1.5z"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookIcon({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2 2.5h5a2 2 0 0 1 2 2v8a2 2 0 0 0-2-2H2V2.5z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M13 2.5H8a2 2 0 0 0-2 2v8a2 2 0 0 1 2-2h5V2.5z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function HeroStat({ icon, value, label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px' }}>
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '10px',
          background: color === 'var(--fg-2)' ? 'rgba(107,96,71,0.10)' : `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon === 'flame' && <FlameIcon color={color} />}
        {icon === 'trophy' && <TrophyIcon color={color} />}
        {icon === 'bolt' && <BoltIcon color={color} />}
        {icon === 'book' && <BookIcon color="#9D8E6F" />}
      </div>
      <div>
        <div style={{ fontSize: '17px', fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--fg-3)', marginTop: '2px', fontWeight: 500 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export default function HeroBanner({ user, stats, navigate }) {
  const [hover, setHover] = useState(false);

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  const displayName = user?.name || user?.profile?.username || user?.email?.split('@')[0] || 'bạn';

  const needReview = stats?.memory?.needReview || 0;
  const learning = stats?.memory?.learning || 0;
  const mastered = stats?.memory?.mastered || 0;
  const totalWords = needReview + learning + mastered;
  const dueWords = needReview > 0 ? needReview : (stats?.dailyGoal?.target || 15);

  const currentStreak = stats?.streak?.current || 0;
  const longestStreak = stats?.streak?.max || currentStreak;
  const totalExp = (stats?.totalExp || 0).toLocaleString();

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1.5px solid var(--card-border)',
        borderRadius: '24px',
        boxShadow: 'var(--card-shadow)',
        padding: '32px 36px',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Top card highlight line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'var(--card-highlight)',
          pointerEvents: 'none',
        }}
      />

      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240,180,41,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top row: Greeting + CTA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #F5BE36 0%, #D4960A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(240,180,41,0.35)',
              }}
            >
              <StarSvg size={16} color="white" />
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--fg)',
                lineHeight: 1.1,
              }}
            >
              {timeGreeting}, <span style={{ color: '#F0B429' }}>{displayName}!</span>
            </h2>
          </div>
          <p
            style={{
              margin: 0,
              color: 'var(--fg-2)',
              fontSize: '15px',
              lineHeight: 1.6,
              maxWidth: '520px',
            }}
          >
            Hôm nay bạn có <strong style={{ color: 'var(--fg)' }}>{dueWords} từ vựng</strong> cần kích hoạt trí nhớ dài hạn — sẵn sàng chinh phục chưa?
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/dashboard/flashcards')}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            padding: '13px 26px',
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #F5BE36 0%, #D4960A 100%)',
            color: '#1C1407',
            fontWeight: 800,
            fontSize: '13.5px',
            letterSpacing: '0.06em',
            fontFamily: 'inherit',
            boxShadow: hover ? '0 8px 28px rgba(240,180,41,0.50)' : '0 4px 16px rgba(240,180,41,0.32)',
            transform: hover ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            outline: 'none',
          }}
        >
          Bắt đầu học ngay
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M3 7.5h9M8.5 3.5l4 4-4 4"
              stroke="#1C1407"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Bottom row: Stats strip */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          paddingTop: '20px',
          borderTop: '1px solid var(--card-border)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <HeroStat icon="flame" value={`${currentStreak} ngày`} label="Chuỗi hiện tại" color="#F0B429" />
        <div style={{ width: '1px', background: 'var(--card-border)', alignSelf: 'stretch' }} />
        <HeroStat icon="trophy" value={`${longestStreak} ngày`} label="Chuỗi dài nhất" color="#10B981" />
        <div style={{ width: '1px', background: 'var(--card-border)', alignSelf: 'stretch' }} />
        <HeroStat icon="bolt" value={`${totalExp} XP`} label="Điểm tích lũy" color="#8B5CF6" />
        <div style={{ width: '1px', background: 'var(--card-border)', alignSelf: 'stretch' }} />
        <HeroStat icon="book" value={`${totalWords} từ`} label="Kho từ vựng" color="var(--fg-2)" />
      </div>
    </div>
  );
}
