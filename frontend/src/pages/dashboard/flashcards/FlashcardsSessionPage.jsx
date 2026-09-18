import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/dashboard/Header';
import useThemeStore from '../../../store/useThemeStore';
import { Icon } from '../../../components/icons';
import { getSessionCards, reviewCard } from '../../../services/flashcardService';

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
  const [isRating, setIsRating] = useState(false);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const data = await getSessionCards({ type, topicId, course, mode });
      setCards(data || []);
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
    if (isRating) return;
    setIsRating(true);
    const currentCard = cards[idx];
    
    // Ghi nhận UI liền mạch
    setRated(prev => [...prev, quality]);
    setFlipped(false);
    
    // Gọi API nền
    try {
      await reviewCard(currentCard.id, quality);
    } catch (err) {
      console.error("Lỗi lưu kết quả", err);
    }

    setTimeout(() => {
      setIdx(i => i + 1);
      setIsRating(false);
    }, 200);
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
          <button onClick={() => navigate('/dashboard/flashcards')} style={{ padding: '0.8rem 2.2rem', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${t.green}, ${t.greenDark})`, color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: isDark ? '0 4px 16px rgba(16,185,129,0.3)' : '0 4px 16px rgba(0,102,51,0.25)' }}>
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
          <div style={{ color: t.textSub, marginBottom: '1.5rem' }}>Bạn đã ôn tập xong {total} thẻ hôm nay. +{total * 10} XP nhận được!</div>
          <button onClick={() => navigate('/dashboard/flashcards')} style={{ padding: '0.8rem 2.2rem', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${t.green}, ${t.greenDark})`, color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: isDark ? '0 4px 16px rgba(16,185,129,0.3)' : '0 4px 16px rgba(0,102,51,0.25)' }}>
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
        <div style={{ height: 6, borderRadius: 100, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(idx / total) * 100}%`, borderRadius: 100, background: `linear-gradient(90deg, #10B981, #059669)`, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* 3D Card */}
      <div className="fc-scene" style={{ height: 330, marginBottom: '1.5rem', position: 'relative' }}>
        <div className={`fc-inner${flipped ? ' flipped' : ''}`}>
          {/* Front */}
          <div 
            className="fc-face" 
            onClick={() => setFlipped(true)}
            style={{ 
              background: t.card, 
              backdropFilter: 'blur(20px)', 
              border: `1.5px solid ${isDark ? 'rgba(16,185,129,0.3)' : 'rgba(0,102,51,0.2)'}`, 
              boxShadow: `0 16px 48px ${t.shadow}`, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '2.5rem 2rem', 
              textAlign: 'center', 
              overflow: 'hidden', 
              cursor: 'pointer',
              borderRadius: 20
            }}
          >

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); playAudio(card_.word); }}
                style={{ background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(0,102,51,0.08)', border: `1px solid ${isDark ? 'rgba(16,185,129,0.3)' : 'rgba(0,102,51,0.2)'}`, borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.green, fontSize: '1.2rem' }}
              >
                🔊
              </button>
            </div>

            <div style={{ padding: '0.25rem 0.75rem', borderRadius: 8, background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(0,102,51,0.08)', border: `1px solid ${isDark ? 'rgba(16,185,129,0.3)' : 'rgba(0,102,51,0.15)'}`, marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? '#34D399' : t.green, letterSpacing: '0.06em' }}>{card_.category} {card_.type ? `· ${card_.type}` : ''}</span>
            </div>
            
            <div style={{ fontSize: '2.75rem', fontWeight: 800, color: t.text, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>{card_.word}</div>
            {card_.phonetic && <div style={{ fontSize: '1.05rem', color: t.textMuted, fontStyle: 'italic', marginBottom: '1rem' }}>{card_.phonetic}</div>}
            
            <div style={{ fontSize: '0.8rem', color: t.textMuted, marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>👆</span> Nhấn vào thẻ để xem nghĩa
            </div>
          </div>

          {/* Back */}
          <div 
            className="fc-face fc-back" 
            onClick={() => setFlipped(false)}
            style={{ 
              background: isDark ? 'linear-gradient(160deg, #121F16 0%, #0E1811 100%)' : 'linear-gradient(160deg, #FFFFFF 0%, #F4F8F5 100%)', 
              border: `1.5px solid ${isDark ? 'rgba(16,185,129,0.35)' : 'rgba(0,102,51,0.25)'}`, 
              boxShadow: `0 16px 48px ${t.shadow}`, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              padding: '2rem', 
              overflow: 'hidden', 
              cursor: 'pointer',
              borderRadius: 20
            }}
          >

            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: isDark ? '#34D399' : t.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Nghĩa Tiếng Việt</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: t.text, marginBottom: '0.75rem', lineHeight: 1.4 }}>{card_.vietnameseMeaning}</div>
            
            {card_.definitionText && (
              <div style={{ fontSize: '0.92rem', color: t.textSub, marginBottom: '1rem', lineHeight: 1.5 }}>
                {card_.definitionText}
              </div>
            )}

            <div style={{ height: 1, background: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(0,102,51,0.12)', marginBottom: '1rem' }} />
            
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Ví dụ</div>
            <div style={{ fontSize: '0.92rem', color: t.text, fontStyle: 'italic', lineHeight: 1.6 }}>&ldquo;{firstExample}&rdquo;</div>
            
            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: 6, background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(0,102,51,0.08)', color: isDark ? '#34D399' : t.green, fontWeight: 700 }}>Box {card_.progress?.boxLevel || 1}</span>
              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: 6, background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)', color: '#A78BFA', fontWeight: 700 }}>Interval: {card_.progress?.interval || 0}d</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="rate-btn" onClick={() => rate(1)} disabled={isRating} style={{ background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.3)', color: '#EF4444', boxShadow: '0 4px 16px rgba(239,68,68,0.12)', flex: 1, padding: '1rem 0', borderRadius: 14, fontWeight: 700, cursor: isRating ? 'not-allowed' : 'pointer', opacity: isRating ? 0.6 : 1, fontSize: '0.95rem' }}>
          😰 Khó
        </button>
        <button className="rate-btn" onClick={() => rate(4)} disabled={isRating} style={{ background: `linear-gradient(135deg, ${t.green}, ${t.greenDark})`, border: 'none', color: '#fff', boxShadow: `0 6px 20px ${isDark ? 'rgba(16,185,129,0.35)' : 'rgba(0,102,51,0.3)'}`, flex: 1.5, padding: '1rem 0', borderRadius: 14, fontWeight: 700, cursor: isRating ? 'not-allowed' : 'pointer', opacity: isRating ? 0.6 : 1, fontSize: '1rem' }}>
          👍 Tốt
        </button>
        <button className="rate-btn" onClick={() => rate(5)} disabled={isRating} style={{ background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(0,102,51,0.1)', border: `1.5px solid ${isDark ? 'rgba(16,185,129,0.35)' : 'rgba(0,102,51,0.25)'}`, color: isDark ? '#34D399' : t.green, boxShadow: '0 4px 16px rgba(16,185,129,0.15)', flex: 1, padding: '1rem 0', borderRadius: 14, fontWeight: 700, cursor: isRating ? 'not-allowed' : 'pointer', opacity: isRating ? 0.6 : 1, fontSize: '0.95rem' }}>
          😎 Dễ
        </button>
      </div>
    </div>
  );
}
