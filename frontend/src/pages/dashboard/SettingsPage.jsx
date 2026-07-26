import React, { useState } from 'react';
import Header from '../../components/dashboard/Header';
import useThemeStore from '../../store/useThemeStore';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';

const card = (t, extra) => ({
  background: t.card,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${t.cardBorder}`,
  borderRadius: 16,
  boxShadow: `0 4px 24px ${t.shadow}`,
  ...extra,
});

export default function SettingsPage() {
  const { isDark, toggleDark, getTheme } = useThemeStore();
  const t = getTheme();
  const user = useAuthStore(s => s.user);

  const [notif, setNotif] = useState(true);
  const [sound, setSound] = useState(true);
  const [goal, setGoal] = useState(user?.setting?.dailyWordGoal || 20);
  
  const getLevelOptions = (cat) => {
    if (cat === 'IELTS') return Array.from({ length: 19 }, (_, i) => (i * 0.5).toFixed(1));
    if (cat === 'TOEIC') {
      const arr = Array.from({ length: 20 }, (_, i) => (i * 50).toString());
      arr.push('990');
      return arr;
    }
    return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  };

  const initialPath = user?.learningPaths?.[0] || { category: 'GENERAL', currentLevel: 'A1', targetScore: 'B1' };
  const [pathForm, setPathForm] = useState(initialPath);
  const [isSavingPath, setIsSavingPath] = useState(false);

  const savedPathForCategory = user?.learningPaths?.find(p => p.category === pathForm.category);
  const referencePath = savedPathForCategory || {
    category: pathForm.category,
    currentLevel: pathForm.category === 'IELTS' ? '0.0' : pathForm.category === 'TOEIC' ? '0' : 'A1',
    targetScore: pathForm.category === 'IELTS' ? '0.0' : pathForm.category === 'TOEIC' ? '0' : 'A1'
  };

  const hasChanges = 
    pathForm.category !== referencePath.category || 
    pathForm.currentLevel !== referencePath.currentLevel || 
    pathForm.targetScore !== referencePath.targetScore;

  const handleSavePath = async () => {
    if (!hasChanges) return;
    setIsSavingPath(true);
    try {
      await api.put('/users/me/learning-paths', { paths: [pathForm] });
      const res = await api.get('/users/me');
      useAuthStore.getState().setUser(res.data);
    } catch (err) {
      console.error('Save path error', err);
    }
    setIsSavingPath(false);
  };

  const Toggle = ({ on, setOn }) => (
    <div onClick={() => setOn(!on)} style={{ width: 44, height: 24, borderRadius: 100, background: on ? t.gold : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'), cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
    </div>
  );

  const Row = ({ label, desc, right }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: `1px solid ${t.cardBorder}` }}>
      <div>
        <div style={{ fontWeight: 600, color: t.text, fontSize: '0.9rem' }}>{label}</div>
        {desc && <div style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: 2 }}>{desc}</div>}
      </div>
      {right}
    </div>
  );

  return (
    <div className="screen-enter w-full max-w-7xl mx-auto">
      <Header title="Cài đặt" />

      {/* Profile */}
      <div style={{ ...card(t), padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.875rem' }}>Tài khoản</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {user?.profile?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 800, color: t.text, fontSize: '1.05rem' }}>{user?.profile?.username || 'User'}</div>
            <div style={{ fontSize: '0.78rem', color: t.textMuted }}>{user?.email || 'user@example.com'}</div>
            <div style={{ marginTop: 6, display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6, background: t.goldBg, color: t.gold }}>Premium ✦</span>
              {user?.learningPaths?.map((path, idx) => (
                <span key={idx} style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6, background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
                  {path.category} · Lên {path.targetScore || path.currentLevel}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div style={{ ...card(t), padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Lộ trình học</div>
          {isSavingPath && <span style={{ fontSize: '0.75rem', color: t.gold }}>Đang lưu...</span>}
        </div>
        
        <Row label="Khoá học" desc="Mục tiêu chính của bạn" right={
          <select 
            value={pathForm.category}
            onChange={e => {
              const newCat = e.target.value;
              const existingPath = user?.learningPaths?.find(p => p.category === newCat);
              if (existingPath) {
                setPathForm({ ...existingPath });
              } else {
                const defaultLevel = newCat === 'IELTS' ? '0.0' : newCat === 'TOEIC' ? '0' : 'A1';
                setPathForm({ ...pathForm, category: newCat, currentLevel: defaultLevel, targetScore: defaultLevel });
              }
            }}
            style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: `1px solid ${t.cardBorder}`, background: t.bg, color: t.text, fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
          >
            <option value="GENERAL">Tiếng Anh Giao Tiếp</option>
            <option value="TOEIC">Luyện thi TOEIC</option>
            <option value="IELTS">Luyện thi IELTS</option>
          </select>
        } />
        
        <Row label="Trình độ hiện tại" desc="Level tiếng Anh hiện tại" right={
          <select 
            value={pathForm.currentLevel}
            onChange={e => setPathForm({ ...pathForm, currentLevel: e.target.value })}
            style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: `1px solid ${t.cardBorder}`, background: t.bg, color: t.text, fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
          >
            {getLevelOptions(pathForm.category).map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        } />
        
        <Row label="Mục tiêu" desc="Số điểm/Trình độ mong muốn" right={
          <select 
            value={pathForm.targetScore || ''}
            onChange={e => setPathForm({ ...pathForm, targetScore: e.target.value })}
            style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: `1px solid ${t.cardBorder}`, background: t.bg, color: t.text, fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
          >
            {getLevelOptions(pathForm.category).map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        } />

        {/* Save button logic */}
        {hasChanges && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${t.cardBorder}`, animation: 'fadeIn 0.3s ease' }}>
            <button 
              onClick={handleSavePath}
              disabled={isSavingPath}
              style={{ 
                padding: '0.625rem 1.5rem', 
                borderRadius: 10, 
                border: 'none', 
                background: isSavingPath ? t.textMuted : t.goldBg, 
                color: isSavingPath ? '#fff' : t.gold, 
                fontWeight: 700, 
                fontSize: '0.85rem', 
                cursor: isSavingPath ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isSavingPath ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Preferences */}
      <div style={{ ...card(t), padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>Tuỳ chọn</div>
        <Row label="Chế độ tối" desc="Giao diện tối cho mắt" right={<Toggle on={isDark} setOn={toggleDark} />} />
        <Row label="Thông báo nhắc nhở" desc="Nhắc học vào 8:00 sáng mỗi ngày" right={<Toggle on={notif} setOn={setNotif} />} />
        <Row label="Âm thanh" desc="Phát âm từ khi học flashcard" right={<Toggle on={sound} setOn={setSound} />} />
        <Row label="Mục tiêu hàng ngày" desc={`${goal} từ / ngày`} right={
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {[10, 20, 30, 50].map(v => (
              <button key={v} onClick={() => setGoal(v)} style={{ padding: '0.3rem 0.625rem', borderRadius: 8, border: `1.5px solid ${goal === v ? t.gold : t.cardBorder}`, background: goal === v ? t.goldBg : 'transparent', color: goal === v ? t.gold : t.textMuted, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                {v}
              </button>
            ))}
          </div>
        } />
      </div>



      {/* Logout */}
      <button 
        onClick={() => {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }}
        style={{ width: '100%', padding: '0.875rem', borderRadius: 12, border: `1.5px solid rgba(239,68,68,0.3)`, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
      >
        Đăng xuất
      </button>
    </div>
  );
}
