function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'buổi sáng';
  if (h < 18) return 'buổi chiều';
  return 'buổi tối';
}

export default function HeroStrip({ t, isDark, username }) {
  return (
    <div className="mb-8 anim-slide-up">
      <h1
        className="m-0 leading-tight tracking-tight"
        style={{ fontWeight: 800, fontSize: 'clamp(28px, 5vw, 36px)', color: t.text, letterSpacing: '-0.03em' }}
      >
        Chào {getGreeting()},{' '}
        <span style={{ color: t.green }}>{username}</span>!
      </h1>
      <p className="mt-2 text-base font-medium" style={{ color: t.textMuted }}>
        Ready to expand your vocabulary today?
      </p>
    </div>
  );
}