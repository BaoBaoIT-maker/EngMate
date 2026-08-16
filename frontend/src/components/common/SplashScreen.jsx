import React from 'react';
import useSplashStore from '../../store/useSplashStore';
import useThemeStore from '../../store/useThemeStore';

export default function SplashScreen() {
  const { isOpen, message } = useSplashStore();
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();

  if (!isOpen) return null;

  const displayMessage = message;

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999, // Đảm bảo luôn nằm trên cùng
        background: t.bg, // Sử dụng màu nền từ theme hiện tại
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.25s ease-out forwards',
      }}>
        {/* Logo Container với hiệu ứng Pulse lấp lánh */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          animation: 'float 3s ease-in-out infinite',
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Vòng sáng Pulse */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #EAB308, #B45309)',
              animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              opacity: 0.5,
              zIndex: 0,
            }} />
            
            {/* Logo chính */}
            <div style={{
              position: 'relative',
              width: 80, 
              height: 80, 
              borderRadius: 24, 
              background: 'linear-gradient(135deg, #EAB308, #B45309)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '2.5rem', 
              color: '#fff',
              zIndex: 1,
              boxShadow: '0 10px 30px rgba(234, 179, 8, 0.3)',
            }}>
              ✦
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontWeight: 800, 
              fontSize: '2.5rem', 
              color: t.text, 
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
            }}>
              Eng<span style={{ color: t.gold }}>Mate</span>
            </div>
            
            {displayMessage && (
              <div style={{
                fontSize: '1rem',
                color: t.textSub,
                fontWeight: 500,
                animation: 'pulse-opacity 1.5s ease-in-out infinite'
              }}>
                {displayMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse-opacity {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
