function TracifyLogo({ size = 26, color = '#0B1F1A', accent = '#1B8A5A' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: 'Geist, system-ui' }}>
      <TracifyMark size={size} accent={accent} />
      <span style={{
        fontFamily: 'Geist, system-ui',
        fontWeight: 600,
        fontSize: size * 0.95,
        letterSpacing: -0.8,
        color,
      }}>tracify</span>
    </div>
  );
}

function TracifyMark({ size = 26, accent = '#1B8A5A' }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="tr-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={accent} stopOpacity="1" />
          <stop offset="1" stopColor={accent} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="13" fill="none" stroke={accent} strokeOpacity="0.18" strokeWidth="2" />
      <path
        d="M16 7.5c-3.9 0-7 3-7 6.7 0 2.6 1.8 4.9 3.9 6.4l2.5 3.4c.3.4.9.4 1.2 0l2.5-3.4c2.1-1.5 3.9-3.8 3.9-6.4 0-3.7-3.1-6.7-7-6.7z"
        fill="url(#tr-grad)"
      />
      <circle cx="16" cy="14" r="2.6" fill="#fff" />
    </svg>
  );
}

window.TracifyLogo = TracifyLogo;
window.TracifyMark = TracifyMark;
