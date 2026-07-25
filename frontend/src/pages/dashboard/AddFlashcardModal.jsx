import React, { useState } from 'react';
import useThemeStore from '../../store/useThemeStore';
import api from '../../services/api';

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
      const res = await api.post('/flashcards/ai-generate', { word: formData.word });
      const aiData = res.data; // expect: phonetic, definition, meaning, examples (array)
      
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
      await api.post('/flashcards/custom', {
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
    width: '100%', padding: '0.75rem', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
    border: `1px solid ${t.cardBorder}`, color: t.text, outline: 'none', marginBottom: '1rem', fontFamily: 'inherit'
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: t.card, borderRadius: 16, width: '100%', maxWidth: 500, padding: '1.5rem', boxShadow: `0 20px 40px rgba(0,0,0,0.2)`, border: `1px solid ${t.cardBorder}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: t.text }}>Thêm từ vựng mới</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: t.textMuted, fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: t.textMuted, marginBottom: '0.3rem', fontWeight: 600 }}>Từ vựng (English) *</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input name="word" value={formData.word} onChange={handleChange} placeholder="e.g. meticulous" style={{ ...inputStyle, marginBottom: 0, flex: 1 }} required />
            <button type="button" onClick={handleAI} disabled={generating} style={{ background: `linear-gradient(135deg, #a855f7, #7e22ce)`, color: '#fff', border: 'none', borderRadius: 8, padding: '0 1rem', fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
              {generating ? '⏳ Đang sinh...' : '✨ Dùng AI điền'}
            </button>
          </div>
          <div style={{ marginBottom: '1rem' }}></div>

          <label style={{ display: 'block', fontSize: '0.85rem', color: t.textMuted, marginBottom: '0.3rem', fontWeight: 600 }}>Phiên âm (Phonetic)</label>
          <input name="phonetic" value={formData.phonetic} onChange={handleChange} placeholder="/məˈtɪk.jʊ.ləs/" style={inputStyle} />

          <label style={{ display: 'block', fontSize: '0.85rem', color: t.textMuted, marginBottom: '0.3rem', fontWeight: 600 }}>Nghĩa tiếng Việt *</label>
          <input name="meaning" value={formData.meaning} onChange={handleChange} placeholder="Tỉ mỉ, cẩn thận" style={inputStyle} required />

          <label style={{ display: 'block', fontSize: '0.85rem', color: t.textMuted, marginBottom: '0.3rem', fontWeight: 600 }}>Định nghĩa (Definition)</label>
          <textarea name="definition" value={formData.definition} onChange={handleChange} placeholder="Very careful and with great attention to every detail." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />

          <label style={{ display: 'block', fontSize: '0.85rem', color: t.textMuted, marginBottom: '0.3rem', fontWeight: 600 }}>Ví dụ (Mỗi ví dụ 1 dòng)</label>
          <textarea name="examples" value={formData.examples} onChange={handleChange} placeholder="He is very meticulous about his appearance." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: `1px solid ${t.cardBorder}`, color: t.text, borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
              Hủy
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.8rem', background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`, border: 'none', color: '#fff', borderRadius: 10, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Đang lưu...' : 'Lưu từ vựng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
