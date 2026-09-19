import React, { useState } from 'react';
import { generateAiFlashcard, createCustomFlashcard } from '../../../services/flashcardService';

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

function FieldRow({ label, value, onChange, placeholder, color, mono, small, multiline }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label
        style={{
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--fg-3)',
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          style={{
            padding: '8px 12px',
            borderRadius: '12px',
            border: '1.5px solid var(--card-border)',
            background: 'var(--card-bg)',
            color: color || 'var(--fg)',
            fontFamily: 'inherit',
            fontSize: small ? '12.5px' : '14px',
            lineHeight: 1.5,
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            width: '100%',
          }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            padding: '8px 12px',
            borderRadius: '12px',
            border: '1.5px solid var(--card-border)',
            background: 'var(--card-bg)',
            color: color || 'var(--fg)',
            fontFamily: 'inherit',
            fontSize: small ? '12.5px' : '14px',
            fontWeight: mono ? 600 : 500,
            fontStyle: mono ? 'italic' : 'normal',
            lineHeight: 1.5,
            outline: 'none',
            boxSizing: 'border-box',
            width: '100%',
          }}
        />
      )}
    </div>
  );
}

export default function AddFlashcardModal({ onClose, onCreated }) {
  const [word, setWord] = useState('');
  const [formData, setFormData] = useState({
    phonetic: '',
    meaning: '',
    definition: '',
    examples: '',
  });

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filled, setFilled] = useState(false);
  const [saveHov, setSaveHov] = useState(false);
  const [error, setError] = useState('');

  const handleAI = async () => {
    if (!word.trim()) {
      setError('Vui lòng nhập từ vựng trước khi dùng AI!');
      return;
    }

    try {
      setError('');
      setGenerating(true);
      const aiData = await generateAiFlashcard(word.trim());

      setFormData({
        phonetic: aiData.phonetic || '',
        meaning: aiData.meaning || aiData.vietnameseMeaning || '',
        definition: aiData.definition || aiData.definitionText || '',
        examples: Array.isArray(aiData.examples)
          ? aiData.examples.join('\n')
          : typeof aiData.examples === 'string'
          ? aiData.examples
          : '',
      });
      setFilled(true);
    } catch (err) {
      setError('AI sinh từ thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!word.trim() || !formData.meaning.trim()) {
      setError('Từ vựng và Nghĩa tiếng Việt là bắt buộc!');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await createCustomFlashcard({
        word: word.trim(),
        phonetic: formData.phonetic.trim(),
        meaning: formData.meaning.trim(),
        definition: formData.definition.trim(),
        examples: formData.examples
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      });

      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      setError('Lỗi khi lưu từ: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(12, 8, 2, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal Dialog */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          zIndex: 201,
          transform: 'translate(-50%, -50%)',
          width: 'min(520px, calc(100vw - 32px))',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--card-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid var(--card-border)',
          borderRadius: '28px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.30), 0 0 0 1px rgba(240,180,41,0.10)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxSizing: 'border-box',
        }}
      >
        {/* Inner highlight line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'var(--card-highlight)',
            borderRadius: '28px 28px 0 0',
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                }}
              >
                ✨
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#8B5CF6',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Trợ lý AI
              </span>
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--fg)',
                letterSpacing: '-0.025em',
              }}
            >
              Thêm từ mới vào kho
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
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
              color: 'var(--fg-3)',
              outline: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 2l10 10M12 2L2 12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {/* Word input row */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={word}
            onChange={(e) => {
              setWord(e.target.value);
              if (!filled) setError('');
            }}
            placeholder="Nhập từ tiếng Anh... (e.g. meticulous)"
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '14px',
              border: '1.5px solid var(--card-border)',
              background: 'var(--card-bg)',
              color: 'var(--fg)',
              fontFamily: 'inherit',
              fontSize: '14px',
              fontWeight: 500,
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(240,180,41,0.5)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--card-border)')}
            onKeyDown={(e) => e.key === 'Enter' && handleAI()}
          />
          <button
            type="button"
            onClick={handleAI}
            disabled={!word.trim() || generating}
            style={{
              padding: '12px 18px',
              borderRadius: '14px',
              border: 'none',
              cursor: word.trim() && !generating ? 'pointer' : 'not-allowed',
              background: word.trim()
                ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
                : 'rgba(139,92,246,0.2)',
              color: 'white',
              fontWeight: 700,
              fontSize: '13px',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              outline: 'none',
              opacity: generating ? 0.7 : 1,
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            {generating ? <Spinner /> : '✦'}
            {generating ? 'Đang điền...' : 'AI Điền'}
          </button>
        </div>

        {/* AI-filled or manual fields */}
        {(filled || word.trim().length > 0) && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <FieldRow
              label="Phiên âm"
              value={formData.phonetic}
              onChange={(val) => setFormData((p) => ({ ...p, phonetic: val }))}
              placeholder="/məˈtɪk.jʊ.ləs/"
              color="var(--fg-2)"
              mono
            />
            <FieldRow
              label="Nghĩa tiếng Việt *"
              value={formData.meaning}
              onChange={(val) => setFormData((p) => ({ ...p, meaning: val }))}
              placeholder="Tỉ mỉ, cẩn thận"
              color="#F0B429"
            />
            <FieldRow
              label="Định nghĩa tiếng Anh"
              value={formData.definition}
              onChange={(val) => setFormData((p) => ({ ...p, definition: val }))}
              placeholder="Very careful and with great attention to every detail."
              color="var(--fg-2)"
              small
              multiline
            />
            <FieldRow
              label="Ví dụ mẫu (mỗi câu 1 dòng)"
              value={formData.examples}
              onChange={(val) => setFormData((p) => ({ ...p, examples: val }))}
              placeholder="Many hours of meticulous work went into the project."
              color="var(--fg)"
              small
              multiline
            />
          </div>
        )}

        {/* Save button */}
        {(filled || word.trim().length > 0) && (
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            onMouseEnter={() => setSaveHov(true)}
            onMouseLeave={() => setSaveHov(false)}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '16px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #F5BE36 0%, #D4960A 100%)',
              color: '#1C1407',
              fontWeight: 800,
              fontSize: '14px',
              letterSpacing: '0.05em',
              fontFamily: 'inherit',
              outline: 'none',
              boxShadow: saveHov
                ? '0 6px 24px rgba(240,180,41,0.50)'
                : '0 3px 14px rgba(240,180,41,0.30)',
              transform: saveHov && !loading ? 'translateY(-1px)' : 'translateY(0)',
              transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Đang lưu vào kho...' : 'Lưu vào kho từ vựng'}
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
