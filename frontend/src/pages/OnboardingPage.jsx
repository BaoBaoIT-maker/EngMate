import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import axiosInstance from '../services/api';

const GOLD = '#F0B429';
const GOLD_DARK = '#C9920A';

// ─── CONFIG ────────────────────────────────────────────────────────
const COURSES = [
  {
    category: 'TOEIC',
    emoji: '💼',
    title: 'TOEIC',
    desc: 'Chứng chỉ văn phòng, ứng tuyển công việc',
    accent: GOLD,
    accentBg: 'rgba(240,180,41,0.12)',
    scoreLabel: 'Điểm mục tiêu',
    scoreOptions: [450, 550, 650, 730, 800, 850, 900, 990],
    scoreUnit: 'điểm',
  },
  {
    category: 'IELTS',
    emoji: '🎓',
    title: 'IELTS',
    desc: 'Du học, học bổng, định cư nước ngoài',
    accent: '#8B5CF6',
    accentBg: 'rgba(139,92,246,0.12)',
    scoreLabel: 'Band mục tiêu',
    scoreOptions: [50, 55, 60, 65, 70, 75, 80], // lưu *10 để tránh float, ví dụ 65 = 6.5
    scoreUnit: 'band (×0.1)',
  },
  {
    category: 'GENERAL',
    emoji: '🌟',
    title: 'General English',
    desc: 'Giao tiếp hàng ngày, nền tảng vững chắc',
    accent: '#10B981',
    accentBg: 'rgba(16,185,129,0.12)',
    scoreLabel: null,
    scoreOptions: [],
    scoreUnit: '',
  },
];

const LEVELS = [
  { value: 'A1', label: 'A1 — Beginner', desc: 'Mới bắt đầu, hầu như chưa biết gì' },
  { value: 'A2', label: 'A2 — Elementary', desc: 'Biết một số từ và câu đơn giản' },
  { value: 'B1', label: 'B1 — Intermediate', desc: 'Có thể giao tiếp về chủ đề quen thuộc' },
  { value: 'B2', label: 'B2 — Upper-Intermediate', desc: 'Tự tin trao đổi, hiểu bài đọc phức tạp' },
  { value: 'C1', label: 'C1 — Advanced', desc: 'Diễn đạt linh hoạt, gần như bản ngữ' },
  { value: 'C2', label: 'C2 — Proficient', desc: 'Trình độ bản ngữ hoàn toàn' },
];

const DAILY_GOALS = [
  { value: 10, label: '10 từ / ngày', desc: '~5 phút — Nhẹ nhàng' },
  { value: 15, label: '15 từ / ngày', desc: '~10 phút — Tiêu chuẩn Free' },
  { value: 20, label: '20 từ / ngày', desc: '~15 phút — Đều đặn' },
  { value: 30, label: '30 từ / ngày', desc: '~20 phút — Chăm chỉ' },
  { value: 50, label: '50 từ / ngày', desc: '~35 phút — Luyện thi nghiêm túc' },
];

// ─── STEP COMPONENTS ───────────────────────────────────────────────
function StepCourses({ selected, setSelected }) {
  const toggle = (cat) =>
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  return (
    <div>
      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', marginBottom: '1.25rem' }}>
        Chọn <strong style={{ color: '#fff' }}>một hoặc nhiều</strong> lộ trình — bạn có thể học song song.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {COURSES.map((c) => {
          const active = selected.includes(c.category);
          return (
            <div
              key={c.category}
              onClick={() => toggle(c.category)}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 14,
                border: `2px solid ${active ? c.accent : 'rgba(255,255,255,0.1)'}`,
                background: active ? c.accentBg : 'rgba(255,255,255,0.04)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{c.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: active ? c.accent : '#fff', fontSize: '0.95rem' }}>
                  {c.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{c.desc}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: `2px solid ${active ? c.accent : 'rgba(255,255,255,0.2)'}`,
                background: active ? c.accent : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s',
              }}>
                {active && <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 800 }}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepLevel({ pathConfig, setPathConfig, selectedCourses }) {
  return (
    <div>
      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', marginBottom: '1.25rem' }}>
        Tự đánh giá trình độ hiện tại của bạn cho từng khóa.
      </p>
      {selectedCourses.map((cat) => {
        const course = COURSES.find((c) => c.category === cat);
        return (
          <div key={cat} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span>{course.emoji}</span>
              <span style={{ fontWeight: 700, color: course.accent, fontSize: '0.9rem' }}>{course.title}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {LEVELS.map((lv) => {
                const active = pathConfig[cat]?.level === lv.value;
                return (
                  <div
                    key={lv.value}
                    onClick={() => setPathConfig((prev) => ({
                      ...prev,
                      [cat]: { ...prev[cat], level: lv.value },
                    }))}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 10,
                      border: `1.5px solid ${active ? course.accent : 'rgba(255,255,255,0.08)'}`,
                      background: active ? course.accentBg : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: active ? course.accent : '#fff', fontSize: '0.85rem' }}>{lv.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{lv.desc}</div>
                    </div>
                    {active && <span style={{ color: course.accent, fontWeight: 800 }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StepTarget({ pathConfig, setPathConfig, selectedCourses }) {
  const coursesWithScore = selectedCourses.filter((cat) => COURSES.find((c) => c.category === cat)?.scoreOptions.length > 0);

  return (
    <div>
      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', marginBottom: '1.25rem' }}>
        Đặt con số mục tiêu cụ thể giúp AI cá nhân hóa lộ trình cho bạn.
      </p>
      {coursesWithScore.map((cat) => {
        const course = COURSES.find((c) => c.category === cat);
        const currentScore = pathConfig[cat]?.targetScore;
        return (
          <div key={cat} style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <span>{course.emoji}</span>
              <span style={{ fontWeight: 700, color: course.accent, fontSize: '0.9rem' }}>{course.title} — {course.scoreLabel}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {course.scoreOptions.map((s) => {
                const label = cat === 'IELTS' ? (s / 10).toFixed(1) : s;
                const active = currentScore === s;
                return (
                  <button
                    key={s}
                    onClick={() => setPathConfig((prev) => ({
                      ...prev,
                      [cat]: { ...prev[cat], targetScore: s },
                    }))}
                    style={{
                      padding: '0.5rem 1rem', borderRadius: 10, fontWeight: 700, fontSize: '0.875rem',
                      border: `1.5px solid ${active ? course.accent : 'rgba(255,255,255,0.12)'}`,
                      background: active ? course.accentBg : 'rgba(255,255,255,0.04)',
                      color: active ? course.accent : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {selectedCourses.includes('GENERAL') && (
        <div style={{ padding: '1rem', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>
            🌟 <strong style={{ color: '#10B981' }}>General English</strong> không có điểm mục tiêu cụ thể — AI sẽ cải thiện giao tiếp toàn diện cho bạn.
          </span>
        </div>
      )}
    </div>
  );
}

function StepGoal({ dailyGoal, setDailyGoal }) {
  return (
    <div>
      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', marginBottom: '1.25rem' }}>
        Bạn muốn học bao nhiêu từ mỗi ngày? Có thể thay đổi sau trong phần Cài đặt.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {DAILY_GOALS.map((g) => {
          const active = dailyGoal === g.value;
          return (
            <div
              key={g.value}
              onClick={() => setDailyGoal(g.value)}
              style={{
                padding: '1rem 1.25rem', borderRadius: 14, cursor: 'pointer',
                border: `2px solid ${active ? GOLD : 'rgba(255,255,255,0.1)'}`,
                background: active ? 'rgba(240,180,41,0.1)' : 'rgba(255,255,255,0.04)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.2s',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: active ? GOLD : '#fff', fontSize: '0.9rem' }}>{g.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{g.desc}</div>
              </div>
              {active && <span style={{ color: GOLD, fontWeight: 800, fontSize: '1.1rem' }}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────
const STEPS = [
  { id: 'courses', title: 'Chọn khóa học', subtitle: 'Bạn muốn chinh phục chứng chỉ nào?' },
  { id: 'level', title: 'Trình độ hiện tại', subtitle: 'Để AI biết nên bắt đầu từ đâu' },
  { id: 'target', title: 'Điểm mục tiêu', subtitle: 'Đặt mục tiêu rõ ràng để có lộ trình tối ưu' },
  { id: 'goal', title: 'Mục tiêu hàng ngày', subtitle: 'Học đều đặn quan trọng hơn học nhiều một lúc' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { isDark } = useThemeStore();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [pathConfig, setPathConfig] = useState({}); // { TOEIC: { level, targetScore }, ... }
  const [dailyGoal, setDailyGoal] = useState(15);

  const currentStep = STEPS[step];

  // Validation per step
  const isStepValid = () => {
    if (step === 0) return selectedCourses.length > 0;
    if (step === 1) return selectedCourses.every((cat) => pathConfig[cat]?.level);
    if (step === 2) return true; // target score optional for GENERAL
    if (step === 3) return dailyGoal > 0;
    return true;
  };

  const handleNext = async () => {
    setError('');
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    // Final step → submit
    setLoading(true);
    try {
      const paths = selectedCourses.map((cat) => ({
        category: cat,
        currentLevel: pathConfig[cat]?.level || 'A1',
        targetScore: pathConfig[cat]?.targetScore || null,
      }));

      const res = await axiosInstance.post('/users/me/onboarding', { paths, dailyWordGoal: dailyGoal });
      const updatedUser = res.data;
      if (updatedUser) setUser(updatedUser);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={{
      minHeight: '100vh', background: '#0F0D14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,180,41,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -100, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #F5BE36, #D4960A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 4px 12px rgba(240,180,41,0.35)' }}>✦</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>
            Eng<span style={{ color: GOLD }}>Mate</span>
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Bước {step + 1} / {STEPS.length}
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: GOLD }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: 4, borderRadius: 100, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, borderRadius: 100, background: `linear-gradient(90deg, ${GOLD}, ${GOLD_DARK})`, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: '2rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          {/* Step header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 4, letterSpacing: '-0.025em' }}>
              {currentStep.title}
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>{currentStep.subtitle}</p>
          </div>

          {/* Step content */}
          {step === 0 && <StepCourses selected={selectedCourses} setSelected={setSelectedCourses} />}
          {step === 1 && <StepLevel pathConfig={pathConfig} setPathConfig={setPathConfig} selectedCourses={selectedCourses} />}
          {step === 2 && <StepTarget pathConfig={pathConfig} setPathConfig={setPathConfig} selectedCourses={selectedCourses} />}
          {step === 3 && <StepGoal dailyGoal={dailyGoal} setDailyGoal={setDailyGoal} />}

          {/* Error */}
          {error && (
            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.82rem', color: '#EF4444' }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                style={{ flex: 1, padding: '0.875rem', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              >
                ← Quay lại
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!isStepValid() || loading}
              style={{
                flex: 2, padding: '0.875rem', borderRadius: 12, border: 'none',
                background: isStepValid() ? `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})` : 'rgba(255,255,255,0.08)',
                color: isStepValid() ? '#1C1407' : 'rgba(255,255,255,0.25)',
                fontWeight: 800, fontSize: '0.95rem', cursor: isStepValid() ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', transition: 'all 0.2s',
                boxShadow: isStepValid() ? '0 6px 20px rgba(240,180,41,0.3)' : 'none',
              }}
            >
              {loading ? 'Đang lưu…' : step === STEPS.length - 1 ? 'Bắt đầu học ✦' : 'Tiếp theo →'}
            </button>
          </div>
        </div>

        {/* Skip */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button
            onClick={() => navigate('/dashboard', { replace: true })}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
          >
            Bỏ qua, thiết lập sau →
          </button>
        </div>
      </div>
    </div>
  );
}
