import re

with open(r'frontend\src\components\support\SupportChatWidget.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update initial state
content = re.sub(
    r'const \[messages, setMessages\] = useState\(\[\]\);',
    '''const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(support_cache_);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });''',
    content
)

# 2. Update init useEffect
old_init_regex = r'// Khởi tạo conversation khi mở widget lần đầu\s*useEffect\(\(\) => \{.*?\}, \[isOpen\]\);'
new_init = '''// Khởi tạo conversation khi mở widget lần đầu
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
            localStorage.setItem(support_cache_, JSON.stringify(conv.messages.slice(-30)));
          } catch {}
        }
      } catch (err) {
        console.error('Support chat error:', err);
      }
    };
    init();
  }, [isOpen, conversation, user]);'''
content = re.sub(old_init_regex, new_init, content, flags=re.DOTALL)

# 3. Update socket useEffect
old_socket_regex = r'// Lắng nghe tin nhắn mới từ Admin qua Socket\s*useEffect\(\(\) => \{.*?\}, \[socket, conversation, isOpen\]\);'
new_socket = '''// Lắng nghe tin nhắn mới từ Admin qua Socket
  useEffect(() => {
    if (!socket) return;
    const handler = ({ conversationId, message }) => {
      if (!conversation || conversationId !== conversation.id) {
        setUnread(prev => prev + 1);
        return;
      }
      setMessages(prev => {
        const newMsgs = [...prev, message];
        try { localStorage.setItem(support_cache_, JSON.stringify(newMsgs.slice(-30))); } catch {}
        return newMsgs;
      });
      if (!isOpen) setUnread(prev => prev + 1);
    };
    socket.on('SUPPORT_NEW_MESSAGE', handler);
    return () => socket.off('SUPPORT_NEW_MESSAGE', handler);
  }, [socket, conversation, isOpen, user]);'''
content = re.sub(old_socket_regex, new_socket, content, flags=re.DOTALL)

# 4. Update sendMessage
old_send_regex = r'try \{\s*const res = await api\.post\(/support/\$\{conv\.id\}/messages, \{ content: text \}\);\s*const saved = res\.data\?\.data \|\| res\.data;\s*// Thay thế tin nhắn tạm bằng tin nhắn đã lưu\s*setMessages\(prev => prev\.map\(m => m\.id === tempMsg\.id \? saved : m\)\);\s*\} catch \(err\)'
new_send = '''try {
      const res = await api.post(/support//messages, { content: text });
      const saved = res.data?.data || res.data;
      // Thay thế tin nhắn tạm bằng tin nhắn đã lưu
      setMessages(prev => {
        const newMsgs = prev.map(m => m.id === tempMsg.id ? saved : m);
        try { localStorage.setItem(support_cache_, JSON.stringify(newMsgs.slice(-30))); } catch {}
        return newMsgs;
      });
    } catch (err)'''
content = re.sub(old_send_regex, new_send, content, flags=re.DOTALL)

with open(r'frontend\src\components\support\SupportChatWidget.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
