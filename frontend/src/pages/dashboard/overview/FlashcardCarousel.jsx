import React, { useState } from 'react';

const DEFAULT_CARDS = [
  {
    word: 'Meticulous',
    ipa: '/məˈtɪk.jʊ.ləs/',
    meaning: 'Tỉ mỉ, cẩn thận',
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.08)',
  },
  {
    word: 'Eloquent',
    ipa: '/ˈel.ə.kwənt/',
    meaning: 'Hùng hồn, lưu loát',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.08)',
  },
  {
    word: 'Resilient',
    ipa: '/rɪˈzɪl.i.ənt/',
    meaning: 'Kiên cường, bền bỉ',
    color: '#F0B429',
    bg: 'rgba(240, 180, 41, 0.10)',
  },
];

const PALETTE = ['#8B5CF6', '#10B981', '#F0B429', '#3B82F6', '#EC4899'];

function Eyebrow({ children }) {
  return (
    <p
      style={{
        fontSize: '10.5px',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--fg-3)',
        margin: '0 0 6px',
      }}
    >
      {children}
    </p>
  );
}

function NavBtn({ onClick, dir }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        border: '1.5px solid var(--card-border)',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--fg-2)',
        outline: 'none',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        {dir === 'left' ? (
          <path
            d="M9 2L4 7l5 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M5 2l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}

function SpeakerBtn({ onSpeak }) {
  return (
    <button
      type="button"
      onClick={onSpeak}
      title="Phát âm từ này"
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        border: '1.5px solid rgba(240,180,41,0.25)',
        background: 'rgba(240,180,41,0.08)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        outline: 'none',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M2 5h2.5L8 2v10L4.5 9H2V5z"
          stroke="#F0B429"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M10 4.5c1 .8 1 4.2 0 5"
          stroke="#F0B429"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

export default function FlashcardCarousel({ recent }) {
  const [active, setActive] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Normalize recent words or fallback to DEFAULT_CARDS
  const cards = recent && recent.length > 0
    ? recent.map((item, idx) => ({
        word: item.word || 'Vocabulary',
        ipa: item.ipa || item.phonetic || '',
        meaning: item.meaning || item.vietnameseMeaning || 'Nghĩa từ vựng',
        color: PALETTE[idx % PALETTE.length],
        bg: `${PALETTE[idx % PALETTE.length]}12`,
      }))
    : DEFAULT_CARDS;

  const card = cards[active] || cards[0];

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(card.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const prevCard = () => {
    setActive((curr) => (curr - 1 + cards.length) % cards.length);
    setFlipped(false);
  };

  const nextCard = () => {
    setActive((curr) => (curr + 1) % cards.length);
    setFlipped(false);
  };

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1.5px solid var(--card-border)',
        borderRadius: '24px',
        boxShadow: 'var(--card-shadow)',
        padding: '28px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Top highlight line */}
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

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <Eyebrow>Ôn tập gần đây</Eyebrow>
          <h3
            style={{
              margin: 0,
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--fg)',
              letterSpacing: '-0.02em',
            }}
          >
            Thẻ từ vựng
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <NavBtn onClick={prevCard} dir="left" />
          <NavBtn onClick={nextCard} dir="right" />
        </div>
      </div>

      {/* Flip Card Container */}
      <div
        onClick={() => setFlipped((f) => !f)}
        style={{
          cursor: 'pointer',
          perspective: '1000px',
          flex: 1,
          minHeight: '170px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '170px',
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Front */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderRadius: '18px',
              padding: '24px',
              background: card.bg,
              border: `1.5px solid ${card.color}25`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '6px',
            }}
          >
            {/* Speaker Top-right */}
            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
              <SpeakerBtn onSpeak={handleSpeak} />
            </div>

            <div
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 800,
                color: 'var(--fg)',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              {card.word}
            </div>
            {card.ipa && (
              <div style={{ fontSize: '13.5px', color: 'var(--fg-3)', fontStyle: 'italic' }}>
                {card.ipa}
              </div>
            )}

            {/* Hint */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: 'var(--fg-3)',
                fontSize: '11px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v5.5L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Nhấn để lật xem nghĩa
            </div>
          </div>

          {/* Back */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: '18px',
              padding: '24px',
              background: card.bg,
              border: `1.5px solid ${card.color}30`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: 'var(--fg-3)',
                marginBottom: '8px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Nghĩa tiếng Việt
            </div>
            <div
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: card.color,
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
              }}
            >
              {card.meaning}
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
        {cards.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setActive(i);
              setFlipped(false);
            }}
            style={{
              width: i === active ? '20px' : '6px',
              height: '6px',
              borderRadius: '999px',
              background: i === active ? '#F0B429' : 'var(--card-border)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
