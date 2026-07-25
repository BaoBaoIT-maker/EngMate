import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useThemeStore from '../../store/useThemeStore';
import api from '../../services/api';

export default function FillBlankGame() {
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);       // từ user vừa chọn
  const [answered, setAnswered] = useState(false);      // đã trả lời chưa
  const [isCorrect, setIsCorrect] = useState(null);

  // Timer
  const [elapsed, setElapsed] = useState(0);            // giây đã trôi qua cho câu hiện tại
  const [totalElapsed, setTotalElapsed] = useState(0);  // tổng thời gian cả game
  const timerRef = useRef(null);

  // Kết quả tích lũy
  const [results, setResults] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Timer đếm lên cho từng câu
  useEffect(() => {
    if (!loading && !isFinished && !answered) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
        setTotalElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [loading, isFinished, answered, currentIdx]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/games/fill-blank/data?limit=10');
      const { questions: qs } = res.data;
      if (!qs || qs.length === 0) {
        setError('Bạn chưa có từ vựng nào. Hãy học Flashcard trước nhé!');
        setLoading(false);
        return;
      }
      setQuestions(qs);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const handleSelect = (option) => {
    if (answered) return;
    clearInterval(timerRef.current);

    const q = questions[currentIdx];
    const correct = option.toLowerCase() === q.answer.toLowerCase();
    setSelected(option);
    setAnswered(true);
    setIsCorrect(correct);

    // Tích lũy kết quả
    setResults(prev => [...prev, {
      flashcardId: q.flashcardId,
      isCorrect: correct,
      timeTaken: elapsed
    }]);

    // Tự động qua câu tiếp sau 1.5s
    setTimeout(() => nextQuestion(), 1500);
  };

  const handleSkip = () => {
    if (answered) return;
    clearInterval(timerRef.current);
    const q = questions[currentIdx];
    setResults(prev => [...prev, {
      flashcardId: q.flashcardId,
      isCorrect: false,
      timeTaken: elapsed
    }]);
    setAnswered(true);
    setIsCorrect(false);
    setSelected('__skip__');
    setTimeout(() => nextQuestion(), 1500);
  };

  const nextQuestion = () => {
    const next = currentIdx + 1;
    if (next >= questions.length) {
      finishGame();
    } else {
      setCurrentIdx(next);
      setSelected(null);
      setAnswered(false);
      setIsCorrect(null);
      setElapsed(0);
    }
  };

  const finishGame = async () => {
    setIsFinished(true);
    try {
      const res = await api.post('/games/submit', {
        gameType: 'FILL_BLANK',
        results
      });
      setFinalResult(res.data);
    } catch (err) {
      console.error('Submit failed:', err);
    }
  };

  // ─── XP badge color theo thời gian ─────────────────────────────────────────
  const getXPColor = (timeTaken) => {
    if (timeTaken < 5) return '#22C55E';
    if (timeTaken < 10) return '#84CC16';
    if (timeTaken < 20) return '#EAB308';
    if (timeTaken < 30) return '#F97316';
    return '#94A3B8';
  };

  const getXP = (isCorrect, timeTaken) => {
    if (!isCorrect) return 0;
    if (timeTaken < 5) return 5;
    if (timeTaken < 10) return 4;
    if (timeTaken < 20) return 3;
    if (timeTaken < 30) return 2;
    return 1;
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: t.text, background: t.bg }}>
        <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }}>🔤</div>
        <div>Đang tải câu hỏi...</div>
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

  // ─── Màn hình kết thúc ──────────────────────────────────────────────────────
  if (isFinished) {
    const correct = results.filter(r => r.isCorrect).length;
    const accuracy = Math.round((correct / results.length) * 100);
    return (
      <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 24, padding: '2.5rem 2rem', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: `0 20px 60px ${t.shadow}` }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.75rem' }}>
            {accuracy >= 80 ? '🏆' : accuracy >= 50 ? '👍' : '💪'}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: t.text, margin: '0 0 0.25rem' }}>
            {accuracy >= 80 ? 'Xuất sắc!' : accuracy >= 50 ? 'Tốt lắm!' : 'Cố gắng hơn nhé!'}
          </h2>
          <p style={{ color: t.textMuted, fontSize: '0.85rem', margin: '0 0 2rem' }}>Bạn đã hoàn thành bài tập Điền từ.</p>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Đúng', value: `${correct}/${results.length}`, color: '#22C55E' },
              { label: 'Độ chính xác', value: `${accuracy}%`, color: t.gold },
              { label: 'Thời gian', value: formatTime(totalElapsed), color: '#38BDF8' },
            ].map((s, i) => (
              <div key={i} style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: 12, padding: '1rem 0.5rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: t.textMuted, marginTop: '0.25rem' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* XP earned */}
          <div style={{ background: t.goldBg, borderRadius: 12, padding: '1rem', marginBottom: '2rem', border: `1px solid ${t.cardBorder}` }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: t.gold }}>
              +{finalResult?.totalXP ?? results.reduce((sum, r) => sum + getXP(r.isCorrect, r.timeTaken), 0)} XP
            </div>
            <div style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: '0.25rem' }}>Điểm kinh nghiệm nhận được</div>
          </div>

          {/* Per-question breakdown */}
          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            {results.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: i < results.length - 1 ? `1px solid ${t.cardBorder}` : 'none' }}>
                <span style={{ fontSize: '0.8rem', color: t.text }}>Câu {i + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: t.textMuted }}>{formatTime(r.timeTaken)}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: r.isCorrect ? '#22C55E' : '#EF4444' }}>
                    {r.isCorrect ? '✓' : '✗'}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getXPColor(r.timeTaken), minWidth: 40, textAlign: 'right' }}>
                    +{getXP(r.isCorrect, r.timeTaken)} XP
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={fetchData} style={{ flex: 1, padding: '0.875rem', borderRadius: 12, border: `1px solid ${t.cardBorder}`, background: 'transparent', color: t.text, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = t.goldBg; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              Chơi lại
            </button>
            <button onClick={() => navigate('/dashboard/games')} style={{ flex: 1, padding: '0.875rem', borderRadius: 12, border: 'none', background: t.goldBg, color: t.gold, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
              Quay lại Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Màn hình game chính ────────────────────────────────────────────────────
  const q = questions[currentIdx];
  const progress = ((currentIdx) / questions.length) * 100;

  const getOptionStyle = (option) => {
    const base = {
      padding: '0.875rem 1.25rem',
      borderRadius: 12,
      border: `2px solid ${t.cardBorder}`,
      background: t.card,
      color: t.text,
      fontWeight: 600,
      fontSize: '1rem',
      cursor: answered ? 'default' : 'pointer',
      transition: 'all 0.15s ease',
      textAlign: 'center',
    };
    if (!answered) return base;
    const isAnswer = option.toLowerCase() === q.answer.toLowerCase();
    const isSelected = option === selected;
    if (isAnswer) return { ...base, background: 'rgba(34,197,94,0.15)', borderColor: '#22C55E', color: '#22C55E' };
    if (isSelected && !isCorrect) return { ...base, background: 'rgba(239,68,68,0.12)', borderColor: '#EF4444', color: '#EF4444', animation: 'shake 0.3s ease' };
    return { ...base, opacity: 0.4 };
  };

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${t.sidebarBorder}` }}>
        <button onClick={() => navigate('/dashboard/games')} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          Thoát
        </button>
        <div style={{ fontWeight: 700, fontSize: '1rem' }}>🔤 Điền từ vào chỗ trống</div>
        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem', color: elapsed >= 20 ? '#F97316' : t.text, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', padding: '0.4rem 0.75rem', borderRadius: 8 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {formatTime(elapsed)}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${t.gold}, #F97316)`, transition: 'width 0.4s ease', borderRadius: '0 4px 4px 0' }} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: 640, width: '100%' }}>

          {/* Question counter */}
          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: t.textMuted, marginBottom: '1.5rem', fontWeight: 600 }}>
            Câu {currentIdx + 1} / {questions.length}
          </div>

          {/* Meaning hint */}
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: t.textMuted, background: t.goldBg, padding: '0.3rem 0.75rem', borderRadius: 20, border: `1px solid ${t.cardBorder}` }}>
              💡 Nghĩa: {q.meaning}
            </span>
          </div>

          {/* Sentence card */}
          <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: '2.5rem 2rem', marginBottom: '2rem', textAlign: 'center', boxShadow: `0 8px 32px ${t.shadow}` }}>
            <p style={{ fontSize: '1.35rem', lineHeight: 1.8, color: t.text, margin: 0, fontStyle: 'italic' }}>
              {q.sentence.split('______').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span style={{
                      display: 'inline-block',
                      minWidth: 100,
                      borderBottom: answered
                        ? `3px solid ${isCorrect ? '#22C55E' : '#EF4444'}`
                        : `3px solid ${t.gold}`,
                      color: answered ? (isCorrect ? '#22C55E' : '#EF4444') : t.gold,
                      fontWeight: 800,
                      fontStyle: 'normal',
                      padding: '0 8px',
                      transition: 'all 0.3s'
                    }}>
                      {answered ? q.answer : ''}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </p>
          </div>

          {/* Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {q.options.map((option, i) => (
              <button key={i} onClick={() => handleSelect(option)} style={getOptionStyle(option)}
                onMouseEnter={e => { if (!answered) e.currentTarget.style.borderColor = t.gold; }}
                onMouseLeave={e => { if (!answered) e.currentTarget.style.borderColor = t.cardBorder; }}>
                <span style={{ marginRight: '0.5rem', fontSize: '0.8rem', opacity: 0.5 }}>{['A', 'B', 'C', 'D'][i]}</span>
                {option}
              </button>
            ))}
          </div>

          {/* Skip button */}
          {!answered && (
            <button onClick={handleSkip} style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: `1px solid ${t.cardBorder}`, background: 'transparent', color: t.textMuted, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              Bỏ qua →
            </button>
          )}

          {/* XP preview khi đã trả lời */}
          {answered && (
            <div style={{ textAlign: 'center', padding: '0.75rem', borderRadius: 10, background: t.goldBg, color: isCorrect ? getXPColor(elapsed) : '#EF4444', fontWeight: 700, fontSize: '0.95rem', animation: 'fadeIn 0.3s ease' }}>
              {isCorrect
                ? `+${getXP(true, elapsed)} XP · ${elapsed < 5 ? '⚡ Siêu nhanh!' : elapsed < 10 ? '🔥 Nhanh!' : elapsed < 20 ? '👍 Tốt!' : '✓ Đúng!'}`
                : selected === '__skip__' ? '⏭ Đã bỏ qua — 0 XP' : '❌ Sai rồi — 0 XP'}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
