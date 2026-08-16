import React, { useState, useEffect } from 'react';
import Header from '../../components/dashboard/Header';
import useThemeStore from '../../store/useThemeStore';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const STATIC_GAMES_META = [
  { gameType: 'MATCHING', link: '/dashboard/games/matching', emoji: '🧩', desc: 'Tìm cặp từ tiếng Anh - Việt tương ứng', tag: 'Từ vựng' },
  { gameType: 'FILL_BLANK', link: '/dashboard/games/fill-blank', emoji: '🔤', desc: 'Hoàn thành câu với từ đúng', tag: 'Ngữ pháp' },
  { gameType: 'SPEAKING_GAME', link: '/dashboard/speaking', emoji: '🎙️', desc: 'Luyện hội thoại thực tế với AI', tag: 'Hội thoại' },
  // Các game giả lập "Sắp ra mắt" nếu không có trong DB
  { gameType: 'SPEED_RUN', emoji: '⚡', name: 'Thử thách tốc độ', desc: 'Dịch 20 từ trong 60 giây', tag: 'Tốc độ', coming: true },
  { gameType: 'BATTLE_1V1', emoji: '🤝', name: 'Đấu 1v1 online', desc: 'Thi đấu trực tiếp với người khác', tag: 'Cạnh tranh', coming: true },
  { gameType: 'STORY', emoji: '📖', name: 'Câu chuyện tương tác', desc: 'Học từ vựng qua truyện ngắn AI', tag: 'Đọc hiểu', coming: true },
];

const cardStyle = (t, extra) => ({
  background: t.card,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${t.cardBorder}`,
  borderRadius: 16,
  boxShadow: `0 4px 24px ${t.shadow}`,
  ...extra,
});

// ─── Skeleton primitive ──────────────────────────────────────────────
function Sk({ w = '100%', h = 16, r = 8, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, var(--sk-from) 25%, var(--sk-to) 50%, var(--sk-from) 75%)',
      backgroundSize: '200% 100%',
      animation: 'sk-shimmer 1.6s ease-in-out infinite',
      flexShrink: 0,
      ...style,
    }} />
  );
}

function GamesSkeleton({ t, isDark }) {
  const skFrom = isDark ? 'rgba(47,158,86,0.08)' : '#F0EAD9';
  const skTo   = isDark ? 'rgba(47,158,86,0.18)' : '#E5DBCA';

  return (
    <div style={{ '--sk-from': skFrom, '--sk-to': skTo, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ ...cardStyle(t), padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', animationDelay: `${i * 0.08}s` }}>
          <Sk w={32} h={32} r={8} />
          <Sk w="60%" h={16} r={6} style={{ marginTop: '0.25rem' }} />
          <div>
            <Sk w="90%" h={12} r={4} style={{ marginBottom: '0.35rem' }} />
            <Sk w="70%" h={12} r={4} />
          </div>
          <Sk w={60} h={18} r={6} style={{ marginTop: '0.5rem' }} />
        </div>
      ))}
      <style>{`
        @keyframes sk-shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
}

export default function GamesPage() {
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();
  const navigate = useNavigate();
  
  const [games, setGames] = useState(STATIC_GAMES_META.filter(g => g.coming)); // Mặc định hiển thị các game coming soon
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/games/configs')
      .then(res => {
        const dbConfigs = res.data?.data || res.data || [];
        
        // Map data từ DB với Meta tĩnh
        const activeGames = dbConfigs.map(dbGame => {
          const meta = STATIC_GAMES_META.find(m => m.gameType === dbGame.gameType) || {};
          return {
            ...meta,
            gameType: dbGame.gameType,
            name: dbGame.label,
            coming: !dbGame.isEnabled, // Nếu disable thì cho thành coming soon
          };
        });

        // Giữ lại các game chỉ có trong tĩnh (chưa có trong DB) là coming soon
        const staticOnly = STATIC_GAMES_META.filter(m => m.coming && !dbConfigs.some(d => d.gameType === m.gameType));

        setGames([...activeGames, ...staticOnly]);
      })
      .catch(err => console.error('Lỗi tải danh sách game:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="screen-enter w-full max-w-7xl mx-auto">
      <Header title="Mini-games" subtitle="Học vui — không nhàm" />
      
      {loading ? (
        <GamesSkeleton t={t} isDark={isDark} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {games.map((g, i) => (
            <div key={i} 
              onClick={() => {
                if (!g.coming && g.link) navigate(g.link);
              }}
              style={{ 
                ...cardStyle(t), 
                padding: '1.25rem', 
                cursor: g.coming ? 'default' : 'pointer', 
                opacity: g.coming ? 0.6 : 1, 
                transition: 'transform 0.2s, box-shadow 0.2s', 
                position: 'relative', 
                overflow: 'hidden' 
              }}
              onMouseEnter={e => { if (!g.coming) { e.currentTarget.style.transform = 'translateY(-3px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              
              {g.coming && (
                <div style={{ position: 'absolute', top: 10, right: 10, fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 6, background: t.goldBg, color: t.gold }}>
                  Sắp ra mắt
                </div>
              )}
              
              <div style={{ fontSize: '1.75rem', marginBottom: '0.625rem' }}>{g.emoji || '🎮'}</div>
              <div style={{ fontWeight: 700, color: t.text, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{g.name || g.gameType}</div>
              <div style={{ fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.75rem', lineHeight: 1.5 }}>{g.desc || 'Trải nghiệm học tập thú vị'}</div>
              
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6, background: t.goldBg, color: t.gold }}>
                {g.tag || 'Mini-game'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
