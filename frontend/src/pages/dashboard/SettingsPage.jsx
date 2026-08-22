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

const LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const SCORE_OPTIONS = {
  TOEIC: [250, 350, 450, 550, 650, 730, 800, 850, 900, 990],
  IELTS: ['1.0', '2.0', '3.0', '4.0', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'],
};

const usesScoreTarget = (category) => Boolean(SCORE_OPTIONS[category]);
const getTargetOptions = (category) => SCORE_OPTIONS[category] || LEVEL_OPTIONS;
const getDefaultTargetValue = (category) => {
  if (category === 'TOEIC') return '650';
  if (category === 'IELTS') return '6.5';
  return 'B1';
};

const getPathTargetValue = (path) => {
  const category = path?.category || 'GENERAL';
  return String(
    usesScoreTarget(category)
      ? path?.targetScore || getDefaultTargetValue(category)
      : path?.targetLevel || getDefaultTargetValue(category)
  );
};

const getPathPayload = (pathForm) => {
  if (usesScoreTarget(pathForm.category)) {
    return {
      category: pathForm.category,
      targetScore: getPathTargetValue(pathForm),
    };
  }

  return {
    category: pathForm.category,
    targetLevel: getPathTargetValue(pathForm),
  };
};

export default function SettingsPage() {
  const { isDark, toggleDark, getTheme } = useThemeStore();
  const t = getTheme();
  const user = useAuthStore(s => s.user);

  const [notif, setNotif] = useState(user?.setting?.receiveEmails ?? true);
  const [goal, setGoal] = useState(user?.setting?.dailyWordGoal || 20);
  const [isSavingPref, setIsSavingPref] = useState(false);
  const [username, setUsername] = useState(user?.profile?.username || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = React.useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = React.useRef(null);

  const initialNotif = user?.setting?.receiveEmails ?? true;
  const initialGoal = user?.setting?.dailyWordGoal || 20;
  const hasPrefChanges = notif !== initialNotif || goal !== initialGoal;

  const handleSavePref = async () => {
    if (!hasPrefChanges) return;
    setIsSavingPref(true);
    try {
      await api.patch('/users/me/settings', { receiveEmails: notif, dailyWordGoal: parseInt(goal) || 20 });
      const res = await api.get('/users/me');
      useAuthStore.getState().setUser(res.data);
    } catch (err) {
      console.error('Save settings error', err);
    }
    setIsSavingPref(false);
  };
  
  const handleUpdateUsername = async () => {
    if (!username.trim() || username === user?.profile?.username) {
      setIsEditingName(false);
      setUsername(user?.profile?.username || '');
      return;
    }
    setIsSavingProfile(true);
    try {
      await api.patch('/users/me/profile', { username: username.trim() });
      const res = await api.get('/users/me');
      useAuthStore.getState().setUser(res.data);
      setIsEditingName(false);
    } catch (err) {
      console.error('Update username error', err);
    }
    setIsSavingProfile(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const res = await api.get('/users/me');
      useAuthStore.getState().setUser(res.data);
    } catch (err) {
      console.error('Upload avatar error', err);
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteAvatar = async () => {
    setIsUploading(true);
    try {
      await api.delete('/users/me/avatar');
      const res = await api.get('/users/me');
      useAuthStore.getState().setUser(res.data);
    } catch (err) {
      console.error('Delete avatar error', err);
    }
    setIsUploading(false);
  };
  
  const initialPath = user?.learningPaths?.[0] || { category: 'GENERAL', targetLevel: 'B1' };
  const [pathForm, setPathForm] = useState(initialPath);
  const [isSavingPath, setIsSavingPath] = useState(false);

  const savedPathForCategory = user?.learningPaths?.find(p => p.category === pathForm.category);
  const referencePath = savedPathForCategory || {
    category: pathForm.category,
    targetLevel: usesScoreTarget(pathForm.category) ? null : getDefaultTargetValue(pathForm.category),
    targetScore: usesScoreTarget(pathForm.category) ? getDefaultTargetValue(pathForm.category) : null,
  };
  const currentPathProgress = savedPathForCategory?.progress || pathForm.progress;

  const hasChanges = 
    pathForm.category !== referencePath.category || 
    getPathTargetValue(pathForm) !== getPathTargetValue(referencePath);

  const handleSavePath = async () => {
    if (!hasChanges) return;
    setIsSavingPath(true);
    try {
      await api.put('/users/me/learning-paths', {
        paths: [getPathPayload(pathForm)]
      });
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Avatar Area */}
          <div style={{ position: 'relative' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
              {isUploading ? (
                <div style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : user?.profile?.avatarUrl ? (
                <img src={user.profile.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.profile?.username?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: t.goldBg, border: `2px solid ${t.card}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.gold }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: 4 }}>
              {isEditingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: t.bg, borderRadius: 8, padding: '4px 8px', border: `1px solid ${t.gold}` }}>
                  <input 
                    ref={nameInputRef}
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateUsername();
                      if (e.key === 'Escape') {
                        setIsEditingName(false);
                        setUsername(user?.profile?.username || '');
                      }
                    }}
                    style={{ 
                      fontWeight: 800, color: t.text, fontSize: '1.2rem', 
                      background: 'transparent', border: 'none',
                      outline: 'none', width: '100%', maxWidth: 220
                    }} 
                  />
                  <button 
                    onClick={handleUpdateUsername}
                    disabled={isSavingProfile}
                    style={{ background: t.goldBg, color: t.gold, border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    {isSavingProfile ? '...' : 'Lưu'}
                  </button>
                  <button 
                    onClick={() => { setIsEditingName(false); setUsername(user?.profile?.username || ''); }}
                    style={{ background: 'transparent', color: t.textMuted, border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 800, color: t.text, fontSize: '1.2rem' }}>
                    {user?.profile?.username || 'Người dùng'}
                  </div>
                  <button 
                    onClick={() => { setIsEditingName(true); setTimeout(() => nameInputRef.current?.focus(), 50); }}
                    style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 4, transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    title="Đổi tên"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  </button>
                </div>
              )}
            </div>
            <div style={{ fontSize: '0.85rem', color: t.textMuted }}>{user?.email || 'user@example.com'}</div>
            <div style={{ marginTop: 6, display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {user?.subscription?.isValid && user?.subscription?.plan?.code !== 'FREE' ? (
                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6, background: t.goldBg, color: t.gold }}>
                  {user.subscription.plan.name} ✦
                </span>
              ) : (
                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6', color: t.textMuted }}>
                  Miễn phí
                </span>
              )}
              {user?.learningPaths?.map((path, idx) => (
                <span key={idx} style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6, background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
                  {path.category} · {path.progress?.currentLevel || 'A1'} → {getPathTargetValue(path)}
                </span>
              ))}
            </div>
            {user?.profile?.avatarUrl && (
              <button 
                onClick={handleDeleteAvatar}
                disabled={isUploading}
                style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
              >
                Xóa ảnh đại diện
              </button>
            )}
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
                setPathForm({
                  category: newCat,
                  targetLevel: usesScoreTarget(newCat) ? null : getDefaultTargetValue(newCat),
                  targetScore: usesScoreTarget(newCat) ? getDefaultTargetValue(newCat) : null,
                  progress: null
                });
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
            value={currentPathProgress?.currentLevel || 'A1'}
            disabled
            style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: `1px solid ${t.cardBorder}`, background: t.bg, color: t.text, fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
          >
            {LEVEL_OPTIONS.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        } />
        
        <Row label="Mục tiêu" desc="Số điểm/Trình độ mong muốn" right={
          <select 
            value={getPathTargetValue(pathForm)}
            onChange={e => setPathForm({
              ...pathForm,
              targetLevel: usesScoreTarget(pathForm.category) ? null : e.target.value,
              targetScore: usesScoreTarget(pathForm.category) ? e.target.value : null,
            })}
            style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: `1px solid ${t.cardBorder}`, background: t.bg, color: t.text, fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
          >
            {getTargetOptions(pathForm.category).map(l => (
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Preferences */}
      <div style={{ ...card(t), padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>Tuỳ chọn</div>
        <Row label="Chế độ tối" desc="Giao diện tối cho mắt" right={<Toggle on={isDark} setOn={toggleDark} />} />
        <Row label="Thông báo nhắc nhở" desc="Nhận email nhắc nhở học từ hệ thống" right={<Toggle on={notif} setOn={setNotif} />} />
        
        <Row label="Mục tiêu hàng ngày" desc={`${goal} từ / ngày`} right={
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            {[10, 20, 30, 50].map(v => (
              <button key={v} onClick={() => setGoal(v)} style={{ padding: '0.3rem 0.625rem', borderRadius: 8, border: `1.5px solid ${goal === v ? t.gold : t.cardBorder}`, background: goal === v ? t.goldBg : 'transparent', color: goal === v ? t.gold : t.textMuted, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', }}>
                {v}
              </button>
            ))}
            <input 
              type="number"
              value={goal}
              onChange={e => setGoal(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="Khác..."
              style={{ width: 60, padding: '0.3rem 0.5rem', borderRadius: 8, border: `1.5px solid ${![10, 20, 30, 50].includes(goal) ? t.gold : t.cardBorder}`, background: t.bg, color: t.text, fontWeight: 700, fontSize: '0.75rem', outline: 'none', textAlign: 'center', }}
            />
          </div>
        } />

        {hasPrefChanges && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${t.cardBorder}`, animation: 'fadeIn 0.3s ease' }}>
            <button 
              onClick={handleSavePref}
              disabled={isSavingPref}
              style={{ 
                padding: '0.625rem 1.5rem', 
                borderRadius: 10, 
                border: 'none', 
                background: isSavingPref ? t.textMuted : t.goldBg, 
                color: isSavingPref ? '#fff' : t.gold, 
                fontWeight: 700, 
                fontSize: '0.85rem', 
                cursor: isSavingPref ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isSavingPref ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        )}
      </div>



      {/* Logout */}
      <button 
        onClick={() => {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }}
        style={{ width: '100%', padding: '0.875rem', borderRadius: 12, border: `1.5px solid rgba(239,68,68,0.3)`, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
      >
        Đăng xuất
      </button>
    </div>
  );
}
