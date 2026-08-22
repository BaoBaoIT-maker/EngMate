import React, { useEffect, useState } from 'react';
import useThemeStore from '../../store/useThemeStore';
import api from '../../services/api';

// ─── Edit Drawer ──────────────────────────────────────────────────────────────
function EditDrawer({ word, onClose, onSaved, t }) {
  const [form, setForm] = useState({
    word: word?.word || '',
    phonetic: word?.phonetic || '',
    meaning: word?.vietnameseMeaning || '',
    definition: word?.definition || '',
    examples: Array.isArray(word?.examples) ? word.examples.join('\n') : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.word.trim() || !form.meaning.trim()) {
      setError('Từ vựng và Nghĩa không được để trống');
      return;
    }

    try {
      setLoading(true);
      await api.patch(`/flashcards/custom/${word.id}`, {
        word: form.word.trim(),
        phonetic: form.phonetic.trim(),
        meaning: form.meaning.trim(),
        definition: form.definition.trim(),
        examples: form.examples.split('\n').filter(e => e.trim() !== ''),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.875rem',
    borderRadius: 8,
    border: `1.5px solid ${t.inputBorder || t.cardBorder}`,
    background: t.inputBg || t.card,
    color: t.text,
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
  };

  const labelStyle = {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: t.textMuted,
    marginBottom: '0.35rem',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 10 }}
      />
      {/* Drawer */}
      <div
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '100%',
          background: t.bg, zIndex: 20, display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.28s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `-8px 0 32px rgba(0,0,0,0.25)`,
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${t.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: t.text }}>✏️ Sửa từ vựng</div>
            <div style={{ fontSize: '0.78rem', color: t.textMuted, marginTop: 2 }}>Chỉnh sửa từ vựng cá nhân của bạn</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem' }}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.65rem 1rem', color: '#ef4444', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div>
            <label style={labelStyle}>Từ vựng *</label>
            <input name="word" value={form.word} onChange={handleChange} style={inputStyle} placeholder="e.g. ephemeral" />
          </div>

          <div>
            <label style={labelStyle}>Phiên âm</label>
            <input name="phonetic" value={form.phonetic} onChange={handleChange} style={inputStyle} placeholder="e.g. /ɪˈfem.ər.əl/" />
          </div>

          <div>
            <label style={labelStyle}>Nghĩa tiếng Việt *</label>
            <input name="meaning" value={form.meaning} onChange={handleChange} style={inputStyle} placeholder="e.g. Phù du, ngắn ngủi" />
          </div>

          <div>
            <label style={labelStyle}>Định nghĩa (tiếng Anh)</label>
            <textarea name="definition" value={form.definition} onChange={handleChange} style={{ ...inputStyle, minHeight: 72 }} placeholder="e.g. Lasting for a very short time..." />
          </div>

          <div>
            <label style={labelStyle}>Ví dụ (mỗi dòng 1 câu)</label>
            <textarea name="examples" value={form.examples} onChange={handleChange} style={{ ...inputStyle, minHeight: 80 }} placeholder="e.g. The ephemeral beauty of cherry blossoms..." />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', borderRadius: 8, border: `1.5px solid ${t.cardBorder}`, background: 'transparent', color: t.text, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: '0.75rem', borderRadius: 8, border: 'none', background: `linear-gradient(135deg, #F0B429, #D4920A)`, color: '#1a1a2e', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Main LearnedWordsPanel ───────────────────────────────────────────────────
export default function LearnedWordsPanel({ isOpen, onClose, type, topicId, courseTitle }) {
  const { getTheme } = useThemeStore();
  const t = getTheme();

  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingWord, setEditingWord] = useState(null);   // word object being edited
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // id being deleted
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isOpen) fetchWords();
  }, [isOpen, type, topicId, courseTitle]);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const params = { type };
      if (type === 'topic') params.topicId = topicId;
      if (type === 'course') params.course = courseTitle;
      const res = await api.get('/flashcards/learned', { params });
      setWords(res.data || []);
    } catch (error) {
      console.error('Failed to fetch learned words:', error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (text) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await api.delete(`/flashcards/${id}`);
      setWords(prev => prev.filter(w => w.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  const iconBtnStyle = (color) => ({
    background: 'transparent',
    border: 'none',
    color,
    cursor: 'pointer',
    padding: '0.3rem',
    borderRadius: 6,
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
      {/* Main Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }}
      />

      {/* Side Panel */}
      <div
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 420,
          background: t.bg, borderLeft: `1px solid ${t.cardBorder}`, boxShadow: `-4px 0 32px rgba(0,0,0,0.3)`,
          display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s ease',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${t.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: t.text, margin: 0 }}>
            Danh sách từ đã học
            {words.length > 0 && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: t.textMuted, fontWeight: 500 }}>
                ({words.length} từ)
              </span>
            )}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', padding: '0.5rem', fontSize: '1rem' }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {loading ? (
            <div style={{ color: t.textMuted, textAlign: 'center', marginTop: '2rem' }}>Đang tải...</div>
          ) : words.length === 0 ? (
            <div style={{ color: t.textMuted, textAlign: 'center', marginTop: '2rem' }}>Chưa có từ vựng nào.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {words.map((w) => (
                <div
                  key={w.id || w.word}
                  style={{ padding: '1rem', background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, transition: 'border-color 0.2s' }}
                >
                  {/* Top row: word + actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: t.text }}>{w.word}</div>
                      {w.phonetic && <div style={{ fontSize: '0.8rem', color: t.textMuted }}>{w.phonetic}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                      {/* Play */}
                      <button
                        onClick={() => playAudio(w.word)}
                        title="Phát âm"
                        style={iconBtnStyle(t.gold)}
                      >🔊</button>

                      {/* Edit & Delete — chỉ cho custom */}
                      {w.type === 'custom' && (
                        <>
                          <button
                            onClick={() => { setEditingWord(w); setConfirmDeleteId(null); }}
                            title="Sửa từ vựng"
                            style={iconBtnStyle('#60A5FA')}
                          >✏️</button>
                          <button
                            onClick={() => setConfirmDeleteId(confirmDeleteId === w.id ? null : w.id)}
                            title="Xóa từ vựng"
                            style={iconBtnStyle('#F87171')}
                          >🗑️</button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Meaning */}
                  <div style={{ fontSize: '0.875rem', color: t.text, marginBottom: '0.6rem' }}>{w.vietnameseMeaning}</div>

                  {/* Inline Delete Confirm */}
                  {confirmDeleteId === w.id && (
                    <div style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: 8,
                      padding: '0.6rem 0.875rem',
                      marginBottom: '0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      animation: 'fadeIn 0.15s ease',
                    }}>
                      <span style={{ fontSize: '0.8rem', color: '#F87171', fontWeight: 600 }}>
                        Xóa từ &ldquo;{w.word}&rdquo;?
                      </span>
                      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: `1px solid ${t.cardBorder}`, background: 'transparent', color: t.text, fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleDelete(w.id)}
                          disabled={deletingId === w.id}
                          style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700, opacity: deletingId === w.id ? 0.6 : 1 }}
                        >
                          {deletingId === w.id ? '...' : 'Xóa'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Progress badges */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', padding: '0.18rem 0.45rem', borderRadius: 5, background: 'rgba(16,185,129,0.1)', color: '#10B981', fontWeight: 700 }}>
                      Box {w.progress?.boxLevel || 1}
                    </span>
                    <span style={{ fontSize: '0.68rem', padding: '0.18rem 0.45rem', borderRadius: 5, background: t.goldBg, color: t.gold, fontWeight: 700 }}>
                      Int: {w.progress?.interval || 0}d
                    </span>
                    {w.type === 'custom' && (
                      <span style={{ fontSize: '0.68rem', padding: '0.18rem 0.45rem', borderRadius: 5, background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', fontWeight: 700 }}>
                        Custom
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Drawer (nested inside panel) */}
        {editingWord && (
          <EditDrawer
            word={editingWord}
            t={t}
            onClose={() => setEditingWord(null)}
            onSaved={fetchWords}
          />
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
