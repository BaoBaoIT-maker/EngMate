import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useThemeStore from '../../store/useThemeStore';
import api from '../../services/api';

const cardStyle = (t) => ({
  background: t.card,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${t.cardBorder}`,
  borderRadius: 12,
  boxShadow: `0 4px 12px ${t.shadow}`,
  padding: '1rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  fontWeight: 600,
  fontSize: '0.9rem',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  userSelect: 'none',
});

export default function MatchingGame() {
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enCards, setEnCards] = useState([]);
  const [viCards, setViCards] = useState([]);
  const [totalCards, setTotalCards] = useState(0);
  
  const [selectedEn, setSelectedEn] = useState(null);
  const [selectedVi, setSelectedVi] = useState(null);
  
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [wrongIds, setWrongIds] = useState({ en: null, vi: null });
  
  // Stats for submit
  const [mistakes, setMistakes] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Interceptor trả về response.data, nên data nằm ở res.data
      const res = await api.get('/games/matching/data?limit=10');
      const { englishCards, vietnameseCards, totalCards: total } = res.data;
      
      if (!englishCards || englishCards.length === 0) {
        setError('Bạn chưa có từ vựng nào. Hãy học Flashcard trước nhé!');
        setLoading(false);
        return;
      }
      
      setEnCards(englishCards);
      setViCards(vietnameseCards);
      setTotalCards(total || englishCards.length);
      setLoading(false);
    } catch (err) {
      console.error('fetchData error:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEn && selectedVi) {
      handleMatch(selectedEn, selectedVi);
    }
  }, [selectedEn, selectedVi]);

  const handleMatch = (enId, viId) => {
    if (enId === viId) {
      setMatchedIds(prev => new Set(prev).add(enId));
      setSelectedEn(null);
      setSelectedVi(null);
    } else {
      // Match wrong
      setMistakes(prev => ({ ...prev, [enId]: true }));
      setWrongIds({ en: enId, vi: viId });
      
      setTimeout(() => {
        setWrongIds({ en: null, vi: null });
        setSelectedEn(null);
        setSelectedVi(null);
      }, 500);
    }
  };
  useEffect(() => {
    if (enCards.length > 0 && matchedIds.size === enCards.length && !isFinished) {
      setTimeout(() => handleFinishGame(matchedIds), 300);
    }
  }, [matchedIds.size, enCards.length, isFinished]);

  const handleFinishGame = async (finalMatchedIds) => {
    setIsFinished(true);
    
    // Prepare results — dùng mistakes state (đã đủ tại thời điểm này)
    const results = enCards.map(c => ({
      flashcardId: c.id,
      isCorrect: !mistakes[c.id]
    }));

    try {
      // Interceptor trả về response.data, nên submit result nằm ở res.data
      const res = await api.post('/games/submit', { results });
      setResultData(res.data);
    } catch (err) {
      console.error('Failed to submit game result', err);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: t.text, background: t.bg }}>
        <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }}>🧩</div>
        <div>Đang tải dữ liệu game...</div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem', color: t.text, background: t.bg, padding: '2rem' }}>
        <div style={{ fontSize: '3rem' }}>😔</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{error}</div>
        <button onClick={() => navigate('/dashboard/games')} style={{ padding: '0.75rem 2rem', borderRadius: 12, border: 'none', background: t.goldBg, color: t.gold, fontWeight: 700, cursor: 'pointer' }}>
          Quay lại
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, color: t.text, display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '1rem', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 24, padding: '2.5rem 2rem', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: `0 20px 40px ${t.shadow}` }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: t.text }}>Tuyệt vời!</h2>
          <p style={{ color: t.textMuted, fontSize: '0.9rem', marginBottom: '2rem' }}>Bạn đã hoàn thành bài tập Nối từ.</p>
          
          {resultData ? (
            <div style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)', borderRadius: 16, padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: t.textSub, fontSize: '0.85rem' }}>Độ chính xác</span>
                <span style={{ fontWeight: 700, color: t.text }}>{resultData.correctCount} / {resultData.totalPlayed}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: t.textSub, fontSize: '0.85rem' }}>Điểm kinh nghiệm nhận được</span>
                <span style={{ fontWeight: 800, color: t.gold }}>+{resultData.totalXP} XP</span>
              </div>
            </div>
          ) : (
             <div style={{ padding: '1rem' }}>Đang lưu kết quả...</div>
          )}
          
          <button onClick={() => navigate('/dashboard/games')} style={{ width: '100%', padding: '0.875rem', borderRadius: 12, border: 'none', background: t.goldBg, color: t.gold, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
            Quay lại Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${t.sidebarBorder}` }}>
        <button onClick={() => navigate('/dashboard/games')} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          Thoát
        </button>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Nối từ (Matching)</div>
        <div style={{ width: 60 }}>{/* Placeholder for centering */}</div>
      </div>

      <div style={{ flex: 1, padding: '2rem', display: 'flex', gap: '2rem', maxWidth: 900, width: '100%', margin: '0 auto' }}>
        
        {/* English Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {enCards.map(c => {
            const isMatched = matchedIds.has(c.id);
            const isSelected = selectedEn === c.id;
            const isWrong = wrongIds.en === c.id;
            
            return (
              <div key={`en-${c.id}`} 
                onClick={() => !isMatched && !isSelected && setSelectedEn(c.id)}
                style={{
                  ...cardStyle(t),
                  opacity: isMatched ? 0 : 1,
                  pointerEvents: isMatched ? 'none' : 'auto',
                  background: isSelected ? t.goldBg : t.card,
                  borderColor: isSelected ? t.gold : isWrong ? '#EF4444' : t.cardBorder,
                  transform: isWrong ? 'translateX(5px)' : isSelected ? 'scale(1.02)' : 'none',
                  animation: isWrong ? 'shake 0.4s ease-in-out' : 'none'
                }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1.05rem', color: isSelected ? t.gold : t.text }}>{c.text}</span>
                  {c.phonetic && <span style={{ fontSize: '0.7rem', color: t.textMuted, marginTop: '2px', fontWeight: 400 }}>{c.phonetic}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Vietnamese Column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {viCards.map(c => {
            const isMatched = matchedIds.has(c.id);
            const isSelected = selectedVi === c.id;
            const isWrong = wrongIds.vi === c.id;
            
            return (
              <div key={`vi-${c.id}`} 
                onClick={() => !isMatched && !isSelected && setSelectedVi(c.id)}
                style={{
                  ...cardStyle(t),
                  opacity: isMatched ? 0 : 1,
                  pointerEvents: isMatched ? 'none' : 'auto',
                  background: isSelected ? 'rgba(56, 189, 248, 0.1)' : t.card,
                  borderColor: isSelected ? '#38BDF8' : isWrong ? '#EF4444' : t.cardBorder,
                  transform: isWrong ? 'translateX(-5px)' : isSelected ? 'scale(1.02)' : 'none',
                  animation: isWrong ? 'shake 0.4s ease-in-out' : 'none'
                }}>
                <span style={{ fontSize: '1.05rem', color: isSelected ? '#38BDF8' : t.text }}>{c.text}</span>
              </div>
            );
          })}
        </div>

      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
      `}</style>
    </div>
  );
}
