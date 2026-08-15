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

  const [notif, setNotif] = useState(user?.setting?.receiveEmails ?? true);
  const [goal, setGoal] = useState(user?.setting?.dailyWordGoal || 20);
  const [isSavingPref, setIsSavingPref] = useState(false);

  const [username, setUsername] = useState(user?.profile?.username || '');
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
    if (username === user?.profile?.username || !username.trim()) return;
    setIsSavingProfile(true);
    try {
      await api.patch('/users/me/profile', { username: username.trim() });
      const res = await api.get('/users/me');
      useAuthStore.getState().setUser(res.data);
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
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: 4 }}>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                onBlur={handleUpdateUsername}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateUsername()}
                style={{ 
                  fontWeight: 800, color: t.text, fontSize: '1.2rem', 
                  background: 'transparent', border: 'none', borderBottom: `1.5px dashed ${username !== user?.profile?.username ? t.gold : 'transparent'}`, 
                  outline: 'none', padding: '2px 0', width: '100%', maxWidth: 250,
                  transition: 'border-color 0.2s'
                }} 
              />
              {isSavingProfile && <span style={{ fontSize: '0.7rem', color: t.gold }}>Lưu...</span>}
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
                  {path.category} · Lên {path.targetScore || path.currentLevel}
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
              <button key={v} onClick={() => setGoal(v)} style={{ padding: '0.3rem 0.625rem', borderRadius: 8, border: `1.5px solid ${goal === v ? t.gold : t.cardBorder}`, background: goal === v ? t.goldBg : 'transparent', color: goal === v ? t.gold : t.textMuted, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                {v}
              </button>
            ))}
            <input 
              type="number"
              value={goal}
              onChange={e => setGoal(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="Khác..."
              style={{ width: 60, padding: '0.3rem 0.5rem', borderRadius: 8, border: `1.5px solid ${![10, 20, 30, 50].includes(goal) ? t.gold : t.cardBorder}`, background: t.bg, color: t.text, fontWeight: 700, fontSize: '0.75rem', outline: 'none', textAlign: 'center', fontFamily: 'inherit' }}
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
        style={{ width: '100%', padding: '0.875rem', borderRadius: 12, border: `1.5px solid rgba(239,68,68,0.3)`, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
      >
        Đăng xuất
      </button>
    </div>
  );
}
