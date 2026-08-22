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
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', color: t.text }}>Xác nhận chuyển gói</h3>
        <p style={{ color: t.textMuted, fontSize: '0.95rem', lineHeight: 1.6, textAlign: 'center', marginBottom: '1.5rem' }}>
          Bạn đang có gói <strong style={{ color: t.gold }}>{currentPlanName}</strong> (còn hạn đến <strong style={{ color: t.text }}>{fmtDate}</strong>).
          <br /><br />
          Nếu mua <strong style={{ color: t.text }}>{newPlanName}</strong>, gói mới sẽ bắt đầu <strong>ngay hôm nay</strong>. Mọi ưu đãi và thời gian còn lại của gói cũ <strong style={{ color: '#ef4444' }}>sẽ bị hủy và không được cộng dồn</strong>.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '0.9rem', borderRadius: 12, background: t.hover, color: t.textMuted, border: `1px solid ${t.cardBorder}`, cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
            Hủy bỏ
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '0.9rem', borderRadius: 12, background: 'linear-gradient(135deg, #EAB308, #B45309)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
            Đồng ý mua
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Thanh toán thành công ──────────────────────────────────────────
function SuccessModal({ t, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 24, padding: '2.5rem 2rem', maxWidth: 360, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem' }}>
            ✓
          </div>
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem', color: t.text }}>Thanh toán thành công!</h3>
        <p style={{ color: t.textMuted, fontSize: '0.95rem', lineHeight: 1.5, textAlign: 'center', marginBottom: '2rem' }}>
          Gói cước của bạn đã được kích hoạt. Hãy tận hưởng các đặc quyền Premium ngay bây giờ.
        </p>
        <button onClick={onClose} style={{ width: '100%', padding: '1rem', borderRadius: 14, background: 'linear-gradient(135deg, #EAB308, #B45309)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 14px rgba(234,179,8,0.3)' }}>
          Đóng
        </button>
      </div>
    </div>
  );
}

// ─── Card Gói cước ──────────────────────────────────────────────────────────
function PlanCard({ plan, isSelected, isOwned, isDisabled, isDark, t, onClick }) {
  const cardStyle = {
    background: isOwned 
      ? (isDark ? 'rgba(255,255,255,0.03)' : '#f3f4f6') 
      : isDisabled 
        ? (isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb')
        : isSelected
          ? (isDark ? 'rgba(245,158,11,0.12)' : '#FEF3C7')
          : t.card,
    border: `2px solid ${isOwned ? t.cardBorder : isSelected ? t.gold : t.cardBorder}`,
    borderRadius: 20,
    padding: '1.5rem',
    cursor: (isOwned || isDisabled) ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    opacity: (isOwned || isDisabled) ? 0.6 : 1,
    filter: (isOwned || isDisabled) ? 'grayscale(1)' : 'none',
  };

  return (
    <div onClick={(isOwned || isDisabled) ? undefined : onClick} style={cardStyle}>
      {/* Badge Đang dùng */}
      {isOwned && (
        <div style={{ position: 'absolute', top: -12, left: 16, background: t.textSub, color: t.bg, fontSize: '0.72rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: 99, letterSpacing: '0.03em' }}>
          ✓ ĐANG SỬ DỤNG
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: t.text }}>{plan.name}</div>
        {(isOwned || isDisabled) && (
          <div style={{ fontSize: '1.2rem', opacity: 0.5 }}>🔒</div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '2.25rem', fontWeight: 800, color: (isOwned || isDisabled) ? t.textSub : t.text }}>
          {plan.price.toLocaleString('vi-VN')}
        </span>
        <span style={{ fontSize: '1rem', color: t.textMuted }}>VNĐ</span>
      </div>

      <div style={{ fontSize: '0.82rem', color: t.textMuted, marginBottom: '1rem' }}>
        {plan.durationDays >= 365
          ? `${Math.round(plan.durationDays / 365)} năm`
          : `${plan.durationDays} ngày`}
      </div>

      {/* Render Dynamic Features from Database */}
      {plan.features && typeof plan.features === 'object' && Object.keys(plan.features).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem', borderTop: `1px solid ${t.cardBorder}`, paddingTop: '1rem' }}>
          {Object.entries(plan.features).map(([key, value]) => {
            let icon = '✨';
            let label = key;
            if (key === 'aiLimit') { icon = '🤖'; label = `${value} lượt AI Coach / ngày`; }
            else if (key === 'learningPaths' && value) { icon = '🎯'; label = 'Không giới hạn lộ trình'; }
            else if (key === 'streakFreeze') { icon = '❄️'; label = `${value} lần đóng băng chuỗi học / tuần`; }
            else if (key === 'analytics' && value) { icon = '📊'; label = 'Phân tích tiến độ học tập'; }
            else if (typeof value === 'boolean' && !value) return null; // Skip disabled booleans

            return (
              <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: (isOwned || isDisabled) ? t.textMuted : t.text }}>
                <span style={{ fontSize: '1rem', marginTop: '-1px' }}>{icon}</span>
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      )}

      {isOwned && (
        <div style={{ marginTop: 'auto', fontSize: '0.85rem', color: t.textMuted, fontStyle: 'italic', fontWeight: 600, textAlign: 'center', paddingTop: '0.5rem' }}>
          Bạn đã sở hữu gói này
        </div>
      )}
      {isDisabled && !isOwned && (
        <div style={{ marginTop: 'auto', fontSize: '0.85rem', color: t.textMuted, fontStyle: 'italic', fontWeight: 600, textAlign: 'center', paddingTop: '0.5rem' }}>
          Đã bao gồm trong gói hiện tại
        </div>
      )}
    </div>
  );
}

// ─── Trang chính ────────────────────────────────────────────────────────────
export default function PremiumPaywall() {
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();
  const user = useAuthStore(s => s.user);
  const fetchMe = useAuthStore(s => s.fetchMe);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading_qr | waiting_payment | success
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes = 900 seconds

  // Thông tin gói hiện tại của user
  const currentSub = user?.subscription;
  const currentPlan = currentSub?.plan;
  const isActivePremium = currentSub?.isValid &&
    currentPlan?.code !== 'FREE' &&
    (!currentSub.endDate || new Date(currentSub.endDate) > new Date());
  
  const currentDuration = isActivePremium ? (currentPlan?.durationDays || 0) : 0;

  // Fetch danh sách gói
  useEffect(() => {
    api.get('/payment/plans').then(res => {
      const allPlans = res.data?.data || res.data;
      setPlans(allPlans);
      
      const paidPlans = allPlans.filter(p => p.price > 0);
      if (paidPlans.length > 0) {
        // Tìm gói đầu tiên không bị disable
        const availablePlan = paidPlans.find(p => p.durationDays > currentDuration) || paidPlans[0];
        setSelectedPlan(availablePlan?.id || null);
      }
    }).catch(err => console.error('Failed to load plans', err));
  }, [currentDuration]);

  // Polling thanh toán và Countdown
  useEffect(() => {
    let pollInterval;
    let countdownInterval;

    if (status === 'waiting_payment') {
      // Countdown
      countdownInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setStatus('idle');
            setQrData(null);
            alert('Thời gian thanh toán đã hết hạn. Vui lòng tạo lại mã QR.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Polling check status
      pollInterval = setInterval(async () => {
        try {
          const latestUser = await fetchMe();
          const latestSub = latestUser?.subscription;
          if (latestSub?.isValid && latestSub?.plan?.id === selectedPlan) {
            setStatus('success');
            setShowSuccessModal(true);
            clearInterval(pollInterval);
            clearInterval(countdownInterval);
          }
        } catch (e) { console.error(e); }
      }, 3000);
    }
    return () => {
      clearInterval(pollInterval);
      clearInterval(countdownInterval);
    };
  }, [status, fetchMe, selectedPlan]);

  const doSubscribe = useCallback(async (planId) => {
    setLoading(true);
    setStatus('loading_qr');
    setShowConfirmModal(false);
    try {
      const res = await api.post('/payment/create-qr', { planId });
      const data = res.data?.data || res.data;
      setQrData(data);
      setSelectedPlan(planId);
      setTimeLeft(900); // Reset timer 15 mins
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
    // Không cho chọn gói đang dùng HOẶC gói có thời hạn nhỏ hơn gói đang dùng
    if (plan.id === currentPlan?.id && isActivePremium) return;
    if (isActivePremium && plan.durationDays <= currentDuration) return;
    setSelectedPlan(plan.id);
  };

  const handleSubscribe = () => {
    if (!selectedPlan) return;
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    // Nếu đang có gói premium khác (dù ngắn hạn hơn) → vẫn hiện cảnh báo mất ưu đãi cũ
    if (isActivePremium && currentPlan?.id !== selectedPlan) {
      setPendingPlanId(selectedPlan);
      setShowConfirmModal(true);
      return;
    }
    doSubscribe(selectedPlan);
  };

  const gridCols = plans.length >= 3 ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr';

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

      {/* Modal Thanh toán thành công (Popup nhỏ) */}
      {showSuccessModal && (
        <SuccessModal 
          t={t} 
          onClose={() => {
            setShowSuccessModal(false);
            setStatus('idle');
            setQrData(null);
          }} 
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
          <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', border: `1px solid ${t.cardBorder}`, borderRadius: 99, padding: '0.5rem 1rem', color: t.text, fontSize: '0.88rem', fontWeight: 600 }}>
            <span style={{ color: '#22C55E' }}>✓</span> Bạn đang sử dụng <strong>{currentPlan?.name}</strong> (còn hạn đến {new Date(currentSub.endDate).toLocaleDateString('vi-VN')})
          </div>
        )}
      </div>

      {/* Main Layout: Just the plans, centered */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 800, margin: '0 auto' }}>

        {/* Danh sách gói — Grid khi nhiều gói */}
        {(status === 'idle' || status === 'success') && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '1rem' }}>
                {plans.map(plan => {
                  const isOwned = currentPlan?.id === plan.id || (!isActivePremium && plan.code === 'FREE' && plan.price === 0);
                  // Vô hiệu hóa gói này nếu user đang có gói dài hạn hơn hoặc bằng (vd đang dùng gói năm thì khóa gói tháng)
                  // Gói Free luôn bị disable nếu đang có Premium
                  const isDisabled = isActivePremium && plan.price === 0 ? true : (isActivePremium && plan.durationDays <= currentDuration && !isOwned);
                  
                  return (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      isSelected={selectedPlan === plan.id}
                      isOwned={isOwned}
                      isDisabled={isDisabled}
                      isDark={isDark}
                      t={t}
                      onClick={() => handlePlanClick(plan)}
                    />
                  );
                })}
              </div>

              <button
                onClick={handleSubscribe}
                disabled={loading || !selectedPlan || plans.find(p => p.id === selectedPlan)?.price === 0}
                style={{
                  width: '100%', padding: '1.2rem', borderRadius: 16,
                  background: 'linear-gradient(135deg, #EAB308, #B45309)',
                  color: '#fff', fontWeight: 800, fontSize: '1.1rem', border: 'none',
                  cursor: (loading || !selectedPlan || plans.find(p => p.id === selectedPlan)?.price === 0) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(234,179,8,0.3)',
                  transition: 'transform 0.15s, opacity 0.15s',
                  opacity: (loading || plans.find(p => p.id === selectedPlan)?.price === 0) ? 0.6 : 1,
                }}
              >
                {loading ? 'Đang tạo mã QR...' : plans.find(p => p.id === selectedPlan)?.price === 0 ? 'Gói Mặc Định' : 'Nâng cấp ngay ✦'}
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
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: t.gold, background: t.goldBg, padding: '0.4rem 1rem', borderRadius: 99, marginBottom: '0.5rem', }}>
                    {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>

                  {/* Số tiền + nội dung — constrained width */}
                  <div style={{ background: t.hover, borderRadius: 12, padding: '1.25rem', width: '100%', maxWidth: 320, textAlign: 'left', border: `1px solid ${t.cardBorder}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                      <span style={{ color: t.textMuted, fontSize: '0.9rem' }}>Số tiền:</span>
                      <strong style={{ color: t.gold, fontSize: '1.15rem' }}>{qrData.amount?.toLocaleString('vi-VN')} VNĐ</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: t.textMuted, fontSize: '0.9rem' }}>Nội dung:</span>
                      <strong style={{ color: t.text, fontSize: '1.05rem', background: t.bg, padding: '0.2rem 0.5rem', borderRadius: 6 }}>{qrData.memo}</strong>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.9rem', color: '#F59E0B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span style={{ animation: 'pulse 1.5s infinite', display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                    Đang chờ xác nhận thanh toán...
                  </div>

                  <div style={{ fontSize: '0.82rem', color: t.textMuted, lineHeight: 1.6, maxWidth: 320, marginTop: '0.25rem' }}>
                    ⚠️ <strong>Quan trọng:</strong> Vui lòng nhập <em>đúng số tiền</em> và <em>đúng nội dung</em> như trên khi chuyển khoản. Hệ thống sẽ xác nhận tự động trong vòng 1–2 phút.
                  </div>

                  <button onClick={() => { setStatus('idle'); setQrData(null); }} style={{ marginTop: '0.75rem', background: 'transparent', color: t.textMuted, border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', fontSize: '0.85rem' }}>
                    Hủy giao dịch
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100% { opacity:0.5 } 50% { opacity:1 } }
        @keyframes popIn { 
          0% { opacity: 0; transform: scale(0.9); } 
          100% { opacity: 1; transform: scale(1); } 
        }
      `}</style>
    </div>
  );
}
