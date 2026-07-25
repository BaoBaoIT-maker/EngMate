import React from 'react';

export default function CourseCard({ course, delay }) {
  const s = {
    background: 'rgba(255,255,255,0.62)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.88)',
    borderRadius: 20,
    padding: '1.5rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset',
    animation: `card-in 0.5s ease both`,
    animationDelay: `${delay}ms`,
  };
  return (
    <div className="course-card" style={s}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: course.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
          {course.emoji}
        </div>
        <div style={{ padding: '0.25rem 0.625rem', borderRadius: 100, background: course.accentBg, border: `1px solid ${course.accent}33` }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: course.accent }}>{course.tag}</span>
        </div>
      </div>
      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1C1407', marginBottom: 4, letterSpacing: '-0.01em' }}>{course.title}</div>
      <div style={{ fontSize: '0.78rem', color: '#9D8E6F', marginBottom: 6 }}>
        {course.level} · {course.words.toLocaleString()} từ
      </div>
      <div style={{ fontSize: '0.78rem', color: '#6B6047', lineHeight: 1.5, marginBottom: '1.25rem' }}>{course.desc}</div>
      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B6047' }}>Tiến độ</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: course.accent }}>{course.progress}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 100, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{
            width: `${course.progress}%`, height: '100%', borderRadius: 100,
            background: `linear-gradient(90deg, ${course.accent}, ${course.accent}aa)`,
            transition: 'width 0.8s ease',
          }} />
        </div>
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#9D8E6F' }}>{Math.round(course.words * course.progress / 100).toLocaleString()} từ đã học</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: course.accent, cursor: 'pointer' }}>Tiếp tục →</span>
      </div>
    </div>
  );
}
