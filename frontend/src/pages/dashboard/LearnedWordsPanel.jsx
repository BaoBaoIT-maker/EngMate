import React, { useEffect, useState } from 'react';
import useThemeStore from '../../store/useThemeStore';
import api from '../../services/api';
import { Icon } from '../../components/icons';

export default function LearnedWordsPanel({ isOpen, onClose, type, topicId, courseTitle }) {
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();
  
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchWords();
    }
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

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }} 
      />

      {/* Side Panel */}
      <div 
        style={{ 
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 400, 
          background: t.bg, borderLeft: `1px solid ${t.cardBorder}`, boxShadow: `-4px 0 24px ${t.shadow}`,
          display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s ease'
        }}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${t.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: t.text }}>
            Danh sách từ đã học
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', padding: '0.5rem' }}>
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {loading ? (
            <div style={{ color: t.textMuted, textAlign: 'center', marginTop: '2rem' }}>Đang tải...</div>
          ) : words.length === 0 ? (
            <div style={{ color: t.textMuted, textAlign: 'center', marginTop: '2rem' }}>Chưa có từ vựng nào.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {words.map((w, idx) => (
                <div key={idx} style={{ padding: '1rem', background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: t.text }}>{w.word}</div>
                      {w.phonetic && <div style={{ fontSize: '0.85rem', color: t.textMuted }}>{w.phonetic}</div>}
                    </div>
                    <button 
                      onClick={() => playAudio(w.word)}
                      style={{ background: 'transparent', border: 'none', color: t.gold, cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                      🔊
                    </button>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: t.text, marginBottom: '0.75rem' }}>{w.vietnameseMeaning}</div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 6, background: 'rgba(16,185,129,0.1)', color: '#10B981', fontWeight: 700 }}>
                      Box {w.progress?.boxLevel || 1}
                    </span>
                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 6, background: t.goldBg, color: t.gold, fontWeight: 700 }}>
                      Int: {w.progress?.interval || 0}d
                    </span>
                    {w.type === 'custom' && (
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 6, background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', fontWeight: 700 }}>
                        Custom
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
