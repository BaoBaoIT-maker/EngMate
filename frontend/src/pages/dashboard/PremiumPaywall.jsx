import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useThemeStore from '../../store/useThemeStore';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';

// ─── Modal xác nhận đổi gói ────────────────────────────────────────────────
function ConfirmChangeModal({ t, currentPlanName, endDate, newPlanName, onConfirm, onCancel }) {
  const fmtDate = new Date(endDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 24, padding: '2rem', maxWidth: 420, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', animation: 'popIn 0.2s ease-out' }}>
        <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '1rem' }}>⚠️</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', color: t.text }}>Bạn đang có gói đang hoạt động</h3>
        <p style={{ color: t.textMuted, fontSize: '0.95rem', lineHeight: 1.6, textAlign: 'center', marginBottom: '1.5rem' }}>
          Bạn đang dùng <strong style={{ color: t.gold }}>{currentPlanName}</strong> (còn hạn đến <strong style={{ color: t.text }}>{fmtDate}</strong>).
          <br /><br />
          Nếu mua <strong style={{ color: t.text }}>{newPlanName}</strong>, gói mới sẽ bắt đầu <strong>ngay hôm nay</strong>. Thời gian còn lại của gói cũ <strong style={{ color: '#ef4444' }}>sẽ không được hoàn lại</strong>.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '0.9rem', borderRadius: 12, background: t.hover, color: t.textMuted, border: `1px solid ${t.cardBorder}`, cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
            Hủy bỏ
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '0.9rem', borderRadius: 12, background: 'linear-gradient(135deg, #EAB308, #B45309)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
            Xác nhận mua
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card Gói cước ──────────────────────────────────────────────────────────
function PlanCard({ plan, isSelected, isOwned, isDark, t, onClick }) {
  const isLastPlan = false; // controlled by parent

  const cardStyle = {
    background: isOwned
      ? (isDark ? 'rgba(234,179,8,0.06)' : '#FEFCE8')
      : isSelected
        ? (isDark ? 'rgba(245,158,11,0.12)' : '#FEF3C7')
        : t.card,
    border: `2px solid ${isOwned ? '#EAB308' : isSelected ? t.gold : t.cardBorder}`,
    borderRadius: 20,
    padding: '1.5rem',
    cursor: isOwned ? 'default' : 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    opacity: isOwned ? 0.85 : 1,
  };

  return (
    <div onClick={isOwned ? undefined : onClick} style={cardStyle}>
      {/* Badge Đang dùng */}
      {isOwned && (
        <div style={{ position: 'absolute', top: -12, left: 16, background: 'linear-gradient(90deg, #EAB308, #B45309)', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: 99, letterSpacing: '0.03em' }}>
          ✓ ĐANG SỬ DỤNG
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: t.text }}>{plan.name}</div>
        {isOwned && (
          <div style={{ fontSize: '1.2rem' }}>🔒</div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '2.25rem', fontWeight: 800, color: isOwned ? t.gold : t.text }}>
          {plan.price.toLocaleString('vi-VN')}
        </span>
        <span style={{ fontSize: '1rem', color: t.textMuted }}>VNĐ</span>
      </div>

      <div style={{ fontSize: '0.82rem', color: t.textMuted }}>
        {plan.durationDays >= 365
          ? `${Math.round(plan.durationDays / 365)} năm`
          : `${plan.durationDays} ngày`}
        {plan.features?.aiLimit && (
          <span style={{ marginLeft: '0.5rem', color: t.gold }}>· {plan.features.aiLimit} AI lượt/ngày</span>
        )}
      </div>

      {isOwned && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: t.textMuted, fontStyle: 'italic' }}>
          Bạn đã sở hữu gói này
        </div>
      )}
    </div>
  );
}

// ─── Trang chính ────────────────────────────────────────────────────────────
export default function PremiumPaywall() {
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const fetchMe = useAuthStore(s => s.fetchMe);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading_qr | waiting_payment | success
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState(null);

  // Thông tin gói hiện tại của user
  const currentSub = user?.subscription;
  const currentPlan = currentSub?.plan;
  const isActivePremium = currentSub?.isValid &&
    currentPlan?.code !== 'FREE' &&
    (!currentSub.endDate || new Date(currentSub.endDate) > new Date());

  // Fetch danh sách gói
  useEffect(() => {
    api.get('/payment/plans').then(res => {
      const paidPlans = (res.data?.data || res.data).filter(p => p.price > 0);
      setPlans(paidPlans);
      if (paidPlans.length > 0) {
        const defaultPlan = paidPlans.find(p => p.id !== currentPlan?.id) || paidPlans[0];
        setSelectedPlan(defaultPlan.id);
      }
    }).catch(err => console.error('Failed to load plans', err));
  }, []);

  // Polling thanh toán
  useEffect(() => {
    let interval;
    if (status === 'waiting_payment') {
      interval = setInterval(async () => {
        try {
          const latestUser = await fetchMe();
          const latestSub = latestUser?.subscription;
          const latestIsPremium = latestSub?.isValid &&
            latestSub?.plan?.code !== 'FREE' &&
            (!latestSub.endDate || new Date(latestSub.endDate) > new Date());
          if (latestIsPremium) {
            setStatus('success');
            clearInterval(interval);
          }
        } catch (e) { console.error(e); }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [status, fetchMe]);

  const doSubscribe = useCallback(async (planId) => {
    setLoading(true);
    setStatus('loading_qr');
    setShowConfirmModal(false);
    try {
      const res = await api.post('/payment/create-qr', { planId });
      const data = res.data?.data || res.data;
      setQrData(data);
      setSelectedPlan(planId);
      setStatus('waiting_payment');
    } catch (err) {
      console.error(err);
      setStatus('idle');
      alert('Không thể tạo mã thanh toán, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePlanClick = (plan) => {
    if (plan.id === currentPlan?.id) return; // Gói đang dùng → không làm gì
    setSelectedPlan(plan.id);
  };

  const handleSubscribe = () => {
    if (!selectedPlan) return;
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    // Nếu đang có gói premium khác → cảnh báo
    if (isActivePremium && currentPlan?.id !== selectedPlan) {
      setPendingPlanId(selectedPlan);
      setShowConfirmModal(true);
      return;
    }
    doSubscribe(selectedPlan);
  };

  const gridCols = plans.length >= 3 ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr';

  // ─── Success screen ───
  if (status === 'success') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: t.text, animation: 'fadeIn 0.5s' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: t.gold, marginBottom: '0.75rem' }}>Thanh Toán Thành Công!</h1>
        <p style={{ fontSize: '1.1rem', color: t.textMuted, marginBottom: '2rem', textAlign: 'center' }}>
          Chào mừng bạn đến với đặc quyền <strong style={{ color: t.gold }}>EngMate Premium</strong>.
        </p>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'linear-gradient(135deg, #EAB308, #B45309)', color: '#fff', border: 'none', padding: '1rem 2.5rem', borderRadius: 99, fontWeight: 700, cursor: 'pointer', fontSize: '1.1rem' }}>
          Trở về Trang chủ
        </button>
        <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', color: t.text, animation: 'fadeIn 0.5s ease-out' }}>

      {/* Modal xác nhận đổi gói */}
      {showConfirmModal && (
        <ConfirmChangeModal
          t={t}
          currentPlanName={currentPlan?.name}
          endDate={currentSub?.endDate}
          newPlanName={plans.find(p => p.id === pendingPlanId)?.name}
          onConfirm={() => doSubscribe(pendingPlanId)}
          onCancel={() => { setShowConfirmModal(false); setPendingPlanId(null); }}
        />
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: t.goldBg, padding: '0.45rem 1rem', borderRadius: 99, color: t.gold, fontWeight: 700, marginBottom: '1.25rem', border: `1px solid ${t.cardBorder}`, fontSize: '0.9rem' }}>
          ✦ Nâng tầm tiếng Anh của bạn
        </div>
        <h1 style={{ fontSize: '2.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem', lineHeight: 1.2 }}>
          Mở khóa <span style={{ color: t.gold }}>EngMate Premium</span>
        </h1>
        <p style={{ fontSize: '1rem', color: t.textMuted, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
          Tận hưởng toàn quyền truy cập AI Coach, tính năng chữa chuỗi học và phân tích lộ trình không giới hạn.
        </p>
        {isActivePremium && (
          <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: isDark ? 'rgba(234,179,8,0.1)' : '#FEFCE8', border: '1px solid #EAB308', borderRadius: 99, padding: '0.4rem 1rem', color: t.gold, fontSize: '0.88rem', fontWeight: 700 }}>
            ✓ Bạn đang dùng {currentPlan?.name} — còn hạn đến {new Date(currentSub.endDate).toLocaleDateString('vi-VN')}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

        {/* Cột tính năng */}
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 24, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Đặc quyền Premium</h3>
          <FeatureItem t={t} icon="🤖" title="20 lượt AI Coach / ngày" desc="Luyện nói thoải mái, không bị giới hạn khắt khe." />
          <FeatureItem t={t} icon="🎯" title="Không giới hạn Lộ trình" desc="Học song song TOEIC, IELTS, Giao tiếp cùng lúc." />
          <FeatureItem t={t} icon="❄️" title="Đóng băng chuỗi học" desc="1 lần/tuần, bảo vệ streak nếu bạn lỡ quên hôm nào." />
          <FeatureItem t={t} icon="📊" title="Phân tích tiến độ" desc="Theo dõi điểm yếu và nhận gợi ý học cá nhân hoá." />
        </div>

        {/* Cột chọn gói + thanh toán */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Danh sách gói — Grid khi nhiều gói */}
          {status === 'idle' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '1rem' }}>
                {plans.map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isSelected={selectedPlan === plan.id}
                    isOwned={currentPlan?.id === plan.id && isActivePremium}
                    isDark={isDark}
                    t={t}
                    onClick={() => handlePlanClick(plan)}
                  />
                ))}
              </div>

              <button
                onClick={handleSubscribe}
                disabled={loading || !selectedPlan}
                style={{
                  width: '100%', padding: '1.2rem', borderRadius: 16,
                  background: 'linear-gradient(135deg, #EAB308, #B45309)',
                  color: '#fff', fontWeight: 800, fontSize: '1.1rem', border: 'none',
                  cursor: (loading || !selectedPlan) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(234,179,8,0.3)',
                  transition: 'transform 0.15s, opacity 0.15s',
                  opacity: loading ? 0.8 : 1,
                }}
              >
                {loading ? 'Đang tạo mã QR...' : isActivePremium ? 'Đổi / Gia hạn gói ✦' : 'Nâng cấp ngay ✦'}
              </button>
            </>
          )}

          {/* Màn hình QR */}
          {(status === 'loading_qr' || status === 'waiting_payment') && (
            <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 24, padding: '2.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Quét mã để thanh toán</h3>

              {status === 'loading_qr' ? (
                <div style={{ width: 240, height: 240, background: t.hover, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textMuted, animation: 'pulse 1.5s infinite' }}>
                  Đang tạo mã...
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 16, padding: '0.75rem', width: 240, height: 240 }}>
                  <img src={qrData.qrUrl} alt="VietQR" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                </div>
              )}

              {status === 'waiting_payment' && qrData && (
                <>
                  {/* Số tiền + nội dung — readonly, chỉ để xem */}
                  <div style={{ background: t.hover, borderRadius: 12, padding: '1rem', width: '100%', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: t.textMuted, fontSize: '0.85rem' }}>Số tiền</span>
                      <strong style={{ color: t.gold, fontSize: '1rem' }}>{qrData.amount?.toLocaleString('vi-VN')} VNĐ</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: t.textMuted, fontSize: '0.85rem' }}>Nội dung CK</span>
                      <strong style={{ color: t.text, fontSize: '0.9rem', fontFamily: 'monospace' }}>{qrData.memo}</strong>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: '#F59E0B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ animation: 'pulse 1.5s infinite', display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                    Đang chờ xác nhận thanh toán...
                  </div>

                  <div style={{ fontSize: '0.82rem', color: t.textMuted, lineHeight: 1.6, maxWidth: 300 }}>
                    ⚠️ <strong>Quan trọng:</strong> Vui lòng nhập <em>đúng số tiền</em> và <em>đúng nội dung</em> như trên khi chuyển khoản. Hệ thống sẽ xác nhận tự động trong vòng 1–2 phút.
                  </div>

                  <button onClick={() => setStatus('idle')} style={{ marginTop: '0.5rem', background: 'transparent', color: t.textMuted, border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', fontSize: '0.85rem' }}>
                    Hủy giao dịch
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100% { opacity:0.5 } 50% { opacity:1 } }
        @keyframes popIn { from { opacity:0; transform:scale(0.93) } to { opacity:1; transform:scale(1) } }
      `}</style>
    </div>
  );
}

function FeatureItem({ t, icon, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: t.hover, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.97rem', marginBottom: 2 }}>{title}</div>
        <div style={{ color: t.textMuted, fontSize: '0.85rem', lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}
