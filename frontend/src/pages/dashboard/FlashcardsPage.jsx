import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/dashboard/Header';
import useThemeStore from '../../store/useThemeStore';
import { Icon } from '../../components/icons';
import api from '../../services/api';
import AddFlashcardModal from './AddFlashcardModal';
import LearnedWordsPanel from './LearnedWordsPanel';

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

function FlashcardsSkeleton({ t, isDark }) {
  const skFrom = isDark ? 'rgba(47,158,86,0.08)' : '#F0EAD9';
  const skTo   = isDark ? 'rgba(47,158,86,0.18)' : '#E5DBCA';
  const cardStyle = {
    background: t.card,
    borderRadius: 16,
    padding: '1.25rem',
    border: `1px solid ${t.cardBorder}`,
    boxShadow: `0 4px 12px ${t.shadow}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  };

  return (
    <div className="screen-enter w-full max-w-5xl mx-auto pb-20"
      style={{ '--sk-from': skFrom, '--sk-to': skTo }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <Sk w={160} h={28} r={8} />
          <Sk w={240} h={14} r={6} style={{ marginTop: 8 }} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Sk w={130} h={40} r={10} />
          <Sk w={140} h={40} r={10} />
        </div>
      </div>

      {/* General review card */}
      <div style={{ marginBottom: '2rem' }}>
        <Sk w={200} h={20} r={6} style={{ marginBottom: '1rem' }} />
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Sk w="50%" h={20} r={6} />
            <Sk w={100} h={24} r={6} />
          </div>
          <Sk w="90%" h={14} r={5} />
          <Sk w="75%" h={14} r={5} />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Sk w="100%" h={38} r={8} />
            <Sk w="100%" h={38} r={8} />
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px dashed ${t.cardBorder}`, marginBottom: '2rem' }} />

      {/* Custom vocab */}
      <div style={{ marginBottom: '2rem' }}>
        <Sk w={180} h={20} r={6} style={{ marginBottom: '1rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          <div style={{ ...cardStyle }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Sk w="55%" h={18} r={6} />
              <Sk w={60} h={22} r={6} />
            </div>
            <Sk w="85%" h={13} r={5} />
            <Sk w="70%" h={13} r={5} />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Sk w="100%" h={36} r={8} />
              <Sk w="100%" h={36} r={8} />
            </div>
          </div>
        </div>
      </div>

      {/* System topic cards grid */}
      <div>
        <Sk w={200} h={20} r={6} style={{ marginBottom: '1rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ ...cardStyle, animationDelay: `${i * 0.08}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Sk w="55%" h={18} r={6} />
                <Sk w={50} h={22} r={6} />
              </div>
              <Sk w="80%" h={13} r={5} />
              <Sk w={`${50 + (i % 3) * 15}%`} h={13} r={5} />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Sk w="100%" h={36} r={8} />
                <Sk w="100%" h={36} r={8} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes sk-shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
}

export default function FlashcardsPage() {
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // States for Side Panel
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelType, setPanelType] = useState('topic'); // 'topic', 'course', 'custom'
  const [panelTopicId, setPanelTopicId] = useState(null);
  const [panelCourse, setPanelCourse] = useState(null);

  // States for Course Switcher
  const [activeCourse, setActiveCourse] = useState(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/flashcards/topics');
      const data = res.data || [];
      setTopics(data);

      const uniqueCategories = [...new Set(data.map(t => t.category))];
      if (uniqueCategories.length > 0) {
        setActiveCourse(uniqueCategories[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startSession = (type, topicId = null, course = null, mode = null) => {
    let url = `/dashboard/flashcards/session?type=${type}`;
    if (topicId) url += `&topicId=${topicId}`;
    if (course) url += `&course=${course}`;
    if (mode) url += `&mode=${mode}`;
    navigate(url);
  };

  const openPanel = (type, topicId = null, course = null) => {
    setPanelType(type);
    setPanelTopicId(topicId);
    setPanelCourse(course);
    setPanelOpen(true);
  };

  // Lọc topics theo course đang chọn
  const activeTopics = topics.filter(t => t.category === activeCourse);
  const uniqueCategories = [...new Set(topics.map(t => t.category))];

  const cardStyle = {
    background: t.card,
    borderRadius: 16,
    padding: '1.25rem',
    border: `1px solid ${t.cardBorder}`,
    boxShadow: `0 4px 12px ${t.shadow}`,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease',
  };

  const actionButtonStyle = (isPrimary) => ({
    flex: 1,
    padding: '0.6rem 0',
    borderRadius: 8,
    border: 'none',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
    textAlign: 'center',
    background: isPrimary ? `linear-gradient(135deg, ${t.gold}, ${t.goldDark})` : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    color: isPrimary ? '#fff' : t.text,
  });

  return (
    <div className="screen-enter w-full max-w-5xl mx-auto pb-20">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Header title="Flashcards" subtitle="Lựa chọn chủ đề để bắt đầu ôn tập" />
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {uniqueCategories.length > 0 && (
            <select 
              value={activeCourse || ''} 
              onChange={(e) => setActiveCourse(e.target.value)}
              style={{
                background: t.card, color: t.text, border: `1px solid ${t.cardBorder}`,
                padding: '0.65rem 1rem', borderRadius: 10, fontWeight: 700, outline: 'none', cursor: 'pointer'
              }}
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>Khóa học {cat}</option>
              ))}
            </select>
          )}

          <button 
            onClick={() => setShowAddModal(true)}
            style={{ 
              background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`, 
              color: '#fff', border: 'none', borderRadius: 10, padding: '0.65rem 1.25rem',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>+</span> Thêm từ vựng
          </button>
        </div>
      </div>

      {loading ? (
        <FlashcardsSkeleton t={t} isDark={isDark} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem' }}>
          
          {/* General Review for Active Course */}
          {activeCourse && (
            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: t.text, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🌟 Ôn tập tổng hợp
              </h2>
              <div style={{ ...cardStyle, background: isDark ? 'linear-gradient(135deg, rgba(240,180,41,0.1), rgba(240,180,41,0.02))' : 'linear-gradient(135deg, rgba(240,180,41,0.15), rgba(240,180,41,0.05))', border: `1px solid rgba(240,180,41,0.3)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: t.gold }}>Khóa học {activeCourse} & Từ tự thêm</div>
                  <div style={{ background: t.goldBg, color: t.gold, padding: '0.25rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>SM-2 Optimized</div>
                </div>
                <div style={{ fontSize: '0.9rem', color: t.textMuted, lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Hệ thống sẽ tự động trộn các từ vựng đến hạn ôn tập của khóa học {activeCourse} và các từ vựng cá nhân mà bạn đã thêm. Học theo cách này giúp tối ưu hóa thuật toán ghi nhớ dài hạn.
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                  <button onClick={() => openPanel('course', null, activeCourse)} style={actionButtonStyle(false)}>
                    📋 Danh sách từ đã học
                  </button>
                  <button onClick={() => startSession('course', null, activeCourse)} style={actionButtonStyle(true)}>
                    ⚡ Học ngay
                  </button>
                </div>
              </div>
            </section>
          )}

          <hr style={{ border: 'none', borderTop: `1px dashed ${t.cardBorder}`, margin: '0' }} />

          {/* Custom Vocabulary */}
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: t.text, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              👤 Từ vựng cá nhân
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: t.text }}>Từ tự thêm của bạn</div>
                  <div style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', padding: '0.25rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>Custom</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: t.textMuted, lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Ôn tập độc lập những từ vựng mà bạn đã tự thêm hoặc AI tạo tự động.
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                  <button onClick={() => openPanel('custom')} style={actionButtonStyle(false)}>
                    📋 Xem danh sách
                  </button>
                  <button onClick={() => startSession('custom', null, null, 'learn')} style={actionButtonStyle(true)}>
                    ⚡ Học ngay
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* System Topics for Active Course */}
          {activeCourse && (
            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: t.text, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📚 Chủ đề của {activeCourse}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {activeTopics.map(topic => (
                  <div key={topic.id} style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: t.text }}>{topic.name}</div>
                      <div style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: t.textMuted, padding: '0.25rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>
                        {topic.wordCount} từ
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: t.textMuted, lineHeight: 1.5, minHeight: '40px', marginBottom: '1.5rem' }}>
                      {topic.description || 'Chủ đề từ vựng hệ thống.'}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                      <button onClick={() => openPanel('topic', topic.id, null)} style={actionButtonStyle(false)}>
                        📋 Xem từ đã học
                      </button>
                      <button onClick={() => startSession('system', topic.id, null, 'learn')} style={actionButtonStyle(true)}>
                        ⚡ Học ngay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {showAddModal && (
        <AddFlashcardModal onClose={() => setShowAddModal(false)} />
      )}

      <LearnedWordsPanel 
        isOpen={panelOpen} 
        onClose={() => setPanelOpen(false)} 
        type={panelType} 
        topicId={panelTopicId}
        courseTitle={panelCourse}
      />
    </div>
  );
}
