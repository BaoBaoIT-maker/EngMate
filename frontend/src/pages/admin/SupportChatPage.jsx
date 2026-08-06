import { useState, useEffect, useRef } from 'react';
import { Badge, Avatar, Input, Button, Empty, Spin } from 'antd';
import { SendOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';

const { TextArea } = Input;

export default function AdminChatPage() {
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Tải danh sách conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await api.get('/support');
        setConversations(res.data?.data || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Lắng nghe tin nhắn mới qua Socket
  useEffect(() => {
    if (!socket) return;
    const handler = ({ conversationId, message }) => {
      // Cập nhật badge unread ở danh sách
      setConversations(prev =>
        prev.map(c => c.id === conversationId
          ? { ...c, unreadByAdmin: selectedConv?.id === conversationId ? 0 : (c.unreadByAdmin || 0) + 1, lastMessage: message.content, lastMessageAt: message.createdAt }
          : c
        ).sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
      );

      // Nếu đang mở đúng conversation đó → thêm tin nhắn vào luồng
      if (selectedConv && conversationId === selectedConv.id) {
        setMessages(prev => [...prev, message]);
      }
    };
    socket.on('SUPPORT_NEW_MESSAGE', handler);
    return () => socket.off('SUPPORT_NEW_MESSAGE', handler);
  }, [socket, selectedConv]);

  // Tải messages khi chọn conversation
  useEffect(() => {
    if (!selectedConv) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/support/${selectedConv.id}/messages`);
        setMessages(res.data?.data || res.data || []);
        // Reset unread
        setConversations(prev =>
          prev.map(c => c.id === selectedConv.id ? { ...c, unreadByAdmin: 0 } : c)
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [selectedConv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !selectedConv || sending) return;

    const tempMsg = { id: Date.now(), senderRole: 'ADMIN', content: text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await api.post(`/support/${selectedConv.id}/messages`, { content: text });
      const saved = res.data?.data || res.data;
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? saved : m));
      setConversations(prev =>
        prev.map(c => c.id === selectedConv.id ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() } : c)
      );
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const getUserName = (conv) =>
    conv?.user?.profile?.username || conv?.user?.email || `User #${conv?.userId}`;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: '#f5f5f5' }}>
      {/* ── Left: Conversation list ── */}
      <div style={{
        width: 320, background: '#fff', borderRight: '1px solid #f0f0f0',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageOutlined style={{ color: '#6C63FF', fontSize: 18 }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0F1623' }}>Hỗ trợ người dùng</span>
          </div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{conversations.length} cuộc hội thoại</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
              <Spin />
            </div>
          ) : conversations.length === 0 ? (
            <Empty description="Chưa có hội thoại nào" style={{ padding: 32 }} />
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  background: selectedConv?.id === conv.id ? 'rgba(108,99,255,0.06)' : 'transparent',
                  borderLeft: selectedConv?.id === conv.id ? '3px solid #6C63FF' : '3px solid transparent',
                  transition: 'all 0.15s',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}
              >
                <Badge count={conv.unreadByAdmin || 0} size="small" color="#6C63FF">
                  <Avatar
                    src={conv.user?.profile?.avatarUrl}
                    icon={<UserOutlined />}
                    style={{ background: '#6C63FF', flexShrink: 0 }}
                    size={40}
                  />
                </Badge>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#0F1623' }}>{getUserName(conv)}</span>
                    <span style={{ fontSize: 11, color: '#999', flexShrink: 0, marginLeft: 4 }}>{formatTime(conv.lastMessageAt)}</span>
                  </div>
                  <div style={{
                    fontSize: 13, color: '#888',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    maxWidth: 180, marginTop: 2,
                  }}>
                    {conv.lastMessage || 'Chưa có tin nhắn'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right: Chat area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!selectedConv ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
            <MessageOutlined style={{ fontSize: 48, marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 500 }}>Chọn một cuộc hội thoại để bắt đầu</div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{
              padding: '14px 20px', background: '#fff',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <Avatar
                src={selectedConv.user?.profile?.avatarUrl}
                icon={<UserOutlined />}
                style={{ background: '#6C63FF' }}
                size={38}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0F1623' }}>{getUserName(selectedConv)}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{selectedConv.user?.email}</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 && (
                <Empty description="Chưa có tin nhắn nào" style={{ marginTop: 60 }} />
              )}
              {messages.map(msg => {
                const isAdmin = msg.senderRole === 'ADMIN';
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '65%' }}>
                      {!isAdmin && (
                        <div style={{ fontSize: 11, color: '#aaa', marginBottom: 3, paddingLeft: 4 }}>
                          {getUserName(selectedConv)}
                        </div>
                      )}
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: isAdmin ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isAdmin ? 'linear-gradient(135deg, #6C63FF, #5B54E8)' : '#f0f0f0',
                        color: isAdmin ? '#fff' : '#222',
                        fontSize: '0.9rem', lineHeight: 1.5,
                      }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: 3, textAlign: isAdmin ? 'right' : 'left', paddingInline: 4 }}>
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
              padding: '12px 16px', background: '#fff',
              borderTop: '1px solid #f0f0f0',
              display: 'flex', gap: 10, alignItems: 'flex-end',
            }}>
              <TextArea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Nhập phản hồi cho người dùng..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                style={{ flex: 1, borderRadius: 10, resize: 'none' }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendMessage}
                loading={sending}
                disabled={!input.trim()}
                style={{ background: '#6C63FF', borderColor: '#6C63FF', height: 38, borderRadius: 10 }}
              >
                Gửi
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
