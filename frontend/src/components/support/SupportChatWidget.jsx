import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import api from '../../services/api';

export default function SupportChatWidget() {
  const { user } = useAuthStore();
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();
  const { socket } = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(`support_cache_${user?.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const conversationRef = useRef(null); // Dùng ref để tránh stale closure trong sendMessage

  // Khởi tạo conversation khi mở widget lần đầu
  useEffect(() => {
    if (!isOpen || conversation) return;
    const init = async () => {
      try {
        const res = await api.get('/support/my');
        const conv = res.data?.data || res.data;
        conversationRef.current = conv;
        setConversation(conv);
        setUnread(conv.unreadByUser || 0);

        if (conv.messages) {
          setMessages(conv.messages);
          setUnread(0);
          try {
            localStorage.setItem(`support_cache_${user?.id}`, JSON.stringify(conv.messages.slice(-30)));
          } catch {}
        }
      } catch (err) {
        console.error('Support chat error:', err);
      }
    };
    init();
  }, [isOpen, conversation, user]);

  // Lắng nghe tin nhắn mới từ Admin qua Socket
  useEffect(() => {
    if (!socket) return;
    const handler = ({ conversationId, message }) => {
      if (!conversation || conversationId !== conversation.id) {
        setUnread(prev => prev + 1);
        return;
      }
      setMessages(prev => {
        const newMsgs = [...prev, message];
        try { localStorage.setItem(`support_cache_${user?.id}`, JSON.stringify(newMsgs.slice(-30))); } catch {}
        return newMsgs;
      });
      if (!isOpen) setUnread(prev => prev + 1);
    };
    socket.on('SUPPORT_NEW_MESSAGE', handler);
    return () => socket.off('SUPPORT_NEW_MESSAGE', handler);
  }, [socket, conversation, isOpen, user]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Khi mở widget → reset unread
  const handleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      setUnread(0);
    } else {
      setIsOpen(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    // Đọc từ ref để tránh stale closure
    const conv = conversationRef.current;
    if (!text || !conv || isSending) return;

    const tempMsg = { id: Date.now(), senderRole: 'USER', content: text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    setInput('');
    setIsSending(true);

    try {
      const res = await api.post(`/support/${conv.id}/messages`, { content: text });
      const saved = res.data?.data || res.data;
      // Thay thế tin nhắn tạm bằng tin nhắn đã lưu
      setMessages(prev => {
        const newMsgs = prev.map(m => m.id === tempMsg.id ? saved : m);
        try { localStorage.setItem(`support_cache_${user?.id}`, JSON.stringify(newMsgs.slice(-30))); } catch {}
        return newMsgs;
      });
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Không hiện với Admin
  if (user?.role === 'ADMIN') return null;

  return (
    <>
      {/* Floating button */}
      <div
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12,
        }}
      >
        {/* Chat window */}
        {isOpen && (
          <div
            style={{
              width: 360, height: 520,
              background: isDark ? 'rgba(18,18,24,0.97)' : 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(20px)',
              borderRadius: 20,
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              border: `1px solid ${t.cardBorder}`,
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              animation: 'scale-up 0.2s ease',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 18px',
              background: `linear-gradient(135deg, #F0B429, #D97706)`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
                }}>🎧</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Hỗ trợ EngMate</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)' }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#86efac', marginRight: 5 }} />
                    Đội ngũ hỗ trợ
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: t.textSub, fontSize: '0.875rem', marginTop: 40 }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>👋</div>
                  <div>Xin chào! Bạn cần hỗ trợ gì?</div>
                  <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Nhóm hỗ trợ sẽ trả lời sớm nhất có thể.</div>
                </div>
              )}
              {messages.map(msg => {
                const isMe = msg.senderRole === 'USER';
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '80%' }}>
                      <div style={{
                        padding: '9px 13px',
                        borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isMe
                          ? `linear-gradient(135deg, #F0B429, #D97706)`
                          : (isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0'),
                        color: isMe ? '#fff' : t.text,
                        fontSize: '0.9rem', lineHeight: 1.5,
                      }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: t.textSub, marginTop: 3, textAlign: isMe ? 'right' : 'left', paddingInline: 4 }}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '10px 12px',
              borderTop: `1px solid ${t.cardBorder}`,
              display: 'flex', gap: 8, alignItems: 'flex-end',
            }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                rows={1}
                style={{
                  flex: 1, resize: 'none', border: `1.5px solid ${t.inputBorder}`,
                  borderRadius: 12, padding: '8px 12px', fontSize: '0.9rem',
                  background: t.inputBg, color: t.text, outline: 'none',
                  lineHeight: 1.5, maxHeight: 80, overflowY: 'auto',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isSending}
                style={{
                  width: 38, height: 38, borderRadius: '50%', border: 'none',
                  background: input.trim() ? `linear-gradient(135deg, #F0B429, #D97706)` : t.cardBorder,
                  color: '#fff', cursor: input.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.2s', fontSize: '1.1rem',
                }}
              >
                ➤
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleOpen}
          style={{
            width: 58, height: 58, borderRadius: '50%', border: 'none',
            background: `linear-gradient(135deg, #F0B429, #D97706)`,
            color: '#fff', cursor: 'pointer', fontSize: isOpen ? '1.8rem' : '1.5rem',
            boxShadow: '0 8px 24px rgba(240,180,41,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: isOpen ? 'none' : 'mic-breathe 2.5s ease-in-out infinite',
            position: 'relative',
            transition: 'transform 0.3s ease, background 0.3s',
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'
          }}
          title={isOpen ? "Đóng" : "Liên hệ hỗ trợ"}
        >
          {isOpen ? '✕' : '💬'}
          {unread > 0 && !isOpen && (
            <div style={{
              position: 'absolute', top: -4, right: -4,
              background: '#ef4444', color: '#fff',
              width: 20, height: 20, borderRadius: '50%',
              fontSize: '0.7rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff',
            }}>
              {unread > 9 ? '9+' : unread}
            </div>
          )}
        </button>
      </div>
    </>
  );
}
