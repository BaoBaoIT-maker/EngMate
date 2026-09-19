import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useThemeStore from '../../../store/useThemeStore';
import { getTopics } from '../../../services/flashcardService';
import AddFlashcardModal from './AddFlashcardModal';
import LearnedWordsPanel from './LearnedWordsPanel';

// Helper emoji picker for topics
function getTopicIcon(name = '', category = '') {
  const text = (name + ' ' + category).toLowerCase();
  if (text.includes('business') || text.includes('kinh doanh') || text.includes('negotiation') || text.includes('workplace')) return '💼';
  if (text.includes('travel') || text.includes('du lịch') || text.includes('hospitality')) return '✈️';
  if (text.includes('medical') || text.includes('y tế') || text.includes('health') || text.includes('sức khỏe')) return '🩺';
  if (text.includes('finance') || text.includes('tài chính') || text.includes('investment')) return '📈';
  if (text.includes('academic') || text.includes('ielts') || text.includes('học thuật') || text.includes('writing')) return '🎓';
  if (text.includes('communication') || text.includes('giao tiếp') || text.includes('daily') || text.includes('hội thoại')) return '🤝';
  if (text.includes('tech') || text.includes('công nghệ') || text.includes('it')) return '💻';
  if (text.includes('food') || text.includes('ẩm thực') || text.includes('restaurant')) return '🍽️';
  return '📚';
}

const COLOR_CYCLE = ['#F0B429', '#10B981', '#8B5CF6', '#3B82F6', '#EF4444', '#EC4899'];

/* ─── Skeleton Loading ─── */
function FlashcardsSkeleton() {
  return (
    <div
      style={{
        maxWidth: '1140px',
        margin: '0 auto',
        padding: '0 20px 48px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Toolbar skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ width: '220px', height: '28px', borderRadius: '8px', background: 'rgba(240,180,41,0.08)', marginBottom: '8px' }} />
          <div style={{ width: '320px', height: '16px', borderRadius: '6px', background: 'rgba(240,180,41,0.05)' }} />
        </div>
        <div style={{ width: '150px', height: '42px', borderRadius: '999px', background: 'rgba(240,180,41,0.1)' }} />
      </div>

      {/* Segment control skeleton */}
      <div style={{ width: '380px', height: '44px', borderRadius: '16px', background: 'var(--card-bg)', border: '1.5px solid var(--card-border)' }} />

      {/* Banner skeleton */}
      <div style={{ height: '160px', borderRadius: '24px', background: 'rgba(240,180,41,0.08)', border: '1.5px solid rgba(240,180,41,0.2)' }} />

      {/* Grid skeleton */}
      <div className="bento-grid">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              height: '220px',
              borderRadius: '24px',
              background: 'var(--card-bg)',
              border: '1.5px solid var(--card-border)',
              padding: '24px',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Smart Review SM-2 Banner ─── */
function SmartReviewBanner({ onStart, onOpenLearned }) {
  const [startHov, setStartHov] = useState(false);
  const [listHov, setListHov] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        marginBottom: '28px',
        background: 'linear-gradient(135deg, rgba(240,180,41,0.14) 0%, rgba(212,150,10,0.08) 100%)',
        border: '1.5px solid rgba(240,180,41,0.28)',
        boxShadow: '0 4px 32px rgba(240,180,41,0.10), inset 0 1px 0 rgba(255,255,255,0.6)',
        padding: '32px 36px',
      }}
    >
      {/* Ambient glow blob */}
      <div
        style={{
          position: 'absolute',
          right: '-80px',
          top: '-80px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240,180,41,0.18) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* Decorative concentric dashed arcs */}
      <div
        style={{
          position: 'absolute',
          right: '36px',
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0.12,
          pointerEvents: 'none',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="55" stroke="#F0B429" strokeWidth="1.5" strokeDasharray="6 4" />
          <circle cx="60" cy="60" r="38" stroke="#F0B429" strokeWidth="1" />
        </svg>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div>
          {/* Verified badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'rgba(240,180,41,0.18)',
              border: '1px solid rgba(240,180,41,0.35)',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 0L6.5 4.2L11 5.5L6.5 6.8L5.5 11L4.5 6.8L0 5.5L4.5 4.2L5.5 0Z" fill="#C9920A" />
            </svg>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#C9920A', letterSpacing: '0.1em' }}>
              THUẬT TOÁN ĐƯỢC KIỂM CHỨNG
            </span>
          </div>

          <h2
            style={{
              margin: '0 0 8px',
              fontSize: 'clamp(1.2rem, 2.5vw, 1.7rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--fg)',
              lineHeight: 1.15,
            }}
          >
            Ôn tập tổng hợp thông minh
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: 'var(--fg-2)',
              lineHeight: 1.6,
              maxWidth: '480px',
            }}
          >
            Hệ thống tự động chọn <strong style={{ color: 'var(--fg)' }}>25 thẻ</strong> bạn sắp quên nhất — ôn đúng lúc, nhớ gấp đôi.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onOpenLearned}
            onMouseEnter={() => setListHov(true)}
            onMouseLeave={() => setListHov(false)}
            style={{
              padding: '11px 20px',
              borderRadius: '999px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.04em',
              outline: 'none',
              background: listHov ? 'rgba(240,180,41,0.12)' : 'transparent',
              border: '1.5px solid rgba(240,180,41,0.40)',
              color: '#C9920A',
              transition: 'all 0.18s ease',
            }}
          >
            Xem từ đã thuộc
          </button>

          <button
            type="button"
            onClick={onStart}
            onMouseEnter={() => setStartHov(true)}
            onMouseLeave={() => setStartHov(false)}
            style={{
              padding: '11px 22px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #F5BE36 0%, #D4960A 100%)',
              color: '#1C1407',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.05em',
              fontFamily: 'inherit',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: startHov
                ? '0 6px 24px rgba(240,180,41,0.55)'
                : '0 3px 16px rgba(240,180,41,0.35)',
              transform: startHov ? 'translateY(-1px)' : 'translateY(0)',
              transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 7h8M7 3.5l4 3.5-4 3.5"
                stroke="#1C1407"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Bắt đầu ôn tập · 25 thẻ
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Topic Card Component ─── */
function TopicCard({ topic, color, onStart, onOpenLearned }) {
  const [hov, setHov] = useState(false);

  const doneCount = topic.learnedCount || Math.floor((topic.wordCount || 80) * 0.4);
  const totalCount = topic.wordCount || 80;
  const pct = Math.min(100, Math.round((doneCount / (totalCount || 1)) * 100));

  const icon = topic.icon || getTopicIcon(topic.name, topic.category);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--card-bg)',
        border: '1.5px solid var(--card-border)',
        borderRadius: '24px',
        boxShadow: hov
          ? `0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px ${color}35`
          : 'var(--card-shadow)',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        cursor: 'pointer',
      }}
    >
      {/* Top highlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'var(--card-highlight)',
          pointerEvents: 'none',
        }}
      />

      {/* Top: Icon + Tag */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: `${color}14`,
            border: `1.5px solid ${color}25`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: '999px',
            background: `${color}12`,
            border: `1px solid ${color}28`,
            fontSize: '10.5px',
            fontWeight: 700,
            color,
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
          }}
        >
          {topic.category || topic.categoryCode || 'Chủ đề'}
        </span>
      </div>

      {/* Title + Sub */}
      <div>
        <h3
          style={{
            margin: '0 0 4px',
            fontSize: '16.5px',
            fontWeight: 800,
            color: 'var(--fg)',
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
          }}
        >
          {topic.name}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '12.5px',
            color: 'var(--fg-3)',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {topic.description || `${totalCount} từ vựng chất lượng`}
        </p>
      </div>

      {/* Progress */}
      <div style={{ marginTop: 'auto' }}>
        <div
          style={{
            height: '6px',
            borderRadius: '999px',
            background: `${color}15`,
            overflow: 'hidden',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              borderRadius: '999px',
              background: `linear-gradient(90deg, ${color}CC, ${color})`,
              transition: 'width 0.8s cubic-bezier(0.34, 1, 0.64, 1)',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'var(--fg-3)', fontWeight: 500 }}>
            {doneCount} từ đã học
            <span style={{ color, fontWeight: 700, marginLeft: '4px' }}>({pct}%)</span>
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            {onOpenLearned && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLearned();
                }}
                title="Xem danh sách từ"
                style={{
                  padding: 0,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--fg-3)',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              >
                📋 Xem
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              style={{
                padding: 0,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: 700,
                color,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                outline: 'none',
                opacity: hov ? 1 : 0.85,
                transition: 'opacity 0.15s',
              }}
            >
              Học ngay
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6h8M6.5 2.5L10 6l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN FLASHCARDS PAGE
══════════════════════════════════════════════════ */
export default function FlashcardsPage() {
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addHov, setAddHov] = useState(false);

  // States for Side Panel
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelType, setPanelType] = useState('topic');
  const [panelTopicId, setPanelTopicId] = useState(null);
  const [panelCourse, setPanelCourse] = useState(null);

  // Course / Segment filter state
  const [activeSegment, setActiveSegment] = useState('ALL');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const data = (await getTopics()) || [];
      setTopics(data);

      const uniqueCategories = [...new Set(data.map((t) => t.category || t.categoryCode).filter(Boolean))];
      if (uniqueCategories.length > 0 && activeSegment === 'ALL') {
        setActiveSegment(uniqueCategories[0]);
      }
    } catch (err) {
      console.error('Failed to load topics:', err);
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

  // Build unique segments from real topics + Personal
  const segments = useMemo(() => {
    const categories = [...new Set(topics.map((t) => t.category || t.categoryCode).filter(Boolean))];
    const list = categories.map((c) => ({
      id: c,
      label: c.toUpperCase().includes('TOEIC')
        ? 'TOEIC 900+'
        : c.toUpperCase().includes('IELTS')
        ? 'IELTS 8.0+'
        : c.toUpperCase().includes('COMMUNICATION') || c.toLowerCase().includes('tiếp')
        ? 'Giao tiếp thực chiến'
        : c,
    }));
    list.push({ id: 'personal', label: 'Từ vựng cá nhân' });
    return list;
  }, [topics]);

  // Filter topics
  const displayedTopics = useMemo(() => {
    if (activeSegment === 'personal') return [];
    return topics.filter((t) => (t.category || t.categoryCode) === activeSegment);
  }, [topics, activeSegment]);

  if (loading) {
    return <FlashcardsSkeleton />;
  }

  return (
    <div
      style={{
        maxWidth: '1140px',
        margin: '0 auto',
        padding: '0 20px 48px',
        width: '100%',
        animation: 'slide-up 0.4s ease both',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header Toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
        {/* Title row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h1
              style={{
                margin: '0 0 4px',
                fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--fg)',
                lineHeight: 1.1,
              }}
            >
              Thư viện Thẻ Từ Vựng
            </h1>
            <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--fg-3)', fontWeight: 500 }}>
              Lộ trình lặp lại ngắt quãng — cá nhân hóa theo tiến độ của bạn
            </p>
          </div>

          {/* Add button with AI sparkle badge */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            onMouseEnter={() => setAddHov(true)}
            onMouseLeave={() => setAddHov(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #F5BE36 0%, #D4960A 100%)',
              color: '#1C1407',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.05em',
              fontFamily: 'inherit',
              outline: 'none',
              boxShadow: addHov
                ? '0 6px 24px rgba(240,180,41,0.50)'
                : '0 3px 14px rgba(240,180,41,0.32)',
              transform: addHov ? 'translateY(-1px)' : 'translateY(0)',
              transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '6px',
                background: 'rgba(139,92,246,0.25)',
                fontSize: '10px',
              }}
            >
              ✨
            </span>
            Thêm từ vựng
          </button>
        </div>

        {/* Segmented Control */}
        <div
          style={{
            display: 'flex',
            padding: '4px',
            borderRadius: '16px',
            gap: '2px',
            background: 'var(--card-bg)',
            border: '1.5px solid var(--card-border)',
            width: 'fit-content',
            flexWrap: 'wrap',
          }}
        >
          {segments.map(({ id, label }) => {
            const isActive = activeSegment === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSegment(id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive
                    ? 'linear-gradient(135deg, #F5BE36 0%, #D4960A 100%)'
                    : 'transparent',
                  color: isActive ? '#1C1407' : 'var(--fg-2)',
                  fontWeight: isActive ? 800 : 500,
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxShadow: isActive ? '0 2px 10px rgba(240,180,41,0.30)' : 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SM-2 Smart Review Banner */}
      <SmartReviewBanner
        onStart={() =>
          startSession(activeSegment === 'personal' ? 'custom' : 'course', null, activeSegment)
        }
        onOpenLearned={() =>
          openPanel(activeSegment === 'personal' ? 'custom' : 'course', null, activeSegment)
        }
      />

      {/* 3. Cards Grid */}
      {activeSegment === 'personal' ? (
        <div className="bento-grid">
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1.5px solid var(--card-border)',
              borderRadius: '24px',
              boxShadow: 'var(--card-shadow)',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'rgba(139,92,246,0.12)',
                  border: '1.5px solid rgba(139,92,246,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}
              >
                👤
              </div>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'rgba(139,92,246,0.12)',
                  border: '1px solid rgba(139,92,246,0.28)',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#8B5CF6',
                  letterSpacing: '0.06em',
                }}
              >
                Cá nhân
              </span>
            </div>

            <div>
              <h3
                style={{
                  margin: '0 0 4px',
                  fontSize: '16.5px',
                  fontWeight: 800,
                  color: 'var(--fg)',
                  letterSpacing: '-0.02em',
                }}
              >
                Từ tự thêm của bạn
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--fg-3)', fontWeight: 500 }}>
                Ôn tập độc lập những từ vựng mà bạn đã tự thêm hoặc AI tạo tự động.
              </p>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => openPanel('custom')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--card-border)',
                  background: 'transparent',
                  color: 'var(--fg-2)',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                📋 Xem danh sách
              </button>

              <button
                type="button"
                onClick={() => startSession('custom', null, null, 'learn')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #F5BE36 0%, #D4960A 100%)',
                  color: '#1C1407',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                Học ngay ⚡
              </button>
            </div>
          </div>
        </div>
      ) : displayedTopics.length > 0 ? (
        <div className="bento-grid">
          {displayedTopics.map((topic, index) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              color={COLOR_CYCLE[index % COLOR_CYCLE.length]}
              onStart={() => startSession('system', topic.id, null, 'learn')}
              onOpenLearned={() => openPanel('topic', topic.id, null)}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            borderRadius: '24px',
            background: 'var(--card-bg)',
            border: '1.5px solid var(--card-border)',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📖</div>
          <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: 'var(--fg)' }}>
            Chưa có chủ đề nào trong phần này
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--fg-3)' }}>
            Bạn có thể thêm từ vựng mới bằng AI hoặc chọn khóa học khác ở trên.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '10px 22px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #F5BE36 0%, #D4960A 100%)',
              color: '#1C1407',
              fontWeight: 800,
              fontSize: '13px',
            }}
          >
            + Thêm từ vựng mới
          </button>
        </div>
      )}

      {/* Add Word Modal */}
      {showAddModal && (
        <AddFlashcardModal
          onClose={() => setShowAddModal(false)}
          onCreated={fetchTopics}
        />
      )}

      {/* Learned Words Drawer Panel */}
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
