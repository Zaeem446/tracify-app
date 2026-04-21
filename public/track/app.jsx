// Tracify /track — "See the Truth" — Light PI aesthetic
// Audience: Cheating suspicion, relationship monitoring, teen tracking
// Theme: #FAF9FF bg, #7C3AED violet accent, DM Sans + JetBrains Mono

const { useState, useEffect, useRef, useMemo } = React;

const ACCENT = '#7C3AED';
const ACCENT_GLOW = 'rgba(124,58,237,0.25)';
const BG = '#FAF9FF';
const SURFACE = '#FFFFFF';
const SURFACE2 = '#F3F0FF';
const BORDER = '#E9E5F5';
const INK = '#1A1028';
const MUTED = '#6B6280';
const FONT = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";

// ─── Carrier / City data ──────────────────────────────────
const CARRIER_PREFIXES = {
  PK: [
  { p: ['300','301','302','303','304','305','306','307','308','309'], name: 'Jazz' },
  { p: ['310','311','312','313','314','315','316','317','318','319'], name: 'Zong' },
  { p: ['320','321','322','323','324','325','326','327','328','329'], name: 'Jazz' },
  { p: ['330','331','332','333','334','335','336','337','338','339'], name: 'Ufone' },
  { p: ['340','341','342','343','344','345','346','347','348','349'], name: 'Jazz' },
  { p: ['355'], name: 'SCOM' }],
  IN: [
  { p: ['70','71','72','73','74','75','76','77','78','79'], name: 'Jio' },
  { p: ['80','81','82','83','84','85','86','87','88','89'], name: 'Airtel' },
  { p: ['90','91','92','93','94','95','96','97','98','99'], name: 'Vi (Vodafone Idea)' }],
  US: [
  { p: ['212','332','646','917','718','347'], name: 'Verizon' },
  { p: ['213','310','323','424','818'], name: 'T-Mobile' },
  { p: ['312','773','872','224','847'], name: 'AT&T' },
  { p: ['415','628','510','650'], name: 'Verizon' },
  { p: ['305','786','954','561'], name: 'T-Mobile' },
  { p: ['214','469','972','817'], name: 'AT&T' }],
  GB: [
  { p: ['74','75','77','78'], name: 'EE' },
  { p: ['73','79'], name: 'Vodafone' },
  { p: ['76'], name: 'Three' },
  { p: ['70','71','72'], name: 'O2' }],
  DE: [
  { p: ['151','160','170','171','175'], name: 'Telekom' },
  { p: ['152','162','172','173','174'], name: 'Vodafone' },
  { p: ['157','163','177','178'], name: 'O2' },
  { p: ['159','176','179'], name: 'O2' }],
  FR: [{ p: ['6','7'], name: 'Orange' }],
  BR: [{ p: ['11','21','31','41','51','61','71','81','91'], name: 'Vivo' }],
  AE: [{ p: ['50','54','56'], name: 'Etisalat' }, { p: ['52','55','58'], name: 'du' }],
  SA: [{ p: ['50','53','55'], name: 'STC' }, { p: ['54','56'], name: 'Mobily' }, { p: ['58','59'], name: 'Zain' }]
};
const CITY_POOLS = {
  PK: ['Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar','Quetta','Hyderabad','Sialkot'],
  IN: ['Mumbai','Delhi','Bengaluru','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Jaipur','Lucknow'],
  US: ['New York, NY','Los Angeles, CA','Chicago, IL','Houston, TX','Phoenix, AZ','Dallas, TX','Miami, FL','San Francisco, CA','Seattle, WA','Boston, MA'],
  GB: ['London','Manchester','Birmingham','Leeds','Glasgow','Liverpool','Edinburgh','Bristol'],
  DE: ['Berlin','Munich','Hamburg','Cologne','Frankfurt','Stuttgart'],
  FR: ['Paris','Marseille','Lyon','Toulouse','Nice','Bordeaux'],
  BR: ['São Paulo','Rio de Janeiro','Brasília','Salvador','Fortaleza'],
  AE: ['Dubai','Abu Dhabi','Sharjah'], SA: ['Riyadh','Jeddah','Mecca','Medina'],
  CA: ['Toronto','Montreal','Vancouver','Calgary'], AU: ['Sydney','Melbourne','Brisbane','Perth'],
  JP: ['Tokyo','Osaka','Yokohama'], CN: ['Beijing','Shanghai','Guangzhou','Shenzhen'],
  MX: ['Mexico City','Guadalajara','Monterrey'], NG: ['Lagos','Abuja','Kano'],
  ID: ['Jakarta','Surabaya','Bandung'], TR: ['Istanbul','Ankara','Izmir'],
  EG: ['Cairo','Alexandria'], ZA: ['Johannesburg','Cape Town','Durban'],
  IT: ['Rome','Milan','Naples'], ES: ['Madrid','Barcelona','Valencia'], NL: ['Amsterdam','Rotterdam']
};
const CITY_COORDS = {
  'Karachi': [24.86, 67.01, 11], 'Lahore': [31.55, 74.35, 12], 'Islamabad': [33.69, 73.04, 12],
  'Rawalpindi': [33.6, 73.05, 12], 'Faisalabad': [31.42, 73.08, 12], 'Multan': [30.2, 71.45, 12],
  'Peshawar': [34.01, 71.58, 12], 'Quetta': [30.18, 66.99, 12], 'Hyderabad': [25.4, 68.37, 12],
  'Sialkot': [32.5, 74.53, 12],
  'Mumbai': [19.08, 72.88, 12], 'Delhi': [28.61, 77.21, 12],
  'Bengaluru': [12.97, 77.59, 12], 'Chennai': [13.08, 80.27, 12], 'Kolkata': [22.57, 88.36, 12],
  'Pune': [18.52, 73.86, 12], 'Ahmedabad': [23.02, 72.57, 12], 'Jaipur': [26.91, 75.79, 12],
  'Lucknow': [26.85, 80.95, 12],
  'New York, NY': [40.71, -74.01, 12], 'Los Angeles, CA': [34.05, -118.24, 11],
  'Chicago, IL': [41.88, -87.63, 12], 'Houston, TX': [29.76, -95.37, 11],
  'Phoenix, AZ': [33.45, -112.07, 11], 'Dallas, TX': [32.78, -96.8, 12],
  'Miami, FL': [25.76, -80.19, 12], 'San Francisco, CA': [37.77, -122.42, 13],
  'Seattle, WA': [47.61, -122.33, 12], 'Boston, MA': [42.36, -71.06, 13],
  'London': [51.51, -0.13, 12], 'Manchester': [53.48, -2.24, 12], 'Birmingham': [52.49, -1.9, 12],
  'Leeds': [53.8, -1.55, 12], 'Glasgow': [55.86, -4.25, 12], 'Liverpool': [53.41, -2.98, 12],
  'Edinburgh': [55.95, -3.19, 13], 'Bristol': [51.45, -2.59, 13],
  'Berlin': [52.52, 13.41, 12], 'Munich': [48.14, 11.58, 12], 'Hamburg': [53.55, 9.99, 12],
  'Cologne': [50.94, 6.96, 12], 'Frankfurt': [50.11, 8.68, 12], 'Stuttgart': [48.78, 9.18, 12],
  'Paris': [48.86, 2.35, 12], 'Marseille': [43.3, 5.37, 12], 'Lyon': [45.76, 4.84, 12],
  'Dubai': [25.2, 55.27, 12], 'Abu Dhabi': [24.45, 54.65, 12],
  'Riyadh': [24.69, 46.72, 11], 'Jeddah': [21.49, 39.19, 12], 'Mecca': [21.39, 39.86, 13],
  'Tokyo': [35.68, 139.69, 11], 'Osaka': [34.69, 135.5, 12],
  'Beijing': [39.9, 116.4, 11], 'Shanghai': [31.23, 121.47, 11],
  'Sydney': [-33.87, 151.21, 12], 'Melbourne': [-37.81, 144.96, 12],
  'Toronto': [43.65, -79.38, 12], 'Montreal': [45.5, -73.57, 12], 'Vancouver': [49.28, -123.12, 12],
  'São Paulo': [-23.55, -46.63, 11], 'Rio de Janeiro': [-22.91, -43.17, 12],
  'Mexico City': [19.43, -99.13, 11], 'Istanbul': [41.01, 28.98, 11], 'Cairo': [30.04, 31.24, 11],
  'Lagos': [6.45, 3.4, 12], 'Johannesburg': [-26.2, 28.04, 12], 'Cape Town': [-33.93, 18.42, 12],
  'Rome': [41.9, 12.5, 12], 'Milan': [45.46, 9.19, 12], 'Madrid': [40.42, -3.7, 12],
  'Barcelona': [41.39, 2.17, 12], 'Amsterdam': [52.37, 4.9, 13],
  'Jakarta': [-6.21, 106.85, 11], 'Bangkok': [13.76, 100.5, 12], 'Seoul': [37.57, 126.98, 12],
  'Singapore': [1.35, 103.82, 12], 'Buenos Aires': [-34.6, -58.38, 12],
};

// Expected phone number digit lengths per country code (digits after country code)
const PHONE_LENGTHS = {
  US: [10,10], CA: [10,10], MX: [10,10], BR: [10,11], AR: [10,11],
  GB: [10,11], IE: [7,9], DE: [10,11], FR: [9,9], ES: [9,9],
  IT: [9,10], NL: [9,9], SE: [7,9], NO: [8,8], PL: [9,9],
  TR: [10,10], IN: [10,10], PK: [10,10], CN: [11,11], JP: [10,11],
  KR: [10,11], ID: [9,12], PH: [10,10], TH: [9,9], VN: [9,10],
  AU: [9,9], NZ: [8,10], ZA: [9,9], NG: [10,10], EG: [10,10],
  AE: [7,9], SA: [9,9], IL: [9,9]
};

function resolveCarrierAndCity(country, digits) {
  const code = country.code;
  let carrier = null;
  const prefixes = CARRIER_PREFIXES[code];
  if (prefixes) {
    let best = null;
    for (const entry of prefixes) {
      for (const pfx of entry.p) {
        if (digits.startsWith(pfx) && (!best || pfx.length > best.len)) best = { name: entry.name, len: pfx.length };
      }
    }
    if (best) carrier = best.name;
  }
  if (!carrier) { const seed = digits.split('').reduce((a, c) => a + c.charCodeAt(0), 0); carrier = country.carriers[seed % country.carriers.length]; }
  const pool = CITY_POOLS[code];
  let city;
  if (pool && pool.length) { const seed = digits.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 7), 0); city = pool[seed % pool.length]; }
  else city = country.capital;
  return { carrier, city };
}

// ─── useInView hook ───────────────────────────────────────
function useInView(ref, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}

// ─── Splash Overlay ───────────────────────────────────────
function SplashOverlay({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / 1200) * 100);
      setProgress(pct);
      if (elapsed < 1200) { raf = requestAnimationFrame(tick); }
      else { setFading(true); setTimeout(onDone, 400); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: '#1A1028',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: fading ? 0 : 1, transition: 'opacity 0.4s ease',
      pointerEvents: fading ? 'none' : 'auto'
    }}>
      <TracifyLogo size={32} accent={ACCENT} color="#fff" />
      <div style={{ marginTop: 18, fontFamily: MONO, fontSize: 13, color: ACCENT, letterSpacing: 2, textTransform: 'uppercase' }}>Scanning...</div>
      <div style={{ marginTop: 16, width: 180, height: 3, borderRadius: 999, background: 'rgba(124,58,237,0.2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${ACCENT}, #A855F7)`, borderRadius: 999, transition: 'width 60ms linear' }} />
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────
function App() {
  const [country, setCountry] = useState(window.COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 820);
  useEffect(() => { const fn = () => setIsMobile(window.innerWidth < 820); window.addEventListener('resize', fn); return () => window.removeEventListener('resize', fn); }, []);

  // Splash + entrance animation state
  const [splashDone, setSplashDone] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  useEffect(() => { if (splashDone) { requestAnimationFrame(() => setHeroReady(true)); } }, [splashDone]);

  // Section refs for scroll animations
  const featuresHeadRef = useRef(null);
  const featuresRowRef = useRef(null);
  const testimonialsHeadRef = useRef(null);
  const testimonialsGridRef = useRef(null);
  const featuresHeadVisible = useInView(featuresHeadRef, 0.15);
  const featuresRowVisible = useInView(featuresRowRef, 0.1);
  const testimonialsHeadVisible = useInView(testimonialsHeadRef, 0.15);
  const testimonialsGridVisible = useInView(testimonialsGridRef, 0.1);
  useEffect(() => { fetch('/api/geo/detect').then(r=>r.json()).then(d => { if(d.success && d.countryCode) { const f = window.COUNTRIES.find(c=>c.code===d.countryCode); if(f) setCountry(f); }}).catch(()=>{}); }, []);

  const formatPhone = (raw) => { const d = raw.replace(/\D/g, '').slice(0, 12); return d.replace(/(.{3})/g, '$1 ').trim(); };

  const [searchOverlay, setSearchOverlay] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [reportPage, setReportPage] = useState(false);
  const [lookup, setLookup] = useState({ carrier: '...', city: '', loading: false });
  const [mapTarget, setMapTarget] = useState(null);

  const pushStep = (hash) => history.pushState({ step: hash }, '', '/track#' + hash);
  const clearToHome = () => { setSearchOverlay(false); setResultModal(false); setReportPage(false); };
  useEffect(() => {
    const onPop = () => {
      const hash = location.hash.replace('#', '');
      if (hash === 'searching') { setResultModal(false); setReportPage(false); setSearchOverlay(true); }
      else if (hash === 'located') { setSearchOverlay(false); setReportPage(false); setResultModal(true); }
      else if (hash === 'report') { setSearchOverlay(false); setResultModal(false); setReportPage(true); }
      else clearToHome();
    };
    window.addEventListener('popstate', onPop);
    if (location.hash) history.replaceState(null, '', '/track');
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const [now, setNow] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(i); }, []);
  const localTime = useMemo(() => { try { return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: country.tz }).format(now); } catch { return '--:--:--'; } }, [now, country.tz]);

  const handleLocate = () => {
    const digits = phone.replace(/\D/g, '');
    const range = PHONE_LENGTHS[country?.code] || [7, 15];
    if (digits.length < range[0] || digits.length > range[1]) return;
    const fallback = resolveCarrierAndCity(country, digits);
    setLookup({ ...fallback, loading: true });
    setMapTarget(null);
    setSearchOverlay(true);
    pushStep('searching');
    const fullNumber = country.dial.replace('+', '') + digits;
    fetch(`/api/lookup/phone?number=${encodeURIComponent(fullNumber)}`)
      .then(r => r.json())
      .then(data => {
        const realCarrier = (data.success && data.valid && data.carrier) ? data.carrier : fallback.carrier;
        setLookup({ carrier: realCarrier, city: fallback.city, loading: false });
        const coords = CITY_COORDS[fallback.city];
        if (coords) setMapTarget({ center: [coords[0], coords[1]], zoom: coords[2] });
      })
      .catch(() => {
        setLookup({ ...fallback, loading: false });
        const coords = CITY_COORDS[fallback.city];
        if (coords) setMapTarget({ center: [coords[0], coords[1]], zoom: coords[2] });
      });
  };
  const handleSearchComplete = () => { setSearchOverlay(false); setResultModal(true); history.replaceState({ step: 'located' }, '', '/track#located'); };
  const handleContinueToReport = () => { setResultModal(false); setReportPage(true); pushStep('report'); };
  const trackDigits = phone.replace(/\D/g, '');
  const trackRange = PHONE_LENGTHS[country?.code] || [7, 15];
  const valid = trackDigits.length >= trackRange[0] && trackDigits.length <= trackRange[1];

  // Helper: entrance animation style for staggered hero elements
  const heroAnim = (delayMs) => ({
    opacity: heroReady ? 1 : 0,
    transform: heroReady ? 'translateY(0)' : 'translateY(18px)',
    transition: `opacity 0.5s ease ${delayMs}ms, transform 0.5s ease ${delayMs}ms`
  });

  // ─── RENDER ─────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT, color: INK, position: 'relative', overflowX: 'hidden' }}>
      {/* Splash overlay */}
      {!splashDone && <SplashOverlay onDone={() => setSplashDone(true)} />}

      {/* Noise texture overlay */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.015,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        backgroundSize: '128px 128px'
      }} />

      {/* NAV — left-aligned logo, right "encrypted" badge */}
      <nav style={{
        maxWidth: 1200, margin: '0 auto', padding: isMobile ? '16px 20px' : '20px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1
      }}>
        <TracifyLogo size={isMobile ? 20 : 22} accent={ACCENT} color="#1A1028" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: MONO, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'blink 2s infinite' }} />
          Encrypted
        </div>
      </nav>

      {/* HERO — Split layout: text left, phone mockup right */}
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 20px 40px' : '60px 40px 80px',
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 60,
        alignItems: 'center', position: 'relative', zIndex: 1
      }}>
        {/* LEFT — Copy */}
        <div>
          <div style={{
            ...heroAnim(0),
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: isMobile ? 16 : 20,
            background: `${ACCENT}15`, border: `1px solid ${ACCENT}30`, borderRadius: 6,
            padding: '6px 12px', fontSize: 12, fontFamily: MONO, color: ACCENT, letterSpacing: 0.5
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            DISCRETE MONITORING
          </div>

          <h1 style={{ ...heroAnim(100), fontSize: isMobile ? 34 : 52, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.5, margin: '0 0 18px' }}>
            See the truth.<br />
            <span style={{ color: ACCENT }}>Tonight.</span>
          </h1>

          <p style={{ ...heroAnim(200), fontSize: isMobile ? 15 : 17, lineHeight: 1.6, color: '#6B6280', maxWidth: 440, margin: '0 0 24px' }}>
            Find out where they really are. Monitor call logs, text history, and real-time GPS — all from one number.
          </p>

          {/* Tags */}
          <div style={{ ...heroAnim(300), display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: isMobile ? 24 : 32 }}>
            {['Call logs', 'Text history', 'GPS location', 'Activity timeline', 'Discreet mode'].map(t => (
              <span key={t} style={{
                padding: '5px 12px', borderRadius: 4, fontSize: isMobile ? 11 : 12, fontWeight: 500,
                background: SURFACE2, border: `1px solid ${BORDER}`, color: '#4A4358'
              }}>{t}</span>
            ))}
          </div>

          {/* Phone input */}
          <div style={{ ...heroAnim(400), display: 'flex', alignItems: 'center', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 5, maxWidth: isMobile ? '100%' : 420 }}>
            <button onClick={() => setSheetOpen(true)} style={{ height: 44, padding: '0 12px', border: 'none', background: SURFACE2, borderRadius: 7, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}>
              <span style={{ fontSize: 18 }}>{country.flag}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: INK, fontFamily: MONO }}>{country.dial}</span>
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 3.5L5 7l3-3.5" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
            <input type="tel" value={phone} maxLength={(PHONE_LENGTHS[country?.code] || [7,15])[1] + 3} onChange={e => setPhone(formatPhone(e.target.value))} onKeyDown={e => e.key === 'Enter' && handleLocate()}
              placeholder="Enter their number"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: INK, fontFamily: FONT, padding: '0 12px', minWidth: 0 }} />
          </div>
          {phone.length > 0 && (() => {
              const digits = phone.replace(/\D/g, '');
              const range = PHONE_LENGTHS[country?.code] || [7, 15];
              const valid = digits.length >= range[0] && digits.length <= range[1];
              if (valid) return null;
              const needed = range[0] === range[1] ? `${range[0]} digits` : `${range[0]}-${range[1]} digits`;
              return React.createElement('div', {
                  style: { fontSize: 11, color: '#dc2626', marginTop: 4, fontFamily: 'inherit' }
              }, `${needed} required for ${country?.name || 'this country'} (${digits.length} entered)`);
          })()}

          <button onClick={handleLocate} disabled={!valid} className="cta-glow" style={{
            ...heroAnim(500),
            marginTop: 10, width: isMobile ? '100%' : '100%', maxWidth: isMobile ? '100%' : 420, height: 52, borderRadius: 10, border: 'none',
            background: valid ? `linear-gradient(135deg, ${ACCENT}, #9333EA)` : '#D6D0E5',
            color: '#fff', fontSize: 15, fontWeight: 600, cursor: valid ? 'pointer' : 'not-allowed',
            boxShadow: valid ? `0 8px 30px ${ACCENT_GLOW}` : 'none', fontFamily: FONT,
            transition: 'all 200ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Start monitoring
          </button>
          <p style={{ fontSize: 11, color: '#9490A3', marginTop: 10, maxWidth: isMobile ? '100%' : 420, lineHeight: 1.5, fontFamily: MONO }}>
            * Consent-based SMS sent to target. All monitoring is legal and compliant.
          </p>
        </div>

        {/* RIGHT — Couple animation + Fake phone mockup */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'center',
          opacity: heroReady ? 1 : 0,
          transform: heroReady ? 'translateX(0)' : 'translateX(40px)',
          transition: 'opacity 0.6s ease 300ms, transform 0.6s ease 300ms'
        }}>
          {/* Investigation scene illustration */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, animation: 'couple-bob 4s ease-in-out infinite' }}>
            <svg width={isMobile ? 180 : 240} height={isMobile ? 180 : 240} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Background subtle grid */}
              <line x1="0" y1="250" x2="300" y2="250" stroke="#E9E5F5" strokeWidth="0.5" opacity="0.5" />

              {/* Left figure — foreground, sneaking, looking at phone */}
              <g>
                {/* Head */}
                <circle cx="80" cy="120" r="22" fill="#7C3AED" opacity="0.85" />
                {/* Body — leaning forward */}
                <rect x="62" y="146" width="36" height="55" rx="14" fill="#7C3AED" opacity="0.65" transform="rotate(-5 80 173)" />
                {/* Arm extended holding phone */}
                <rect x="100" y="158" width="28" height="8" rx="4" fill="#7C3AED" opacity="0.5" />
                {/* Phone in hand */}
                <rect x="126" y="148" width="14" height="24" rx="3" fill="#1A1028" stroke="#7C3AED" strokeWidth="1.5" />
                <rect x="129" y="152" width="8" height="14" rx="1.5" fill="#C4B5FD" opacity="0.6" />
                {/* Phone screen glow */}
                <rect x="129" y="152" width="8" height="14" rx="1.5" fill="#7C3AED" opacity="0.15">
                  <animate attributeName="opacity" values="0.15;0.35;0.15" dur="2s" repeatCount="indefinite" />
                </rect>
                {/* Legs */}
                <rect x="66" y="196" width="12" height="38" rx="5" fill="#7C3AED" opacity="0.5" transform="rotate(-3 72 215)" />
                <rect x="82" y="196" width="12" height="38" rx="5" fill="#7C3AED" opacity="0.5" transform="rotate(2 88 215)" />
              </g>

              {/* Right figure — background, turned away, oblivious */}
              <g opacity="0.5">
                {/* Head */}
                <circle cx="220" cy="130" r="20" fill="#A78BFA" opacity="0.7" />
                {/* Body — standing straight, facing away */}
                <rect x="204" y="154" width="32" height="50" rx="13" fill="#A78BFA" opacity="0.45" transform="rotate(3 220 179)" />
                {/* Arms down */}
                <rect x="196" y="164" width="8" height="30" rx="4" fill="#A78BFA" opacity="0.35" transform="rotate(5 200 179)" />
                <rect x="236" y="164" width="8" height="30" rx="4" fill="#A78BFA" opacity="0.35" transform="rotate(-5 240 179)" />
                {/* Legs */}
                <rect x="208" y="200" width="11" height="36" rx="5" fill="#A78BFA" opacity="0.35" />
                <rect x="222" y="200" width="11" height="36" rx="5" fill="#A78BFA" opacity="0.35" />
              </g>

              {/* Broken connection lines between figures */}
              <line x1="102" y1="135" x2="130" y2="140" stroke="#C4B5FD" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.4" />
              <line x1="140" y1="142" x2="155" y2="144" stroke="#C4B5FD" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.25" />
              <line x1="170" y1="144" x2="198" y2="140" stroke="#C4B5FD" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.4" />

              {/* Question mark between them */}
              <g style={{ animation: 'couple-pulse 2.5s ease-in-out infinite' }}>
                <text x="148" y="132" fontSize="26" fill="#7C3AED" fontFamily="sans-serif" fontWeight="700" opacity="0.5">?</text>
              </g>

              {/* Timeline / trail visualization at bottom */}
              <g opacity="0.6">
                <line x1="40" y1="260" x2="260" y2="260" stroke="#E9E5F5" strokeWidth="1.5" />
                <circle cx="60" cy="260" r="4" fill="#C4B5FD" />
                <circle cx="110" cy="260" r="4" fill="#A78BFA" />
                <circle cx="160" cy="260" r="5" fill="#7C3AED" />
                <circle cx="210" cy="260" r="4" fill="#A78BFA" />
                <circle cx="250" cy="260" r="4" fill="#C4B5FD" />
                {/* Active dot pulse */}
                <circle cx="160" cy="260" r="5" fill="#7C3AED" opacity="0.4">
                  <animate attributeName="r" values="5;10;5" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
                {/* Time labels */}
                <text x="52" y="275" fontSize="7" fill="#9490A3" fontFamily="monospace">9PM</text>
                <text x="102" y="275" fontSize="7" fill="#9490A3" fontFamily="monospace">10PM</text>
                <text x="152" y="275" fontSize="7" fill="#9490A3" fontFamily="monospace">11PM</text>
                <text x="202" y="275" fontSize="7" fill="#9490A3" fontFamily="monospace">12AM</text>
                <text x="243" y="275" fontSize="7" fill="#9490A3" fontFamily="monospace">1AM</text>
              </g>

              {/* Floating chat bubble with "..." */}
              <g style={{ animation: 'couple-float 3s ease-in-out infinite' }}>
                <rect x="118" y="88" width="36" height="22" rx="8" fill="#F3F0FF" stroke="#E9E5F5" strokeWidth="1" />
                <polygon points="130,110 135,110 128,117" fill="#F3F0FF" stroke="#E9E5F5" strokeWidth="1" />
                <circle cx="128" cy="99" r="2" fill="#7C3AED" opacity="0.7" />
                <circle cx="136" cy="99" r="2" fill="#7C3AED" opacity="0.5" />
                <circle cx="144" cy="99" r="2" fill="#7C3AED" opacity="0.3" />
              </g>

              {/* Floating phone icon (top left area) */}
              <g style={{ animation: 'couple-float 2.8s ease-in-out 0.5s infinite' }}>
                <rect x="30" y="80" width="24" height="24" rx="6" fill="#F3F0FF" stroke="#E9E5F5" strokeWidth="1" />
                <path d="M39 86a1 1 0 011 .86l.5 3a1 1 0 01-.45 1.05l-1 .6a8 8 0 003.55 3.55l.6-1a1 1 0 011.05-.45l3 .5A1 1 0 0147 95v1.5a1.5 1.5 0 01-1.5 1.5A11.5 11.5 0 0134 86.5 1.5 1.5 0 0135.5 85H37a1 1 0 011 .86z" fill="none" stroke="#7C3AED" strokeWidth="1.2" transform="translate(-1, -1) scale(0.7)" />
                <circle cx="42" cy="84" r="4" fill="#EF4444" opacity="0.9" />
                <text x="40.5" y="87" fontSize="6" fill="#fff" fontFamily="sans-serif" fontWeight="700">3</text>
              </g>

              {/* Floating clock showing late night (top right area near right figure) */}
              <g style={{ animation: 'couple-float 3.2s ease-in-out 1s infinite' }}>
                <circle cx="248" cy="90" r="14" fill="#F3F0FF" stroke="#E9E5F5" strokeWidth="1" />
                <circle cx="248" cy="90" r="10" fill="none" stroke="#7C3AED" strokeWidth="1" opacity="0.5" />
                {/* Clock hands — pointing to ~2:15 AM */}
                <line x1="248" y1="90" x2="248" y2="83" stroke="#1A1028" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="248" y1="90" x2="254" y2="92" stroke="#7C3AED" strokeWidth="0.8" strokeLinecap="round" />
                <circle cx="248" cy="90" r="1.2" fill="#1A1028" />
                <text x="238" y="112" fontSize="7" fill="#9490A3" fontFamily="monospace">2:15 AM</text>
              </g>

              {/* Floating notification badge (between figures, lower) */}
              <g style={{ animation: 'couple-float 2.5s ease-in-out 0.3s infinite' }}>
                <rect x="155" y="180" width="22" height="22" rx="6" fill="#F3F0FF" stroke="#E9E5F5" strokeWidth="1" />
                <path d="M166 186v5a2 2 0 01-2 2h0a2 2 0 01-2-2v-5a4 4 0 018 0z" fill="none" stroke="#7C3AED" strokeWidth="1" />
                <line x1="162" y1="195" x2="170" y2="195" stroke="#7C3AED" strokeWidth="1" />
                <circle cx="172" cy="184" r="3.5" fill="#EF4444" opacity="0.9" />
              </g>

              {/* Magnifying glass element — large, subtle in background */}
              <g opacity="0.12">
                <circle cx="155" cy="155" r="45" fill="none" stroke="#7C3AED" strokeWidth="3" />
                <line x1="185" y1="185" x2="210" y2="210" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" />
              </g>

              {/* ─── Floating info card — upper right ─── */}
              <g>
                {/* Card shadow */}
                <rect x="172" y="20" width="120" height="56" rx="10" fill="#7C3AED" opacity="0.08" />
                {/* Card background */}
                <rect x="170" y="18" width="120" height="56" rx="10" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="1.5">
                  <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
                </rect>
                {/* Pulsing red dot */}
                <circle cx="182" cy="32" r="4" fill="#EF4444">
                  <animate attributeName="r" values="3.5;5;3.5" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.6;1" dur="1.8s" repeatCount="indefinite" />
                </circle>
                {/* Card title */}
                <text x="190" y="35" fontSize="8" fill="#1A1028" fontFamily="sans-serif" fontWeight="700">Activity Alert</text>
                {/* Card subtitle */}
                <text x="182" y="50" fontSize="7.5" fill="#6B6280" fontFamily="monospace">3 Unknown Calls</text>
                {/* Divider */}
                <line x1="182" y1="56" x2="280" y2="56" stroke="#E9E5F5" strokeWidth="0.8" />
                {/* Detail */}
                <text x="182" y="66" fontSize="6.5" fill="#EF4444" fontFamily="monospace" fontWeight="600">Late Night Activity Found</text>
              </g>
            </svg>
          </div>
          <div style={{
            width: isMobile ? 240 : 320, background: '#FFFFFF', borderRadius: 28, padding: '16px 0',
            border: `1px solid ${BORDER}`, boxShadow: `0 20px 60px rgba(124,58,237,0.08), 0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(124,58,237,0.05)`,
            overflow: 'hidden', animation: 'drift 6s ease-in-out infinite', position: 'relative'
          }}>
            {/* Scan line effect */}
            <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${ACCENT}55, transparent)`, animation: 'scan-v 2.5s linear infinite', zIndex: 2, pointerEvents: 'none' }} />
            <div style={{ padding: '4px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: isMobile ? 10 : 11, fontFamily: MONO, color: MUTED }}>
              <span>9:41 PM</span>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill={MUTED}><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                <svg width="14" height="12" viewBox="0 0 24 14" fill={MUTED}><rect x="0" y="0" width="22" height="14" rx="2" stroke={MUTED} strokeWidth="1.5" fill="none"/><rect x="2" y="2" width="14" height="10" rx="1" fill="#22C55E"/></svg>
              </div>
            </div>
            <div style={{ padding: isMobile ? '0 12px' : '0 16px' }}>
              <div style={{ fontSize: isMobile ? 9 : 10, fontFamily: MONO, color: ACCENT, letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>Recent Activity</div>
              {[
                { type: 'call', who: 'Unknown (+1 347 •••)', time: '11:34 PM', dur: '23 min', flag: true },
                { type: 'sms', who: 'Sarah M.', time: '10:12 PM', dur: '4 messages' },
                { type: 'call', who: 'Unknown (+1 917 •••)', time: '9:45 PM', dur: '8 min', flag: true },
                { type: 'loc', who: 'Location changed', time: '9:30 PM', dur: 'Downtown area' },
                { type: 'sms', who: 'Alex W.', time: '8:55 PM', dur: '12 messages', flag: true },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10, padding: isMobile ? '8px 0' : '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${BORDER}` }}>
                  <div style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 8, flexShrink: 0, background: item.flag ? `${ACCENT}20` : SURFACE2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.type === 'call' && <svg width={isMobile ? 12 : 14} height={isMobile ? 12 : 14} viewBox="0 0 24 24" fill="none" stroke={item.flag ? ACCENT : MUTED} strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>}
                    {item.type === 'sms' && <svg width={isMobile ? 12 : 14} height={isMobile ? 12 : 14} viewBox="0 0 24 24" fill="none" stroke={item.flag ? ACCENT : MUTED} strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}
                    {item.type === 'loc' && <svg width={isMobile ? 12 : 14} height={isMobile ? 12 : 14} viewBox="0 0 24 24" fill={ACCENT}><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill={SURFACE}/></svg>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: isMobile ? 11 : 12.5, fontWeight: 600, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.who}</div>
                    <div style={{ fontSize: isMobile ? 9.5 : 10.5, color: MUTED, fontFamily: MONO }}>{item.dur}</div>
                  </div>
                  <div style={{ fontSize: isMobile ? 9 : 10, color: MUTED, fontFamily: MONO, flexShrink: 0 }}>{item.time}</div>
                  {item.flag && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />}
                </div>
              ))}
            </div>
            <div style={{ margin: isMobile ? '10px 12px 0' : '12px 16px 0', padding: isMobile ? 12 : 14, borderRadius: 10, background: `linear-gradient(135deg, ${ACCENT}12, ${ACCENT}06)`, border: `1px solid ${ACCENT}30`, textAlign: 'center', fontSize: isMobile ? 10.5 : 11.5, color: ACCENT, fontWeight: 600 }}>
              <svg width="12" height="12" viewBox="0 0 11 11" fill="none" stroke={ACCENT} strokeWidth="1.4" style={{ marginRight: 6, verticalAlign: -1 }}><rect x="2" y="5" width="7" height="5" rx="1" /><path d="M3.5 5V3.5a2 2 0 014 0V5" /></svg>
              Unlock full monitoring access
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES — Horizontal scroll cards */}
      <div style={{ position: 'relative', zIndex: 1, padding: isMobile ? '36px 0' : '60px 0', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div ref={featuresHeadRef} style={{
          maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 20px' : '0 20px',
          opacity: featuresHeadVisible ? 1 : 0, transform: featuresHeadVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease'
        }}>
          <div style={{ fontSize: 11, fontFamily: MONO, color: ACCENT, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>CAPABILITIES</div>
          <h2 style={{ fontSize: isMobile ? 26 : 38, fontWeight: 700, letterSpacing: -1, margin: '0 0 28px', color: INK }}>Everything they're hiding.</h2>
        </div>
        <div ref={featuresRowRef} style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: isMobile ? '0 20px 16px' : '0 20px 20px', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          {[
            { icon: '\u{1F4DE}', title: 'Call Logs', desc: 'See every incoming and outgoing call. Duration, frequency, late-night patterns.', stat: 'Real-time' },
            { icon: '\u{1F4AC}', title: 'Text Messages', desc: 'Monitor SMS activity. See who they text most and when.', stat: 'Live feed' },
            { icon: '\u{1F4CD}', title: 'GPS Tracking', desc: 'Live location updated every 60 seconds. Full movement trail.', stat: '\u00b14m accuracy' },
            { icon: '\u{1F550}', title: 'Activity Timeline', desc: 'Chronological feed of all phone activity. Calls, texts, locations.', stat: '30-day history' },
            { icon: '\u{1F47B}', title: 'Stealth Mode', desc: 'Completely invisible. No app icon, no notifications on their phone.', stat: 'Undetectable' },
            { icon: '\u{1F4CA}', title: 'Reports', desc: 'Weekly summary of suspicious patterns. Automated anomaly detection.', stat: 'AI-powered' },
          ].map((f, i) => (
            <div key={i} className="feature-card" style={{
              flexShrink: 0, width: isMobile ? 260 : 260, minWidth: isMobile ? 240 : 260, scrollSnapAlign: 'start',
              background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: isMobile ? 16 : 20,
              display: 'flex', flexDirection: 'column', gap: 12,
              opacity: featuresRowVisible ? 1 : 0,
              transform: featuresRowVisible ? 'translateX(0)' : 'translateX(-30px)',
              transition: `opacity 0.45s ease ${i * 100}ms, transform 0.45s ease ${i * 100}ms, border-color 0.2s, box-shadow 0.2s`,
              cursor: 'default'
            }}>
              <div style={{ fontSize: 28 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 600, color: INK, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#6B6280', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
              <div style={{ marginTop: 'auto', padding: '4px 10px', borderRadius: 4, background: `${ACCENT}15`, fontSize: 11, fontFamily: MONO, color: ACCENT, alignSelf: 'flex-start', fontWeight: 500 }}>{f.stat}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TESTIMONIALS — 2-column grid, dark cards */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '40px 20px' : '72px 40px', position: 'relative', zIndex: 1 }}>
        <div ref={testimonialsHeadRef} style={{
          opacity: testimonialsHeadVisible ? 1 : 0, transform: testimonialsHeadVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease'
        }}>
          <div style={{ fontSize: 11, fontFamily: MONO, color: ACCENT, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>REAL STORIES</div>
          <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 700, letterSpacing: -0.5, margin: '0 0 32px', color: INK }}>The truth changes everything.</h2>
        </div>
        <div ref={testimonialsGridRef} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          {REVIEWS.map((r, i) => (
            <div key={i} className="testimonial-card" style={{
              background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? '16px 16px' : '18px 20px',
              display: 'flex', flexDirection: 'column', gap: 10,
              borderLeft: '0px solid transparent',
              opacity: testimonialsGridVisible ? 1 : 0,
              transform: testimonialsGridVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.45s ease ${i * 80}ms, transform 0.45s ease ${i * 80}ms, border-left 0.2s`
            }}>
              <p style={{ fontSize: isMobile ? 13.5 : 14.5, lineHeight: 1.55, color: '#4A4358', margin: 0, fontStyle: 'italic' }}>"{r.q}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${ACCENT}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: ACCENT }}>{r.n[0]}</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#6B6280' }}>{r.n}</span>
                <span style={{ fontSize: 10, color: '#9490A3', marginLeft: 'auto', fontFamily: MONO }}>{r.t}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: isMobile ? '20px 16px 32px' : '24px 20px 36px', fontSize: 11, color: '#9490A3', fontFamily: MONO, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 12 : 16, flexWrap: 'wrap' }}>
          <a href="/terms" style={{ color: MUTED, textDecoration: 'none' }}>Terms</a>
          <span style={{ color: BORDER }}>|</span>
          <a href="/privacy" style={{ color: MUTED, textDecoration: 'none' }}>Privacy</a>
          <span style={{ color: BORDER }}>|</span>
          <a href="/contact" style={{ color: MUTED, textDecoration: 'none' }}>Contact</a>
        </div>
        <div style={{ marginTop: 8 }}>&copy; 2026 Tracify. All monitoring is consent-based.</div>
      </div>

      {/* OVERLAYS */}
      {sheetOpen && <CountrySheet countries={window.COUNTRIES} selectedCode={country.code} onSelect={setCountry} onClose={() => setSheetOpen(false)} isMobile={isMobile} />}
      {searchOverlay && <SearchingOverlay country={country} phone={phone} carrier={lookup.carrier} mapTarget={mapTarget} onComplete={handleSearchComplete} onClose={() => history.back()} />}
      {resultModal && <LocatedModal onClose={() => history.back()} onContinue={handleContinueToReport} country={country} phoneDisplay={phone || '--- --- ----'} carrier={lookup.carrier} city={lookup.city} localTime={localTime} tzSign={country.tzOffset >= 0 ? '+' : ''} />}
      {reportPage && <ReportPage onBack={() => history.back()} country={country} phone={phone} carrier={lookup.carrier} city={lookup.city} />}
    </div>
  );
}

// ─── Searching Overlay — dark terminal feel ────────────
function SearchingOverlay({ country, phone, carrier, mapTarget, onComplete, onClose }) {
  const STEPS = ['Intercepting cellular signal', 'Decrypting carrier handshake', 'Establishing covert connection'];
  const STEP_DURATION = 1500;
  const TOTAL = STEP_DURATION * STEPS.length;
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 820);
  useEffect(() => { const fn = () => setIsMobile(window.innerWidth < 820); window.addEventListener('resize', fn); return () => window.removeEventListener('resize', fn); }, []);
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);
  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const elapsed = now - start;
      setProgress(Math.min(100, (elapsed / TOTAL) * 100));
      setActiveStep(Math.min(STEPS.length - 1, Math.floor(elapsed / STEP_DURATION)));
      if (elapsed < TOTAL) raf = requestAnimationFrame(tick);
      else setTimeout(onComplete, 400);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(26,16,40,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.85 }}>
        <RealMap country={mapTarget ? { ...country, center: mapTarget.center, zoom: mapTarget.zoom } : country} playing={true} accent={ACCENT} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 0%, rgba(26,16,40,0.45) 80%)' }} />
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, width: 36, height: 36, borderRadius: 8, border: `1px solid ${BORDER}`, background: SURFACE, cursor: 'pointer', color: MUTED, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
      <div style={{ position: 'relative', zIndex: 10, width: '90%', maxWidth: isMobile ? 340 : 440, background: SURFACE, borderRadius: 16, padding: isMobile ? 16 : 24, border: `1px solid ${BORDER}`, boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 40px ${ACCENT}10` }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: ACCENT, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>
          <span style={{ animation: 'blink 1s infinite' }}>{'\u25CF'}</span> SCANNING TARGET
        </div>
        <div style={{ fontSize: isMobile ? 17 : 22, fontWeight: 700, color: INK, marginBottom: 4 }}>Analyzing device...</div>
        <div style={{ fontSize: isMobile ? 11 : 13, color: MUTED, fontFamily: MONO, marginBottom: 20 }}>{country.flag} {country.dial} {phone || '--- --- ----'}</div>
        <div style={{ height: 4, borderRadius: 999, background: SURFACE2, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${ACCENT}, #A855F7)`, borderRadius: 999, transition: 'width 100ms linear', boxShadow: `0 0 12px ${ACCENT}55` }} />
        </div>
        {STEPS.map((label, i) => {
          const done = i < activeStep, active = i === activeStep;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', opacity: done || active ? 1 : 0.35 }}>
              <div style={{ width: isMobile ? 16 : 20, height: isMobile ? 16 : 20, borderRadius: 6, flexShrink: 0, background: done ? ACCENT : SURFACE2, border: done ? 'none' : `1.5px solid ${active ? ACCENT : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {done && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M10 3L4.5 8.5 2 6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT, animation: 'blink 1.2s infinite' }} />}
              </div>
              <span style={{ fontSize: isMobile ? 11 : 13, fontFamily: MONO, color: active ? INK : MUTED, fontWeight: active ? 600 : 400 }}>
                {label}{active && <span style={{ color: ACCENT }}>_</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Located Modal ─────────────────────────────────────
function LocatedModal({ onClose, onContinue, country, phoneDisplay, carrier, city, localTime, tzSign }) {
  useEffect(() => { const fn = e => { if(e.key==='Escape') onClose(); }; window.addEventListener('keydown', fn); document.body.style.overflow='hidden'; return () => { window.removeEventListener('keydown', fn); document.body.style.overflow=''; }; }, [onClose]);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: 20 }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 420, background: SURFACE, borderRadius: 16, overflow: 'hidden', border: `1px solid ${BORDER}`, boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', animation: 'blink 1.4s infinite' }} />
            <span style={{ fontSize: 12, fontFamily: MONO, color: '#22C55E', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Target located</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: 18 }}>x</button>
        </div>
        <div style={{ padding: '12px 22px' }}>
          {[
            { l: 'Carrier', v: carrier },
            { l: 'Number', v: `${country.dial} ${phoneDisplay}`, mono: true },
            { l: 'Country', v: `${country.flag}  ${country.name}` },
            { l: 'Local time', v: `${localTime}  UTC${tzSign}${country.tzOffset}`, mono: true },
            { l: 'City', v: '\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588', mono: true, blur: true },
            { l: 'Exact address', v: '\u2588\u2588 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588 \u2588\u2588\u2588, \u2588\u2588\u2588\u2588\u2588\u2588', mono: true, blur: true },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < 5 ? `1px solid ${BORDER}` : 'none' }}>
              <div style={{ fontSize: 10.5, fontFamily: MONO, color: MUTED, letterSpacing: 0.5, textTransform: 'uppercase', width: 90, flexShrink: 0 }}>{row.l}</div>
              <div style={{ fontSize: 14, color: row.blur ? '#9490A3' : INK, fontWeight: 500, fontFamily: row.mono ? MONO : FONT, filter: row.blur ? 'blur(4px)' : 'none', userSelect: row.blur ? 'none' : 'auto' }}>{row.v}</div>
              {row.blur && <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke={ACCENT} strokeWidth="1.4" style={{ marginLeft: 'auto' }}><rect x="2" y="5" width="7" height="5" rx="1" /><path d="M3.5 5V3.5a2 2 0 014 0V5" /></svg>}
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 22px 20px' }}>
          <button onClick={onContinue} style={{ width: '100%', height: 48, border: 'none', background: `linear-gradient(135deg, ${ACCENT}, #9333EA)`, color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: `0 8px 24px ${ACCENT_GLOW}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Unlock full report
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7h10m-4-4l4 4-4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, fontFamily: MONO, color: '#9490A3' }}>256-bit encryption . 100% confidential</div>
        </div>
      </div>
    </div>
  );
}

// ─── Report Page ───────────────────────────────────────
function ReportPage({ onBack, country, phone, carrier, city }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 820);
  useEffect(() => { document.body.style.overflow='hidden'; const fn = () => setIsMobile(window.innerWidth < 820); window.addEventListener('resize', fn); return () => { document.body.style.overflow=''; window.removeEventListener('resize', fn); }; }, []);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const handleSubmit = async () => {
    if (!validEmail || loading) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, phoneToTrack: phone.replace(/\D/g, ''), countryCode: country.dial, source: 'track', plan: 'track' }) });
      const data = await res.json();
      if (!res.ok) { if (data.error && data.error.includes('already exists')) { setError('Account exists. Redirecting...'); setTimeout(() => { window.location.href = '/payment'; }, 1500); return; } throw new Error(data.error || 'Failed'); }
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else window.location.href = data.redirectTo || '/payment';
    } catch (err) { setError(err.message); setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: BG, overflowY: 'auto', fontFamily: FONT, color: INK }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
        <TracifyLogo size={20} accent={ACCENT} color="#1A1028" />
        <button onClick={onBack} style={{ fontSize: 12, color: MUTED, background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: MONO }}>
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M10 6H2m4-3L2 6l4 3" stroke={MUTED} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>Back
        </button>
      </div>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '32px 20px 80px' : '48px 24px 80px' }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: ACCENT, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: ACCENT, animation: 'blink 1.4s infinite' }} />INTELLIGENCE REPORT
        </div>
        <h1 style={{ fontSize: isMobile ? 32 : 44, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1, margin: '0 0 12px' }}>Target profile<br />compiled.</h1>
        <p style={{ fontSize: 16, color: '#6B6280', maxWidth: 500, lineHeight: 1.6, margin: '0 0 36px' }}>We've matched the device. Enter your email to access call logs, text history, and real-time GPS.</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr', gap: 24, alignItems: 'start' }}>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, fontFamily: MONO, fontSize: 10.5, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' }}>Extracted data</div>
            {[
              { l: 'SIM Carrier', v: carrier },
              { l: 'Number', v: `${country.dial} ${phone || '---'}` },
              { l: 'Country', v: `${country.flag}  ${country.name}` },
              { l: 'City', v: '\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588', blur: true },
              { l: 'Signal', v: '\u00b147m accuracy' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '13px 20px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 10.5, fontFamily: MONO, color: MUTED, letterSpacing: 0.5, textTransform: 'uppercase', width: 100 }}>{r.l}</div>
                <div style={{ fontSize: 14, color: r.blur ? '#C4BFD6' : INK, fontWeight: 500, filter: r.blur ? 'blur(4px)' : 'none', userSelect: r.blur ? 'none' : 'auto' }}>{r.v}</div>
                {r.blur && <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke={ACCENT} strokeWidth="1.4" style={{ marginLeft: 'auto' }}><rect x="2" y="5" width="7" height="5" rx="1" /><path d="M3.5 5V3.5a2 2 0 014 0V5" /></svg>}
              </div>
            ))}
            <div style={{ padding: '16px 20px', background: `linear-gradient(180deg, ${SURFACE} 0%, ${BG} 100%)` }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: ACCENT, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="10" height="10" viewBox="0 0 11 11" fill="none" stroke={ACCENT} strokeWidth="1.4"><rect x="2" y="5" width="7" height="5" rx="1" /><path d="M3.5 5V3.5a2 2 0 014 0V5" /></svg>LOCKED
              </div>
              {['Full call log (30 days)', 'Text message contacts', 'Frequent locations map', 'Late-night activity patterns'].map((item, i) => (
                <div key={i} style={{ padding: '10px 0', borderTop: i > 0 ? `1px dashed ${BORDER}` : 'none' }}>
                  <div style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>{item}</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, color: '#C4BFD6', filter: 'blur(4px)', userSelect: 'none', marginTop: 3 }}>{'\u2588\u2588\u2588\u2588 \u2588\u2588\u2588\u2588\u2588\u2588 \u2588\u2588\u2588\u2588\u2588\u2588\u2588'}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 22, position: isMobile ? 'static' : 'sticky', top: 24 }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, color: ACCENT, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>START MONITORING</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Unlock everything</h3>
            <p style={{ fontSize: 13, color: '#6B6280', margin: '0 0 20px', lineHeight: 1.5 }}>Create your account. Full access in under 60 seconds.</p>
            <div style={{ marginBottom: 4, fontSize: 10.5, fontFamily: MONO, color: MUTED, letterSpacing: 0.5, textTransform: 'uppercase' }}>Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSubmit()} placeholder="you@example.com" autoFocus
              style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '13px 14px', fontSize: 14, outline: 'none', fontFamily: FONT, background: SURFACE2, color: INK, boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = BORDER} />
            {error && <div style={{ marginTop: 8, fontSize: 12, color: '#EF4444', fontWeight: 500 }}>{error}</div>}
            <button onClick={handleSubmit} disabled={!validEmail || loading} style={{
              marginTop: 14, width: '100%', height: 50, border: 'none',
              background: validEmail && !loading ? `linear-gradient(135deg, ${ACCENT}, #9333EA)` : '#D6D0E5',
              color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: validEmail && !loading ? 'pointer' : 'not-allowed',
              boxShadow: validEmail && !loading ? `0 8px 24px ${ACCENT_GLOW}` : 'none', fontFamily: FONT
            }}>{loading ? 'Creating account...' : 'Start for $0.50'}</button>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: '#9490A3', lineHeight: 1.6 }}>
              $0.50 for 24h trial, then $14.99/mo. Cancel anytime.<br />
              <a href="/terms" style={{ color: ACCENT, textDecoration: 'none' }}>Terms</a> & <a href="/privacy" style={{ color: ACCENT, textDecoration: 'none' }}>Privacy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Country Sheet ──────────────────────────────────────
function CountrySheet({ countries, selectedCode, onSelect, onClose, isMobile }) {
  const [q, setQ] = useState('');
  const filtered = countries.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.dial.includes(q));
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: isMobile ? '90%' : 400, maxWidth: 400, maxHeight: '70vh', background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, boxShadow: '0 20px 60px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', fontFamily: FONT }}>
        <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: INK, marginBottom: 10 }}>Select country</div>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search" style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', fontFamily: FONT, background: SURFACE2, color: INK, boxSizing: 'border-box' }} />
        </div>
        <div style={{ overflowY: 'auto', padding: 6 }}>
          {filtered.map(c => (
            <button key={c.code} onClick={() => { onSelect(c); onClose(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', background: selectedCode===c.code ? SURFACE2 : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontFamily: FONT }}>
              <span style={{ fontSize: 18 }}>{c.flag}</span>
              <span style={{ flex: 1, fontSize: 13.5, color: INK, fontWeight: 500 }}>{c.name}</span>
              <span style={{ fontSize: 12, color: MUTED, fontFamily: MONO }}>{c.dial}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Reviews ────────────────────────────────────────────
const REVIEWS = [
  { n: 'Jessica R.', t: '3 days ago', q: "I had a gut feeling. Tracify confirmed it. He was at her apartment every Tuesday and Thursday night." },
  { n: 'Mike T.', t: '1 week ago', q: "My teenage daughter was sneaking out at 2am. The activity timeline showed everything. We had the talk." },
  { n: 'Sarah L.', t: '5 days ago', q: "Caught him lying about working late. GPS showed he was across town. The call logs were even worse." },
  { n: 'David K.', t: '2 weeks ago', q: "I thought I was being paranoid. Turns out I wasn't. 47 calls to the same unknown number in one week." },
  { n: 'Angela M.', t: '4 days ago', q: "Used it to monitor my 16-year-old's phone activity. Found out about the vaping group chat. Worth every cent." },
  { n: 'Robert H.', t: '1 week ago', q: "She said she was at her mom's. Location showed a hotel downtown. I had all the evidence I needed." },
  { n: 'Priya S.', t: '2 weeks ago', q: "The late-night call patterns told the whole story. 3am calls to the same number, every single night." },
  { n: 'Carlos V.', t: '6 days ago', q: "My business partner was meeting with competitors behind my back. GPS and call logs proved everything." },
];

// ─── Animations ─────────────────────────────────────────
const styles = document.createElement('style');
styles.textContent = `
  @keyframes tracify-fadein { from { opacity: 0; } to { opacity: 1; } }
  @keyframes tracify-popin { 0% { transform: translateY(20px) scale(0.94); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
  @keyframes tracify-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes tracify-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes tracify-scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
  @keyframes couple-float {
    0%, 100% { transform: translateY(0); opacity: 0.7; }
    50% { transform: translateY(-8px); opacity: 1; }
  }
  @keyframes couple-pulse {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.15); opacity: 1; }
  }
  @keyframes couple-bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes scan-v {
    0% { top: 0; }
    100% { top: 100%; }
  }
  @keyframes cta-glow-pulse {
    0%, 100% { box-shadow: 0 8px 30px rgba(124,58,237,0.25); }
    50% { box-shadow: 0 8px 40px rgba(124,58,237,0.45), 0 0 20px rgba(124,58,237,0.2); }
  }
  .cta-glow:not(:disabled) {
    animation: cta-glow-pulse 2s ease-in-out infinite;
  }
  .feature-card:hover {
    border-color: #7C3AED !important;
    transform: translateY(-2px) translateX(0) !important;
    box-shadow: 0 8px 24px rgba(124,58,237,0.12);
  }
  .testimonial-card:hover {
    border-left: 3px solid #7C3AED !important;
  }
  div::-webkit-scrollbar { display: none; }
`;
document.head.appendChild(styles);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
