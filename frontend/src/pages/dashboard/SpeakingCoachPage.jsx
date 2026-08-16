import React, { useState, useEffect, useRef } from 'react';
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

function SpeakingCoachSkeleton({ t, isDark }) {
  const skFrom = isDark ? 'rgba(47,158,86,0.08)' : '#F0EAD9';
  const skTo   = isDark ? 'rgba(47,158,86,0.18)' : '#E5DBCA';

  return (
    <div
      className="screen-enter w-full max-w-5xl mx-auto flex flex-col"
      style={{ height: 'calc(100vh - 4rem)', '--sk-from': skFrom, '--sk-to': skTo }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <Sk w={220} h={28} r={8} />
          <Sk w={280} h={14} r={6} style={{ marginTop: 8 }} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Sk w={180} h={38} r={8} />
          <Sk w={120} h={38} r={8} />
        </div>
      </div>

      {/* Chat bubble area */}
      <div style={{
        flex: 1, borderRadius: 16,
        border: `1px solid ${t.cardBorder}`,
        background: t.card,
        padding: '1.5rem',
        display: 'flex', flexDirection: 'column', gap: '1.5rem',
        overflow: 'hidden',
      }}>
        {/* AI bubble */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <Sk w={36} h={36} r={18} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: '72%' }}>
            <Sk w="100%" h={16} r={6} />
            <Sk w="85%" h={16} r={6} />
            <Sk w="60%" h={16} r={6} />
          </div>
        </div>

        {/* User bubble */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: '60%', alignItems: 'flex-end' }}>
            <Sk w="100%" h={16} r={6} />
            <Sk w="70%" h={16} r={6} />
          </div>
        </div>

        {/* AI bubble 2 */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <Sk w={36} h={36} r={18} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: '65%' }}>
            <Sk w="100%" h={16} r={6} />
            <Sk w="90%" h={16} r={6} />
            <Sk w="50%" h={16} r={6} />
          </div>
        </div>

        {/* User bubble 2 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: '55%', alignItems: 'flex-end' }}>
            <Sk w="100%" h={16} r={6} />
          </div>
        </div>

        {/* AI typing indicator */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <Sk w={36} h={36} r={18} />
          <div style={{ display: 'flex', gap: 8, padding: '0.75rem 1rem', background: t.bgSub, borderRadius: '6px 16px 16px 16px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: t.textMuted, animation: `sk-dot 1.2s ease-in-out ${i * 0.15}s infinite` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div style={{
        marginTop: '1rem',
        display: 'flex', gap: '0.75rem', alignItems: 'center',
        background: t.card, borderRadius: 16,
        border: `1px solid ${t.cardBorder}`,
        padding: '0.875rem 1rem',
      }}>
        {/* Mic button skeleton */}
        <Sk w={52} h={52} r={26} />
        {/* Text input skeleton */}
        <Sk w="100%" h={24} r={8} />
        {/* Send button skeleton */}
        <Sk w={44} h={44} r={22} />
      </div>

      <style>{`
        @keyframes sk-shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes sk-dot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function SpeakingCoachPage() {
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();
  
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [micState, setMicState] = useState('idle'); // idle, recording, thinking, speaking
  const [input, setInput] = useState('');
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // skeleton loading state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Khởi tạo Speech Recognition (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setInput(prev => finalTranscript || interimTranscript || prev);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setMicState('idle');
      };

      recognition.onend = () => {
        // Tự động gửi sau khi ngắt ghi âm nếu có text
        setMicState(prev => prev === 'recording' ? 'idle' : prev);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Fetch sessions on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await api.get('/chat/session');
        const sessionList = res.data;
        if (sessionList.length === 0) {
          setIsModalOpen(true);
        } else {
          setSessions(sessionList);
          setCurrentSessionId(sessionList[0].id);
        }
      } catch (err) {
        console.error("Failed to init chat session", err);
      } finally {
        setIsLoading(false);
      }
    };
    initSession();
  }, []);

  // Lấy lịch sử chat khi đổi session
  useEffect(() => {
    if (!currentSessionId) return;
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/session/${currentSessionId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };
    fetchHistory();
  }, [currentSessionId]);

  // Cuộn xuống cuối
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, input, micState]);

  // Cleanup countdown timer khi unmount
  useEffect(() => () => clearInterval(countdownTimerRef.current), []);

  const startCountdown = (seconds) => {
    setRateLimitCountdown(seconds);
    clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = setInterval(() => {
      setRateLimitCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return alert("Trình duyệt không hỗ trợ ghi âm.");
    
    if (micState === 'idle') {
      window.speechSynthesis.cancel(); // Ngắt tiếng AI nếu đang đọc
      setInput('');
      recognitionRef.current.start();
      setMicState('recording');
    } else if (micState === 'recording') {
      recognitionRef.current.stop();
      setMicState('idle');
      // Nếu có input, có thể gọi sendText() ở đây, nhưng để ở onend an toàn hơn
    }
  };

  const speakText = (text) => {
    const synth = window.speechSynthesis;
    if (synth.speaking) synth.cancel();
    
    // Loại bỏ các đoạn feedback tiếng Việt ra khỏi phần đọc tiếng Anh
    const englishOnlyText = text.split('💡')[0].replace(/\*\*/g, '');

    const utterThis = new SpeechSynthesisUtterance(englishOnlyText);
    utterThis.lang = 'en-US';
    utterThis.rate = 0.9;
    
    utterThis.onstart = () => setMicState('speaking');
    utterThis.onend = () => setMicState('idle');
    utterThis.onerror = () => setMicState('idle');

    synth.speak(utterThis);
  };

  const sendText = async () => {
    const textToSend = input.trim();
    if (!textToSend || !currentSessionId) return;
    
    window.speechSynthesis.cancel(); // Ngắt tiếng
    setInput('');
    
    // Thêm tin nhắn user vào UI ngay lập tức
    const tempUserMsg = { id: Date.now(), senderRole: 'USER', content: textToSend };
    setMessages(m => [...m, tempUserMsg]);
    setMicState('thinking');

    try {
      const response = await fetch(`${api.defaults.baseURL}/chat/message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: currentSessionId, content: textToSend }),
        credentials: 'include' // Must include credentials to send HttpOnly cookies
      });

      if (response.status === 429) {
        const errorData = await response.json();
        if (errorData.message === 'RATE_LIMITED') {
          setMicState('idle');
          setMessages(m => m.filter(msg => msg.id !== tempUserMsg.id));
          startCountdown(errorData.retryAfter || 30);
          return;
        }
      }

      if (response.status === 403) {
        const errorData = await response.json();
        if (errorData.message === 'LIMIT_EXCEEDED') {
          setMicState('idle');
          setMessages(m => m.filter(msg => msg.id !== tempUserMsg.id)); // Rollback user msg
          // Navigate to premium page
          navigate('/dashboard/premium');
          return;
        }
      }

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiFullResponse = '';
      const tempAiId = Date.now() + 1;
      
      setMessages(m => [...m, { id: tempAiId, senderRole: 'MODEL', content: '' }]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop(); 
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            if (dataStr === '{}') continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                aiFullResponse += data.text;
                setMessages(prev => prev.map(msg => msg.id === tempAiId ? { ...msg, content: aiFullResponse } : msg));
              }
            } catch (e) {}
          }
        }
      }
      
      setMicState('idle');
      // Đọc phần phản hồi
      speakText(aiFullResponse);

    } catch (err) {
      console.error("Lỗi gửi tin nhắn", err);
      setMicState('idle');
    }
  };
  const micLabel = micState === 'idle' ? 'Micro sẵn sàng' 
                 : micState === 'recording' ? 'Đang nghe...' 
                 : micState === 'thinking' ? 'AI đang phân tích...' 
                 : 'AI đang nói...';
  const micColor = micState === 'idle' ? t.gold 
                 : micState === 'recording' ? '#EF4444' 
                 : micState === 'speaking' ? '#10B981' : '#8B5CF6';

  if (isLoading) return <SpeakingCoachSkeleton t={t} isDark={isDark} />;

  return (
    <div className="screen-enter w-full max-w-5xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <Header title="AI Conversation" subtitle={sessions.find(s => s.id === currentSessionId)?.topic || "Luyện hội thoại · Nhận phản hồi tức thì"} />
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {sessions.length > 0 && (
            <select 
              value={currentSessionId || ''} 
              onChange={(e) => setCurrentSessionId(parseInt(e.target.value))}
              style={{
                background: t.card, color: t.text, border: `1px solid ${t.cardBorder}`,
                padding: '0.6rem 1rem', borderRadius: 8, outline: 'none',
                maxWidth: '45vw', textOverflow: 'ellipsis'
              }}
            >
              {sessions.map(s => <option key={s.id} value={s.id}>{s.topic}</option>)}
            </select>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '0.6rem 1rem', borderRadius: 8, border: 'none',
              background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`,
              color: '#fff', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <span>+</span> New Session
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '1rem', paddingRight: '0.5rem' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.senderRole === 'USER' ? 'flex-end' : 'flex-start', position: 'relative' }}>
            {msg.senderRole === 'MODEL' && (
              <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '85%', alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${t.gold},${t.goldDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0, marginTop: 4 }}>✦</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div className="bubble-ai" style={{ background: t.msgAiBg, border: `1px solid ${t.msgAiBorder}`, borderRadius: '6px 20px 20px 20px', padding: '1rem 1.25rem', fontSize: '0.95rem', color: t.text, lineHeight: 1.6, boxShadow: `0 4px 16px ${t.shadow}`, whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>
                  <button 
                    onClick={() => speakText(msg.content)}
                    style={{ background: 'transparent', border: 'none', color: t.textSub, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.75rem', padding: '0.25rem 0', alignSelf: 'flex-start' }}
                    title="Đọc lại"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    Nghe lại
                  </button>
                </div>
              </div>
            )}
            {msg.senderRole === 'USER' && (
              <div style={{ background: `linear-gradient(135deg, rgba(234,179,8,0.18), rgba(234,179,8,0.1))`, border: `1.5px solid rgba(234,179,8,0.3)`, borderRadius: '20px 6px 20px 20px', padding: '1rem 1.25rem', maxWidth: '80%', fontSize: '0.95rem', color: t.text, lineHeight: 1.6 }}>
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {micState === 'thinking' && (
          <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${t.gold},${t.goldDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>✦</div>
            <div className="bubble-ai" style={{ background: t.msgAiBg, border: `1px solid ${t.msgAiBorder}`, borderRadius: '6px 20px 20px 20px', padding: '1rem 1.25rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div className="dot" style={{ background: t.textMuted }} />
              <div className="dot" style={{ background: t.textMuted }} />
              <div className="dot" style={{ background: t.textMuted }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Mic status */}
      <div style={{ textAlign: 'center', paddingBottom: '0.625rem', opacity: micState === 'idle' ? 0.6 : 1, transition: 'opacity 0.3s' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', borderRadius: 100, background: t.goldBg, border: `1px solid ${t.cardBorder}` }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: micColor, transition: 'background 0.3s', boxShadow: micState === 'recording' ? '0 0 8px #EF4444' : 'none' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: t.textSub }}>{micLabel}</span>
        </div>
      </div>

      {/* Input footer */}
      <div style={{ ...card(t), padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', position: 'relative' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendText()}
          disabled={rateLimitCountdown > 0 || micState === 'thinking'}
          placeholder={rateLimitCountdown > 0 ? `Vui lòng chờ ${rateLimitCountdown}s để nhắn tiếp...` : "Nhập câu hoặc hỏi AI Coach..."}
          style={{ flex: 1, background: rateLimitCountdown > 0 ? 'rgba(255,0,0,0.05)' : t.inputBg, border: `1.5px solid ${rateLimitCountdown > 0 ? '#ef4444' : t.inputBorder}`, borderRadius: 14, padding: '0.75rem 1.25rem', fontFamily: 'inherit', fontSize: '0.95rem', color: rateLimitCountdown > 0 ? '#ef4444' : t.text, outline: 'none', transition: 'border-color 0.2s' }} />

        <button onClick={sendText} disabled={micState === 'thinking' || rateLimitCountdown > 0} style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: t.goldBg, cursor: (micState === 'thinking' || rateLimitCountdown > 0) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (micState === 'thinking' || rateLimitCountdown > 0) ? 0.5 : 1 }}>
          {Icon.send(t.gold)}
        </button>

        {/* Mic button */}
        <div style={{ position: 'relative' }}>
          {micState === 'recording' && <>
            <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: `2px solid ${micColor}`, animation: 'mic-ring 1.2s ease-out infinite' }} />
            <div style={{ position: 'absolute', inset: -14, borderRadius: '50%', border: `2px solid ${micColor}`, animation: 'mic-ring2 1.2s ease-out infinite 0.3s' }} />
          </>}
          <button onClick={toggleMic} disabled={micState === 'thinking' || rateLimitCountdown > 0} style={{
            width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: (micState === 'thinking' || rateLimitCountdown > 0) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: micState === 'idle' ? `linear-gradient(135deg, ${t.gold}, ${t.goldDark})` : micState === 'recording' ? 'linear-gradient(135deg,#EF4444,#DC2626)' : micState === 'speaking' ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#8B5CF6,#6D28D9)',
            animation: micState === 'idle' ? 'mic-breathe 2.5s ease-in-out infinite' : 'none',
            transition: 'background 0.3s',
            opacity: (micState === 'thinking' || rateLimitCountdown > 0) ? 0.5 : 1,
          }}>
            {micState === 'recording' ? <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="2"/></svg> : Icon.mic('#fff')}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <CreateSessionModal 
          t={t} isDark={isDark} 
          onClose={() => {
            if (sessions.length > 0) setIsModalOpen(false); // Only allow closing if there are sessions
          }}
          onCreate={async (data) => {
            try {
              const res = await api.post('/chat/session', data);
              const { session, welcomeMsg } = res.data;
              setSessions(prev => [session, ...prev]);
              setCurrentSessionId(session.id);
              setMessages([welcomeMsg]);
              setIsModalOpen(false);
            } catch (err) {
              console.error(err);
              alert("Lỗi khi tạo phiên mới");
            }
          }}
        />
      )}
    </div>
  );
}

function CreateSessionModal({ t, isDark, onClose, onCreate }) {
  const [level, setLevel] = useState('B2');
  const [topic, setTopic] = useState('Travel & Holidays');
  const [customTopic, setCustomTopic] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const SUGGESTED_TOPICS = [
    'Travel & Holidays',
    'Work & Career',
    'Food & Dining',
    'Movies & Entertainment',
    'IELTS Speaking Mock Test'
  ];

  const LEVELS = ['A2', 'B1', 'B2', 'C1'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTopic = isCustom ? customTopic.trim() : topic;
    if (!finalTopic) return;
    
    onCreate({
      topic: finalTopic,
      targetLevel: level,
      category: finalTopic.includes('IELTS') ? 'IELTS' : 'GENERAL'
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
      <div className="scale-up" style={{ ...card(t, { background: isDark ? 'rgba(30,30,35,0.85)' : 'rgba(255,255,255,0.95)' }), width: '100%', maxWidth: 480, position: 'relative', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${t.cardBorder}` }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: t.text, margin: 0 }}>Create New Session</h2>
          <p style={{ fontSize: '0.875rem', color: t.textSub, marginTop: '0.25rem' }}>Chọn chủ đề để bắt đầu luyện hội thoại</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: t.text, marginBottom: '0.75rem' }}>Target Level</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {LEVELS.map(l => (
                <button type="button" key={l} onClick={() => setLevel(l)} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: `1px solid ${level === l ? t.gold : t.cardBorder}`, background: level === l ? t.goldBg : 'transparent', color: level === l ? t.gold : t.textSub, cursor: 'pointer', fontWeight: 600 }}>{l}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: t.text, marginBottom: '0.75rem' }}>Topic</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {SUGGESTED_TOPICS.map(tOption => (
                <label key={tOption} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 8, border: `1px solid ${!isCustom && topic === tOption ? t.gold : t.cardBorder}`, background: !isCustom && topic === tOption ? t.goldBg : 'transparent', cursor: 'pointer' }}>
                  <input type="radio" name="topicMode" checked={!isCustom && topic === tOption} onChange={() => { setIsCustom(false); setTopic(tOption); }} style={{ accentColor: t.gold }} />
                  <span style={{ fontSize: '0.95rem', color: t.text }}>{tOption}</span>
                </label>
              ))}
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 8, border: `1px solid ${isCustom ? t.gold : t.cardBorder}`, background: isCustom ? t.goldBg : 'transparent', cursor: 'pointer' }}>
                <input type="radio" name="topicMode" checked={isCustom} onChange={() => setIsCustom(true)} style={{ accentColor: t.gold }} />
                <span style={{ fontSize: '0.95rem', color: t.text }}>Free Talk (Custom)</span>
              </label>
            </div>
          </div>

          {isCustom && (
            <div>
              <input type="text" value={customTopic} onChange={e => setCustomTopic(e.target.value)} placeholder="e.g., Let's talk about AI in healthcare" required style={{ width: '100%', background: t.inputBg, border: `1.5px solid ${t.inputBorder}`, borderRadius: 8, padding: '0.75rem 1rem', color: t.text, outline: 'none' }} />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.25rem', borderRadius: 8, border: 'none', background: t.cardBorder, color: t.text, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`, color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: (isCustom && !customTopic.trim()) ? 0.5 : 1 }}>Start Session</button>
          </div>
        </form>
      </div>
    </div>
  );
}
