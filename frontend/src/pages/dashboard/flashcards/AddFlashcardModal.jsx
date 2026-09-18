import React, { useState } from 'react';
import useThemeStore from '../../../store/useThemeStore';
import { generateAiFlashcard, createCustomFlashcard } from '../../../services/flashcardService';

export default function AddFlashcardModal({ onClose }) {
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();

  const [formData, setFormData] = useState({
    word: '',
    phonetic: '',
    definition: '',
    meaning: '',
    examples: '' // Dạng text, mỗi ví dụ 1 dòng
  });
  
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAI = async () => {
    if (!formData.word.trim()) return alert("Vui lòng nhập từ vựng trước khi dùng AI!");
    
    try {
      setGenerating(true);
      const aiData = await generateAiFlashcard(formData.word);
      
      setFormData({
        word: aiData.word || formData.word,
        phonetic: aiData.phonetic || '',
        definition: aiData.definition || '',
        meaning: aiData.meaning || '',
        examples: Array.isArray(aiData.examples) ? aiData.examples.join('\n') : ''
      });
    } catch (err) {
      alert("AI sinh từ vựng thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.word || !formData.meaning) return alert("Từ vựng và Nghĩa là bắt buộc!");

    try {
      setLoading(true);
      await createCustomFlashcard({
        ...formData,
        examples: formData.examples.split('\n').filter(e => e.trim() !== '')
      });
      alert("Đã thêm từ mới thành công!");
      onClose();
    } catch (err) {
      alert("Lỗi thêm từ: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', 
    padding: '0.75rem 0.875rem', 
    borderRadius: 10, 
    background: t.inputBg,
    border: `1.5px solid ${t.inputBorder}`, 
    color: t.text, 
    outline: 'none', 
    marginBottom: '1rem',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: t.card, borderRadius: 20, width: '100%', maxWidth: 520, padding: '1.75rem', boxShadow: `0 24px 48px rgba(0,0,0,0.35)`, border: `1px solid ${t.cardBorder}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: t.text }}>✨ Thêm từ vựng mới</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: t.textMuted, fontSize: '1.5rem', cursor: 'pointer', padding: '0.25rem' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: t.textSub, marginBottom: '0.35rem', fontWeight: 700 }}>Từ vựng (English) *</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input name="word" value={formData.word} onChange={handleChange} placeholder="e.g. meticulous" style={{ ...inputStyle, marginBottom: 0, flex: 1 }} required />
            <button type="button" onClick={handleAI} disabled={generating} style={{ background: `linear-gradient(135deg, #8B5CF6, #6D28D9)`, color: '#fff', border: 'none', borderRadius: 10, padding: '0 1.25rem', fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>
              {generating ? '⏳ Đang sinh...' : '✨ Dùng AI điền'}
            </button>
          </div>
          <div style={{ marginBottom: '1rem' }}></div>

          <label style={{ display: 'block', fontSize: '0.85rem', color: t.textSub, marginBottom: '0.35rem', fontWeight: 700 }}>Phiên âm (Phonetic)</label>
          <input name="phonetic" value={formData.phonetic} onChange={handleChange} placeholder="/məˈtɪk.jʊ.ləs/" style={inputStyle} />

          <label style={{ display: 'block', fontSize: '0.85rem', color: t.textSub, marginBottom: '0.35rem', fontWeight: 700 }}>Nghĩa tiếng Việt *</label>
          <input name="meaning" value={formData.meaning} onChange={handleChange} placeholder="Tỉ mỉ, cẩn thận" style={inputStyle} required />

          <label style={{ display: 'block', fontSize: '0.85rem', color: t.textSub, marginBottom: '0.35rem', fontWeight: 700 }}>Định nghĩa (Definition)</label>
          <textarea name="definition" value={formData.definition} onChange={handleChange} placeholder="Very careful and with great attention to every detail." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />

          <label style={{ display: 'block', fontSize: '0.85rem', color: t.textSub, marginBottom: '0.35rem', fontWeight: 700 }}>Ví dụ (Mỗi ví dụ 1 dòng)</label>
          <textarea name="examples" value={formData.examples} onChange={handleChange} placeholder="He is very meticulous about his appearance." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: `1.5px solid ${t.cardBorder}`, color: t.text, borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
              Hủy
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1.2, padding: '0.8rem', background: `linear-gradient(135deg, ${t.green}, ${t.greenDark})`, border: 'none', color: '#fff', borderRadius: 10, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: isDark ? '0 4px 14px rgba(16,185,129,0.3)' : '0 4px 14px rgba(0,102,51,0.25)' }}>
              {loading ? 'Đang lưu...' : 'Lưu từ vựng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
