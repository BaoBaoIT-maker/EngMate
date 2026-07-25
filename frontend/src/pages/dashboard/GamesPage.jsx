import React from 'react';
import Header from '../../components/dashboard/Header';
import useThemeStore from '../../store/useThemeStore';

const games = [
  { emoji: '🔤', name: 'Điền từ vào chỗ trống', desc: 'Hoàn thành câu với từ đúng', tag: 'Ngữ pháp', coming: false },
  { emoji: '🔊', name: 'Nghe và chọn', desc: 'Nghe phát âm, chọn từ đúng', tag: 'Phát âm', coming: false },
  { emoji: '🧩', name: 'Ghép từ đồng nghĩa', desc: 'Nối cặp từ cùng nghĩa', tag: 'Từ vựng', coming: false },
  { emoji: '⚡', name: 'Thử thách tốc độ', desc: 'Dịch 20 từ trong 60 giây', tag: 'Tốc độ', coming: true },
  { emoji: '🤝', name: 'Đấu 1v1 online', desc: 'Thi đấu trực tiếp với người khác', tag: 'Cạnh tranh', coming: true },
  { emoji: '📖', name: 'Câu chuyện tương tác', desc: 'Học từ vựng qua truyện ngắn AI', tag: 'Đọc hiểu', coming: true },
];

const card = (t, extra) => ({
  background: t.card,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${t.cardBorder}`,
  borderRadius: 16,
  boxShadow: `0 4px 24px ${t.shadow}`,
  ...extra,
});

export default function GamesPage() {
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();

  return (
    <div className="screen-enter w-full max-w-7xl mx-auto">
      <Header title="Mini-games" subtitle="Học vui — không nhàm" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {games.map((g, i) => (
          <div key={i} style={{ ...card(t), padding: '1.25rem', cursor: g.coming ? 'default' : 'pointer', opacity: g.coming ? 0.6 : 1, transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { if (!g.coming) { e.currentTarget.style.transform = 'translateY(-3px)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            {g.coming && <div style={{ position: 'absolute', top: 10, right: 10, fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 6, background: t.goldBg, color: t.gold }}>Sắp ra mắt</div>}
            <div style={{ fontSize: '1.75rem', marginBottom: '0.625rem' }}>{g.emoji}</div>
            <div style={{ fontWeight: 700, color: t.text, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{g.name}</div>
            <div style={{ fontSize: '0.75rem', color: t.textMuted, marginBottom: '0.75rem', lineHeight: 1.5 }}>{g.desc}</div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6, background: t.goldBg, color: t.gold }}>{g.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
