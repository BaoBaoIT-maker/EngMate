import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/dashboard/Header';
import useThemeStore from '../../store/useThemeStore';
import { Icon } from '../../components/icons';
import api from '../../services/api';

const card = (t, extra) => ({
  background: t.card,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${t.cardBorder}`,
  borderRadius: 16,
  boxShadow: `0 4px 24px ${t.shadow}`,
  ...extra,
});

export default function FlashcardsSessionPage() {
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const type = searchParams.get('type') || 'custom';
  const topicId = searchParams.get('topicId');
  const course = searchParams.get('course');
  const mode = searchParams.get('mode');

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [rated, setRated] = useState([]);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      setLoading(true);
      let url = `/flashcards/session?type=${type}`;
      if (topicId) url += `&topicId=${topicId}`;
      if (course) url += `&course=${course}`;
      if (mode) url += `&mode=${mode}`;
      const res = await api.get(url);
      setCards(res.data || []);
    } catch (err) {
      alert("Lỗi tải bài học: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const rate = async (quality) => {
    const currentCard = cards[idx];
    
    // Ghi nhận UI liền mạch
    setRated(prev => [...prev, quality]);
    setFlipped(false);
    
    // Gọi API nền
    try {
      await api.post(`/flashcards/${currentCard.id}/review`, { quality });
    } catch (err) {
      console.error("Lỗi lưu kết quả", err);
    }

    setTimeout(() => setIdx(i => i + 1), 200);
  };

  if (loading) {
    return <div className="screen-enter w-full max-w-4xl mx-auto"><Header title="Đang tải dữ liệu..." /></div>;
  }

  const total = cards.length;

  if (total === 0) {
    return (
      <div className="screen-enter w-full max-w-4xl mx-auto">
        <Header title="Flashcards" onBack={() => navigate('/dashboard/flashcards')} />
        <div style={{ ...card(t), padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: t.text, marginBottom: '0.5rem' }}>Tuyệt vời!</div>
          <div style={{ color: t.textMuted, marginBottom: '1.5rem' }}>Bạn đã ôn tập xong tất cả các từ vựng cho chủ đề này hôm nay.</div>
          <button onClick={() => navigate('/dashboard/flashcards')} style={{ padding: '0.75rem 2rem', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            Quay lại Danh sách
          </button>
        </div>
      </div>
    );
  }

  if (idx >= total) {
    return (
      <div className="screen-enter w-full max-w-4xl mx-auto">
        <Header title="Flashcards" onBack={() => navigate('/dashboard/flashcards')} />
        <div style={{ ...card(t), padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: t.text, marginBottom: '0.5rem' }}>Hoàn thành xuất sắc!</div>
          <div style={{ color: t.textMuted, marginBottom: '1.5rem' }}>Bạn đã ôn tập xong {total} thẻ hôm nay. +{total * 10} XP nhận được!</div>
          <button onClick={() => navigate('/dashboard/flashcards')} style={{ padding: '0.75rem 2rem', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            Hoàn tất
          </button>
        </div>
      </div>
    );
  }

  const card_ = cards[idx];
  // Parse exampleJson if it's a string, else use as array
  let parsedExamples = [];
  try {
    if (typeof card_.exampleJson === 'string') {
      parsedExamples = JSON.parse(card_.exampleJson);
    } else if (Array.isArray(card_.exampleJson)) {
      parsedExamples = card_.exampleJson;
    }
  } catch (e) {
    console.error(e);
  }
  const firstExample = parsedExamples[0] || '';

  return (
    <div className="screen-enter w-full max-w-4xl mx-auto pb-10">
      <Header title="Flashcards" subtitle="SM-2 Spaced Repetition · Ôn từ thông minh" onBack={() => navigate('/dashboard/flashcards')} />

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
      <div className="fc-scene" style={{ height: 320, marginBottom: '1.25rem', position: 'relative' }}>
        <div className={`fc-inner${flipped ? ' flipped' : ''}`}>
          {/* Front */}
          <div 
            className="fc-face" 
            onClick={() => setFlipped(true)}
            style={{ background: t.card, backdropFilter: 'blur(20px)', border: `1.5px solid ${flipped ? 'transparent' : `rgba(234,179,8,0.3)`}`, boxShadow: `0 16px 48px ${t.shadow}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', overflow: 'hidden', cursor: 'pointer' }}
          >

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); playAudio(card_.word); }}
                style={{ background: 'transparent', border: `1px solid ${t.cardBorder}`, borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.text }}
              >
                🔊
              </button>
            </div>

            <div style={{ padding: '0.2rem 0.625rem', borderRadius: 6, background: t.goldBg, marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: t.gold, letterSpacing: '0.06em' }}>{card_.category} {card_.type ? `· ${card_.type}` : ''}</span>
            </div>
            
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: t.text, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>{card_.word}</div>
            {card_.phonetic && <div style={{ fontSize: '1rem', color: t.textMuted, fontStyle: 'italic', marginBottom: '1rem' }}>{card_.phonetic}</div>}
            
            <div style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: 'auto' }}>Nhấn vào thẻ để lật</div>
          </div>

          {/* Back */}
          <div 
            className="fc-face fc-back" 
            onClick={() => setFlipped(false)}
            style={{ background: isDark ? 'linear-gradient(160deg, #1a1a22 0%, #22202a 100%)' : 'linear-gradient(160deg, #fffdf7 0%, #fef9ee 100%)', border: `1.5px solid rgba(234,179,8,0.35)`, boxShadow: `0 16px 48px ${t.shadow}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1.75rem', overflow: 'hidden', cursor: 'pointer' }}
          >

            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: t.gold, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Nghĩa Tiếng Việt</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: t.text, marginBottom: '0.5rem', lineHeight: 1.4 }}>{card_.vietnameseMeaning}</div>
            
            {card_.definitionText && (
              <div style={{ fontSize: '0.9rem', color: t.textMuted, marginBottom: '1rem', lineHeight: 1.5 }}>
                {card_.definitionText}
              </div>
            )}

            <div style={{ height: 1, background: `rgba(234,179,8,0.2)`, marginBottom: '1rem' }} />
            
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ví dụ</div>
            <div style={{ fontSize: '0.9rem', color: t.textSub, fontStyle: 'italic', lineHeight: 1.6 }}>{firstExample}</div>
            
            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 6, background: t.goldBg, color: t.gold, fontWeight: 700 }}>Box {card_.progress?.boxLevel || 1}</span>
              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 6, background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)', color: '#8B5CF6', fontWeight: 700 }}>Interval: {card_.progress?.interval || 0}d</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="rate-btn" onClick={() => rate(1)} style={{ background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.3)', color: '#EF4444', boxShadow: '0 4px 16px rgba(239,68,68,0.1)', flex: 1, padding: '1rem 0', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>
          😰 Khó
        </button>
        <button className="rate-btn" onClick={() => rate(4)} style={{ background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`, border: 'none', color: '#fff', boxShadow: `0 6px 20px rgba(234,179,8,0.4)`, flex: 1.5, padding: '1rem 0', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>
          👍 Tốt
        </button>
        <button className="rate-btn" onClick={() => rate(5)} style={{ background: 'rgba(16,185,129,0.12)', border: '1.5px solid rgba(16,185,129,0.3)', color: '#10B981', boxShadow: '0 4px 16px rgba(16,185,129,0.1)', flex: 1, padding: '1rem 0', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>
          😎 Dễ
        </button>
      </div>
    </div>
  );
}
