import { useState, useEffect, useRef } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import api from '../../services/api';
import ReactMarkdown from 'react-markdown';

// ─── Suggested questions để gợi ý cho user ────────────────────────────────
const SUGGESTED_QUESTIONS = [
  'Gói Premium có những quyền lợi gì?',
  'Hôm nay tôi cần ôn bao nhiêu thẻ?',
  'Tiến độ học tập của tôi thế nào?',
  'Cách luyện nói với AI Coach?',
];

export default function AdvisorChatWidget() {
  const { user } = useAuthStore();
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();

  const [isOpen, setIsOpen] = useState(false);
  // Load messages từ localStorage khi component mount
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('advisor_messages');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [rateLimit, setRateLimit] = useState({ used: 0, limit: 5, isPremium: false });
  const [rateLimitError, setRateLimitError] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  // Load history từ localStorage (multi-turn context cho Gemini)
  const historyRef = useRef((() => {
    try {
      const saved = localStorage.getItem('advisor_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  })());

  // Lưu messages vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    try {
      // Chỉ lưu tin nhắn đã hoàn thành (không lưu các tin đang stream)
      const toSave = messages.filter(m => !m.isStreaming);
      localStorage.setItem('advisor_messages', JSON.stringify(toSave));
    } catch { /* ignore quota errors */ }
  }, [messages]);

  // Scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus vào input khi mở widget
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Lấy thông tin quota khi mở lần đầu
  useEffect(() => {
    if (!isOpen || messages.length > 0) return;
    const fetchLimit = async () => {
      try {
        const res = await api.get('/advisor/limit');
        const data = res.data?.data || res.data;
        setRateLimit(data);
      } catch (e) { /* ignore */ }
    };
    fetchLimit();
  }, [isOpen]);

  // Không hiển thị với Admin
  if (user?.role === 'ADMIN') return null;

  const sendMessage = async (text) => {
    const messageText = (text || input).trim();
    if (!messageText || isStreaming) return;

    setInput('');
    setRateLimitError(null);

    // Thêm tin nhắn của user vào UI ngay lập tức
    const userMsgId = Date.now();
    const userMsg = { id: userMsgId, role: 'user', content: messageText };
    setMessages(prev => [...prev, userMsg]);

    // Thêm placeholder cho tin nhắn AI đang stream
    const aiMsgId = userMsgId + 1;
    setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: '', isStreaming: true }]);
    setIsStreaming(true);

    try {
      // Gọi SSE stream từ backend
      const response = await fetch(`${api.defaults.baseURL}/advisor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: historyRef.current // Truyền lịch sử multi-turn
        }),
        credentials: 'include'
      });

      // Xử lý rate limit error
      if (response.status === 429) {
        const errData = await response.json();
        setMessages(prev => prev.filter(m => m.id !== aiMsgId));
        setRateLimitError(errData.detail || 'Bạn đã đạt giới hạn câu hỏi. Vui lòng thử lại sau.');
        setIsStreaming(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Server error');
      }

      // Đọc SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiFullText = '';
      let buffer = '';

      // Đọc rate limit headers
      const usedHeader = response.headers.get('X-RateLimit-Daily-Used');
      const limitHeader = response.headers.get('X-RateLimit-Daily-Limit');
      if (usedHeader) {
        setRateLimit(prev => ({ ...prev, used: parseInt(usedHeader), limit: parseInt(limitHeader) || prev.limit }));
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.substring(6));

            if (data.done) break;
            if (data.error) {
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: '⚠️ ' + data.error, isStreaming: false } : m
              ));
              break;
            }
            if (data.text) {
              aiFullText += data.text;
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: aiFullText, isStreaming: true } : m
              ));
            }
          } catch (e) { /* ignore parse error */ }
        }
      }

      // Kết thúc stream — đánh dấu tin nhắn AI là xong
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, content: aiFullText, isStreaming: false } : m
      ));

      // Cập nhật history multi-turn cho lần hỏi tiếp theo
      historyRef.current = [
        ...historyRef.current,
        { role: 'user', parts: [{ text: messageText }] },
        { role: 'model', parts: [{ text: aiFullText }] }
      ];
      // Giới hạn history 10 turns để không gửi quá nhiều token
      if (historyRef.current.length > 20) {
        historyRef.current = historyRef.current.slice(-20);
      }
      // Lưu history vào localStorage
      try {
        localStorage.setItem('advisor_history', JSON.stringify(historyRef.current));
      } catch { /* ignore */ }

    } catch (err) {
      console.error('[AdvisorWidget] Error:', err);
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, content: '⚠️ Đã xảy ra lỗi, vui lòng thử lại.', isStreaming: false }
          : m
      ));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    historyRef.current = [];
    setRateLimitError(null);
    // Xóa luôn trong localStorage
    localStorage.removeItem('advisor_messages');
    localStorage.removeItem('advisor_history');
  };

  const quotaLeft = rateLimit.limit - rateLimit.used;
  const quotaColor = quotaLeft <= 1 ? '#ef4444' : quotaLeft <= 3 ? '#f59e0b' : '#10b981';

  return (
    <>
      {/* Container nằm bên trái SupportChatWidget (bottom 28, right 100) */}
      <div style={{
        position: 'fixed',
        bottom: 28,
        right: 100, // Để không che SupportChatWidget
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 12,
      }}>
        {/* Chat Window */}
        {isOpen && (
          <div style={{
            width: 370,
            height: 540,
            background: isDark ? 'rgba(15,15,20,0.97)' : 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(24px)',
            borderRadius: 20,
            boxShadow: `0 24px 64px rgba(0,0,0,0.3), 0 0 0 1px ${t.cardBorder}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'scale-up 0.2s ease',
          }}>

            {/* Header */}
            <div style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, #6C63FF, #4F46E5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem',
                }}>✦</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>AI Tư vấn EngMate</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#86efac' }} />
                    Hỏi gì cũng biết · Trả lời bằng AI
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {/* Nút xóa lịch sử */}
                <button
                  onClick={handleClearChat}
                  title="Xóa lịch sử chat"
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >🗑</button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >✕</button>
              </div>
            </div>

            {/* Quota bar */}
            <div style={{
              padding: '6px 16px',
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              borderBottom: `1px solid ${t.cardBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '0.7rem', color: t.textSub }}>
                Quota hôm nay: <b style={{ color: quotaColor }}>{quotaLeft}</b>/{rateLimit.limit} câu
              </span>
              {!rateLimit.isPremium && (
                <span style={{ fontSize: '0.65rem', color: '#6C63FF', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => window.location.href = '/dashboard/premium'}
                >⬆ Nâng cấp Premium</span>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Welcome / Suggested questions */}
              {messages.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>✦</div>
                    <div style={{ fontWeight: 700, color: t.text, fontSize: '0.95rem' }}>Xin chào, tôi là AI Tư vấn!</div>
                    <div style={{ fontSize: '0.8rem', color: t.textSub, marginTop: 4 }}>Hỏi tôi bất cứ điều gì về EngMate nhé.</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: '0.72rem', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Câu hỏi gợi ý</div>
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <button key={i} onClick={() => sendMessage(q)} style={{
                        textAlign: 'left', padding: '8px 12px', borderRadius: 10,
                        border: `1px solid ${t.cardBorder}`,
                        background: isDark ? 'rgba(108,99,255,0.08)' : 'rgba(108,99,255,0.05)',
                        color: t.text, fontSize: '0.82rem', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(108,99,255,0.15)'}
                        onMouseOut={e => e.currentTarget.style.background = isDark ? 'rgba(108,99,255,0.08)' : 'rgba(108,99,255,0.05)'}
                      >
                        💬 {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages list */}
              {messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                  {/* AI Avatar */}
                  {msg.role === 'ai' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6C63FF,#4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0, marginBottom: 2 }}>✦</div>
                  )}
                  <div style={{ maxWidth: '78%' }}>
                    <div style={{
                      padding: '9px 13px',
                      borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #6C63FF, #4F46E5)'
                        : (isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'),
                      color: msg.role === 'user' ? '#fff' : t.text,
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}>
                      {msg.role === 'ai' ? (
                        <div className="markdown-body" style={{ color: t.text }}>
                          {msg.content ? <ReactMarkdown>{msg.content}</ReactMarkdown> : null}
                          {msg.isStreaming && !msg.content && (
                            <span style={{ display: 'flex', gap: 4, padding: '2px 0' }}>
                              {[0, 1, 2].map(i => (
                                <span key={i} className="dot" style={{ background: '#6C63FF', animationDelay: `${i * 0.15}s` }} />
                              ))}
                            </span>
                          )}
                        </div>
                      ) : (
                        msg.content || (msg.isStreaming && (
                          <span style={{ display: 'flex', gap: 4, padding: '2px 0' }}>
                            {[0, 1, 2].map(i => (
                              <span key={i} className="dot" style={{ background: '#6C63FF', animationDelay: `${i * 0.15}s` }} />
                            ))}
                          </span>
                        ))
                      )}
                      {/* Blinking cursor khi đang stream */}
                      {msg.isStreaming && msg.content && (
                        <span style={{ display: 'inline-block', width: 2, height: '1em', background: '#6C63FF', marginLeft: 2, animation: 'blink 0.8s step-end infinite', verticalAlign: 'text-bottom' }} />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Rate limit error banner */}
              {rateLimitError && (
                <div style={{
                  padding: '10px 14px', borderRadius: 12,
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444', fontSize: '0.82rem', lineHeight: 1.5,
                }}>
                  ⏳ {rateLimitError}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div style={{
              padding: '10px 12px',
              borderTop: `1px solid ${t.cardBorder}`,
              display: 'flex', gap: 8, alignItems: 'flex-end',
              flexShrink: 0,
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                placeholder={isStreaming ? 'AI đang trả lời...' : 'Hỏi tôi điều gì đó...'}
                rows={1}
                style={{
                  flex: 1, resize: 'none',
                  border: `1.5px solid ${isStreaming ? t.cardBorder : t.inputBorder}`,
                  borderRadius: 12,
                  padding: '8px 12px',
                  fontSize: '0.875rem',
                  background: isStreaming ? (isDark ? 'rgba(255,255,255,0.03)' : '#f9f9f9') : t.inputBg,
                  color: t.text,
                  outline: 'none',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                  maxHeight: 80,
                  overflowY: 'auto',
                  transition: 'all 0.2s',
                  cursor: isStreaming ? 'not-allowed' : 'text',
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isStreaming}
                style={{
                  width: 38, height: 38, borderRadius: '50%', border: 'none',
                  background: (!input.trim() || isStreaming)
                    ? t.cardBorder
                    : 'linear-gradient(135deg, #6C63FF, #4F46E5)',
                  color: '#fff',
                  cursor: (!input.trim() || isStreaming) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.2s', fontSize: '1rem',
                }}
              >
                {isStreaming ? (
                  <span style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                ) : '➤'}
              </button>
            </div>
          </div>
        )}

        {/* Floating bubble button */}
        <button
          onClick={() => setIsOpen(o => !o)}
          style={{
            width: 54, height: 54, borderRadius: '50%', border: 'none',
            background: isOpen
              ? 'linear-gradient(135deg, #4F46E5, #6C63FF)'
              : 'linear-gradient(135deg, #6C63FF, #4F46E5)',
            color: '#fff', cursor: 'pointer', fontSize: '1.4rem',
            boxShadow: '0 8px 24px rgba(108,99,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'mic-breathe 3s ease-in-out infinite',
            transition: 'all 0.2s',
          }}
          title="AI Tư vấn EngMate"
        >
          {isOpen ? '✕' : '✦'}
        </button>
      </div>

      {/* Inline CSS cho blink cursor và spin */}
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        /* Markdown Styling inside chat */
        .markdown-body p { margin-top: 0; margin-bottom: 8px; }
        .markdown-body p:last-child { margin-bottom: 0; }
        .markdown-body ul, .markdown-body ol { margin-top: 0; margin-bottom: 8px; padding-left: 20px; }
        .markdown-body li { margin-bottom: 4px; }
        .markdown-body strong { font-weight: 700; color: inherit; }
        .markdown-body code { background: rgba(128,128,128,0.2); padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
        .markdown-body pre { background: rgba(0,0,0,0.1); padding: 8px; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 0.85em; margin-top: 0; margin-bottom: 8px; }
        .markdown-body a { color: #6C63FF; text-decoration: underline; }
      `}</style>
    </>
  );
}
