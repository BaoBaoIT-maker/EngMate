import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/dashboard/Header';
import useThemeStore from '../../store/useThemeStore';
import { Icon } from '../../components/icons';

const CHAT_INIT = [
  { id: 1, role: 'ai', text: 'Xin chào! Tôi là AI Coach của bạn 🎯 Hôm nay chúng ta luyện IELTS Speaking Part 2. Chủ đề: **"Describe a memorable journey you have taken."** Bạn có 1 phút chuẩn bị và 2 phút để nói. Sẵn sàng chưa?' },
  { id: 2, role: 'user', text: 'Sẵn sàng rồi ạ!' },
  { id: 3, role: 'ai', text: 'Tuyệt vời! Hãy nhấn nút micro bên dưới và bắt đầu nói khi bạn sẵn sàng. Tôi sẽ phân tích phát âm, ngữ điệu và từ vựng của bạn sau khi bạn hoàn thành. 🎙️' },
  { id: 4, role: 'feedback', text: 'Câu trả lời tốt! Phát âm rõ ràng và lưu loát. Hãy dùng thêm discourse markers như "Furthermore", "In addition" để mạch lạc hơn.', scores: { pronunciation: 88, fluency: 76, vocabulary: 82 } },
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

export default function SpeakingCoachPage() {
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();
  
  const [messages, setMessages] = useState(CHAT_INIT);
  const [micState, setMicState] = useState('idle');
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const toggleMic = () => {
    if (micState === 'idle') {
      setMicState('recording');
      setTimeout(() => {
        setMicState('thinking');
        setTimeout(() => {
          setMicState('idle');
          setMessages(m => [...m,
            { id: Date.now(), role: 'user', text: 'I would like to talk about a journey I took to Da Nang last summer. It was truly a memorable experience...' },
            { id: Date.now() + 1, role: 'feedback', text: 'Tốt lắm! Câu trả lời rõ ràng và có cấu trúc. Hãy sử dụng thêm từ vựng nâng cao và discourse markers.', scores: { pronunciation: 86, fluency: 79, vocabulary: 83 } },
          ]);
        }, 2200);
      }, 3000);
    } else if (micState === 'recording') {
      setMicState('thinking');
      setTimeout(() => setMicState('idle'), 2200);
    }
  };

  const sendText = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { id: Date.now(), role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(m => [...m, { id: Date.now(), role: 'ai', text: 'Câu trả lời hay! Để nâng cao hơn, hãy thử dùng: "I vividly recall..." thay vì "I remember..." — mang lại cảm giác sinh động hơn. Bạn muốn thử lại không? 💬' }]);
    }, 1200);
  };

  const micLabel = micState === 'idle' ? 'Micro sẵn sàng' : micState === 'recording' ? 'Đang ghi âm…' : 'AI đang phân tích…';
  const micColor = micState === 'idle' ? t.gold : micState === 'recording' ? '#EF4444' : '#8B5CF6';

  return (
    <div className="screen-enter w-full max-w-5xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <Header title="AI Speaking Coach" subtitle="Luyện nói · Nhận phản hồi tức thì" />

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
                      <div key={l} style={{ flex: 1, textAlign: 'center', padding: '0.5rem', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: c }}>{v}</div>
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
            const d = [0.55, 0.8, 0.65, 1, 0.7, 0.9, 0.6, 1.1, 0.75, 0.85, 0.65, 1, 0.7, 0.95, 0.6, 0.8, 0.65, 0.9][i];
            return <div key={i} style={{ width: 3, height: 28, borderRadius: 100, background: `linear-gradient(180deg,${t.gold},${t.goldDark})`, transformOrigin: 'center', animation: `wave-bar ${d}s ease-in-out infinite`, animationDelay: `${i * 0.06}s` }} />;
          })}
        </div>
      )}
    </div>
  );
}
