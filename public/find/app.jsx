// Tracify /find — Emergency Device Locator — Warm Light Theme
// Audience: Lost/stolen phone recovery
// Theme: #FFFCF7 bg, #D97706 amber accent, Space Grotesk + IBM Plex Mono

const { useState, useEffect, useRef, useMemo } = React;

const AMBER = '#D97706';
const AMBER_GLOW = 'rgba(217,119,6,0.2)';
const BG = '#FFFCF7';
const SURFACE = '#FFFFFF';
const SURFACE2 = '#FFF7ED';
const BORDER = '#F5E6D3';
const INK = '#1C1412';
const MUTED = '#78716C';
const FONT = "'Space Grotesk', sans-serif";
const MONO = "'IBM Plex Mono', monospace";
const RED = '#DC2626';
const GREEN = '#16A34A';

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
  BR: ['S\u00e3o Paulo','Rio de Janeiro','Bras\u00edlia','Salvador','Fortaleza'],
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
  'S\u00e3o Paulo': [-23.55, -46.63, 11], 'Rio de Janeiro': [-22.91, -43.17, 12],
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

// ─── Radar Animation Component ────────────────────────
function RadarPulse({ size = 200 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Concentric rings */}
      {[0.3, 0.55, 0.8, 1].map((scale, i) => (
        <div key={i} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: size * scale, height: size * scale,
          borderRadius: '50%', border: `1px solid ${AMBER}${i === 3 ? '30' : '15'}`,
          transform: 'translate(-50%, -50%)'
        }} />
      ))}
      {/* Sweep line */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', width: size / 2, height: 2,
        background: `linear-gradient(90deg, ${AMBER}AA, transparent)`,
        transformOrigin: '0 50%', animation: 'radar-sweep 3s linear infinite'
      }} />
      {/* Center dot */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', width: 10, height: 10,
        borderRadius: '50%', background: AMBER,
        transform: 'translate(-50%, -50%)',
        boxShadow: `0 0 20px ${AMBER}, 0 0 40px ${AMBER}66`
      }} />
      {/* Ping rings */}
      {[0, 1, 2].map(i => (
        <div key={'p'+i} style={{
          position: 'absolute', top: '50%', left: '50%', width: 20, height: 20,
          borderRadius: '50%', border: `2px solid ${AMBER}`,
          transform: 'translate(-50%, -50%)',
          animation: `ping-out 2.5s ${i * 0.8}s ease-out infinite`
        }} />
      ))}
    </div>
  );
}

// ─── Counter Component ─────────────────────────────────
function Counter({ end, suffix = '', duration = 2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(end * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── useInView hook — scroll-triggered visibility ─────────
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

// ─── SplashOverlay — entrance animation ──────────────────
function SplashOverlay({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const dur = 1300;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      setProgress(p * 100);
      if (p < 1) { raf = requestAnimationFrame(tick); }
      else { setFading(true); setTimeout(onDone, 500); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: '#2C1A0B',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: fading ? 0 : 1, transition: 'opacity 0.45s ease-out',
      pointerEvents: fading ? 'none' : 'auto'
    }}>
      <TracifyLogo size={36} accent={AMBER} color="#FFFCF7" />
      <div style={{ marginTop: 28 }}>
        <RadarPulse size={100} />
      </div>
      <div style={{ marginTop: 22, fontFamily: MONO, fontSize: 12, color: AMBER, letterSpacing: 2, opacity: 0.85 }}>
        Initializing GPS...
      </div>
      {/* Thin amber progress bar */}
      <div style={{ marginTop: 24, width: 180, height: 3, borderRadius: 2, background: 'rgba(217,119,6,0.15)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${progress}%`, borderRadius: 2,
          background: AMBER, transition: 'width 60ms linear'
        }} />
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
  const [showSplash, setShowSplash] = useState(true);
  const [heroReady, setHeroReady] = useState(false);
  useEffect(() => { const fn = () => setIsMobile(window.innerWidth < 820); window.addEventListener('resize', fn); return () => window.removeEventListener('resize', fn); }, []);
  useEffect(() => { fetch('/api/geo/detect').then(r=>r.json()).then(d => { if(d.success && d.countryCode) { const f = window.COUNTRIES.find(c=>c.code===d.countryCode); if(f) setCountry(f); }}).catch(()=>{}); }, []);

  // Refs for scroll-triggered sections
  const statsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  const statsVisible = useInView(statsRef, 0.15);
  const howItWorksVisible = useInView(howItWorksRef, 0.1);
  const featuresVisible = useInView(featuresRef, 0.1);
  const testimonialsVisible = useInView(testimonialsRef, 0.1);
  const ctaVisible = useInView(ctaRef, 0.15);

  const formatPhone = (raw) => { const d = raw.replace(/\D/g, '').slice(0, 12); return d.replace(/(.{3})/g, '$1 ').trim(); };

  const [searchOverlay, setSearchOverlay] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [reportPage, setReportPage] = useState(false);
  const [lookup, setLookup] = useState({ carrier: '...', city: '', loading: false });
  const [mapTarget, setMapTarget] = useState(null);

  const pushStep = (hash) => history.pushState({ step: hash }, '', '/find#' + hash);
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
    if (location.hash) history.replaceState(null, '', '/find');
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
  const handleSearchComplete = () => { setSearchOverlay(false); setResultModal(true); history.replaceState({ step: 'located' }, '', '/find#located'); };
  const handleContinueToReport = () => { setResultModal(false); setReportPage(true); pushStep('report'); };
  const findDigits = phone.replace(/\D/g, '');
  const findRange = PHONE_LENGTHS[country?.code] || [7, 15];
  const valid = findDigits.length >= findRange[0] && findDigits.length <= findRange[1];

  // ─── RENDER ─────────────────────────────────────────
  const heroDelay = (ms) => ({ animation: heroReady ? `fadeInUp 0.55s ${ms}ms both` : 'none', opacity: heroReady ? undefined : 0 });

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT, color: INK, position: 'relative' }}>

      {/* Splash Overlay */}
      {showSplash && <SplashOverlay onDone={() => { setShowSplash(false); setHeroReady(true); }} />}

      {/* Emergency scanline effect */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '30%', height: 1, background: `linear-gradient(90deg, transparent, ${AMBER}22, transparent)`, top: 0, animation: 'scan-h 8s linear infinite' }} />
        {/* Hero shimmer scan line */}
        <div style={{ position: 'absolute', width: '100%', height: '200px', top: 0, background: `linear-gradient(90deg, transparent 0%, ${AMBER}08 45%, ${AMBER}15 50%, ${AMBER}08 55%, transparent 100%)`, animation: 'hero-shimmer 6s ease-in-out infinite', pointerEvents: 'none' }} />
      </div>

      {/* NAV — command center style with status indicators */}
      <nav style={{
        maxWidth: 1200, margin: '0 auto', padding: isMobile ? '14px 20px' : '18px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <TracifyLogo size={isMobile ? 20 : 22} accent={AMBER} color="#1C1412" />
          <div style={{ height: 16, width: 1, background: BORDER }} />
          <span style={{ fontSize: 10, fontFamily: MONO, color: AMBER, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 500 }}>FIND</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontFamily: MONO, color: MUTED }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN, animation: 'status-blink 2s infinite' }} />
            SYSTEMS ONLINE
          </div>
          <div style={{ fontSize: 11, fontFamily: MONO, color: AMBER, letterSpacing: 1 }}>
            {localTime}
          </div>
        </div>
      </nav>

      {/* HERO — Full-width dark command center with centered radar */}
      <div style={{
        position: 'relative', overflow: 'hidden', zIndex: 1,
        padding: isMobile ? '40px 16px 48px' : '72px 40px 88px',
        background: 'radial-gradient(ellipse at 50% 0%, #FFF7ED 0%, #FFFCF7 70%)',
      }}>
        {/* Background radar grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: `linear-gradient(#D9770620 1px, transparent 1px), linear-gradient(90deg, #D9770620 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          {/* Status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24,
            background: `${RED}15`, border: `1px solid ${RED}40`, borderRadius: 4,
            padding: '7px 14px', fontSize: 11, fontFamily: MONO, color: RED, letterSpacing: 1, fontWeight: 600,
            ...heroDelay(0)
          }}>
            <span style={{ animation: 'status-blink 1s infinite' }}>{'\u25CF'}</span>
            EMERGENCY DEVICE LOCATOR
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 700, lineHeight: 1.05,
            letterSpacing: -2, margin: '0 0 16px', fontFamily: FONT,
            ...heroDelay(100)
          }}>
            Find your phone.<br />
            <span style={{ color: AMBER }}>Right now.</span>
          </h1>

          <p style={{ fontSize: isMobile ? 15 : 17, lineHeight: 1.65, color: '#78716C', maxWidth: 500, margin: '0 auto 32px', ...heroDelay(200) }}>
            Lost or stolen? GPS locate any phone in under 60 seconds. Works on any device, any carrier, worldwide. No app install needed.
          </p>

          {/* Hero illustration scene — city skyline + phone with radar + floating info card */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36, position: 'relative', ...heroDelay(300) }}>
            <svg width={isMobile ? 220 : 280} height={isMobile ? 220 : 280} viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">

              {/* === City skyline silhouette at bottom === */}
              <g opacity="0.12">
                <rect x="10" y="245" width="22" height="55" rx="2" fill="#D97706" />
                <rect x="16" y="250" width="3" height="4" rx="0.5" fill="#FFFCF7" opacity="0.5" />
                <rect x="22" y="258" width="3" height="4" rx="0.5" fill="#FFFCF7" opacity="0.5" />
                <rect x="16" y="266" width="3" height="4" rx="0.5" fill="#FFFCF7" opacity="0.3" />
                <rect x="36" y="225" width="28" height="75" rx="2" fill="#D97706" />
                <rect x="42" y="232" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.4" />
                <rect x="50" y="232" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.5" />
                <rect x="42" y="244" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.3" />
                <rect x="50" y="244" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.4" />
                <rect x="42" y="256" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.5" />
                <rect x="50" y="256" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.3" />
                <rect x="68" y="255" width="18" height="45" rx="2" fill="#D97706" />
                <rect x="73" y="260" width="3" height="4" rx="0.5" fill="#FFFCF7" opacity="0.4" />
                <rect x="73" y="270" width="3" height="4" rx="0.5" fill="#FFFCF7" opacity="0.3" />
                <rect x="90" y="235" width="24" height="65" rx="2" fill="#D97706" />
                <rect x="96" y="240" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.5" />
                <rect x="104" y="240" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.3" />
                <rect x="96" y="252" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.4" />
                <rect x="104" y="252" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.5" />
                {/* Right side buildings */}
                <rect x="210" y="240" width="26" height="60" rx="2" fill="#D97706" />
                <rect x="216" y="246" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.4" />
                <rect x="224" y="246" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.5" />
                <rect x="216" y="258" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.3" />
                <rect x="224" y="258" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.4" />
                <rect x="240" y="260" width="18" height="40" rx="2" fill="#D97706" />
                <rect x="245" y="265" width="3" height="4" rx="0.5" fill="#FFFCF7" opacity="0.5" />
                <rect x="245" y="275" width="3" height="4" rx="0.5" fill="#FFFCF7" opacity="0.3" />
                <rect x="262" y="230" width="30" height="70" rx="2" fill="#D97706" />
                <rect x="268" y="236" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.4" />
                <rect x="278" y="236" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.5" />
                <rect x="268" y="248" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.3" />
                <rect x="278" y="248" width="4" height="5" rx="0.5" fill="#FFFCF7" opacity="0.4" />
                <rect x="296" y="252" width="20" height="48" rx="2" fill="#D97706" />
                <rect x="301" y="258" width="3" height="4" rx="0.5" fill="#FFFCF7" opacity="0.4" />
                {/* Ground line */}
                <rect x="0" y="298" width="320" height="2" rx="1" fill="#D97706" />
              </g>

              {/* === GPS signal arcs emanating from phone === */}
              <circle cx="160" cy="165" r="40" stroke="#D97706" strokeWidth="1.5" fill="none" opacity="0.15" style={{ animation: 'signal-wave 2.8s 0s ease-out infinite' }} />
              <circle cx="160" cy="165" r="40" stroke="#D97706" strokeWidth="1.5" fill="none" opacity="0.15" style={{ animation: 'signal-wave 2.8s 0.9s ease-out infinite' }} />
              <circle cx="160" cy="165" r="40" stroke="#D97706" strokeWidth="1.5" fill="none" opacity="0.15" style={{ animation: 'signal-wave 2.8s 1.8s ease-out infinite' }} />

              {/* === Large phone with map/radar on screen === */}
              <g transform="translate(160, 165)" style={{ animation: 'phone-wobble 4s ease-in-out infinite' }}>
                <g transform="rotate(-8)">
                  {/* Phone shadow */}
                  <ellipse cx="4" cy="62" rx="32" ry="5" fill="#D97706" opacity="0.08" />
                  {/* Phone body */}
                  <rect x="-32" y="-54" width="64" height="108" rx="10" ry="10" fill="#FFFCF7" stroke="#D97706" strokeWidth="2.5" />
                  {/* Screen area */}
                  <rect x="-25" y="-40" width="50" height="72" rx="4" ry="4" fill="#FFF7ED" stroke="#F5E6D3" strokeWidth="1" />

                  {/* Radar/map on screen */}
                  {/* Grid lines on screen */}
                  <line x1="-25" y1="-20" x2="25" y2="-20" stroke="#D97706" strokeWidth="0.3" opacity="0.2" />
                  <line x1="-25" y1="0" x2="25" y2="0" stroke="#D97706" strokeWidth="0.3" opacity="0.2" />
                  <line x1="-25" y1="20" x2="25" y2="20" stroke="#D97706" strokeWidth="0.3" opacity="0.2" />
                  <line x1="-10" y1="-40" x2="-10" y2="32" stroke="#D97706" strokeWidth="0.3" opacity="0.2" />
                  <line x1="8" y1="-40" x2="8" y2="32" stroke="#D97706" strokeWidth="0.3" opacity="0.2" />

                  {/* Radar sweep on screen */}
                  <circle cx="0" cy="-4" r="18" stroke="#D97706" strokeWidth="0.8" fill="none" opacity="0.2" />
                  <circle cx="0" cy="-4" r="11" stroke="#D97706" strokeWidth="0.8" fill="none" opacity="0.25" />
                  <circle cx="0" cy="-4" r="4" stroke="#D97706" strokeWidth="0.8" fill="none" opacity="0.3" />
                  {/* Radar sweep line on screen */}
                  <line x1="0" y1="-4" x2="18" y2="-4" stroke="#D97706" strokeWidth="1.5" opacity="0.5" style={{ transformOrigin: '0px -4px', animation: 'radar-sweep 3s linear infinite' }} />
                  {/* Center dot on screen */}
                  <circle cx="0" cy="-4" r="2.5" fill="#D97706" />
                  {/* Blip dots on screen */}
                  <circle cx="8" cy="-12" r="1.5" fill="#D97706" opacity="0.7" style={{ animation: 'status-blink 1.5s infinite' }} />
                  <circle cx="-6" cy="6" r="1.2" fill="#D97706" opacity="0.5" style={{ animation: 'status-blink 2s 0.5s infinite' }} />

                  {/* Status bar text on screen */}
                  <rect x="-22" y="24" width="18" height="2.5" rx="1" fill="#D97706" opacity="0.2" />
                  <rect x="-22" y="28" width="12" height="2" rx="1" fill="#D97706" opacity="0.15" />

                  {/* Speaker slit */}
                  <rect x="-8" y="-49" width="16" height="2" rx="1" fill="#F5E6D3" />
                  {/* Camera dot */}
                  <circle cx="0" cy="-46" r="1.5" fill="#F5E6D3" />
                  {/* Home indicator */}
                  <rect x="-10" y="39" width="20" height="3" rx="1.5" fill="#F5E6D3" />
                </g>
              </g>

              {/* === Scattered location pins === */}
              {/* Pin 1 — top left */}
              <g style={{ animation: 'pin-bounce 3s 0.2s ease-out infinite' }}>
                <g transform="translate(55, 110)">
                  <ellipse cx="0" cy="16" rx="4" ry="1.5" fill="#D97706" opacity="0.12" />
                  <path d="M0-8C-5.5-8-10-3.5-10 1c0 7 10 16 10 16s10-9 10-16c0-4.5-4.5-9-10-9z" fill="#D97706" opacity="0.6" />
                  <circle cx="0" cy="1" r="3.5" fill="#FFFCF7" />
                  <circle cx="0" cy="1" r="1.5" fill="#D97706" />
                </g>
              </g>
              {/* Pin 2 — right side */}
              <g style={{ animation: 'pin-bounce 3s 0.8s ease-out infinite' }}>
                <g transform="translate(258, 145)">
                  <ellipse cx="0" cy="14" rx="3.5" ry="1.2" fill="#D97706" opacity="0.12" />
                  <path d="M0-7C-4.8-7-8.5-3-8.5 0.8c0 6 8.5 14 8.5 14s8.5-8 8.5-14c0-3.8-3.7-7.8-8.5-7.8z" fill="#D97706" opacity="0.45" />
                  <circle cx="0" cy="0.8" r="3" fill="#FFFCF7" />
                  <circle cx="0" cy="0.8" r="1.2" fill="#D97706" />
                </g>
              </g>
              {/* Pin 3 — bottom left */}
              <g style={{ animation: 'pin-bounce 3.5s 1.4s ease-out infinite' }}>
                <g transform="translate(80, 215)">
                  <ellipse cx="0" cy="12" rx="3" ry="1" fill="#D97706" opacity="0.1" />
                  <path d="M0-6C-4-6-7-2.5-7 0.6c0 5 7 12 7 12s7-7 7-12c0-3.1-3-6.6-7-6.6z" fill="#D97706" opacity="0.35" />
                  <circle cx="0" cy="0.6" r="2.5" fill="#FFFCF7" />
                  <circle cx="0" cy="0.6" r="1" fill="#D97706" />
                </g>
              </g>
              {/* Pin 4 — top right area */}
              <g style={{ animation: 'pin-bounce 3.2s 0.5s ease-out infinite' }}>
                <g transform="translate(230, 80)">
                  <ellipse cx="0" cy="12" rx="3" ry="1" fill="#D97706" opacity="0.1" />
                  <path d="M0-6C-4-6-7-2.5-7 0.6c0 5 7 12 7 12s7-7 7-12c0-3.1-3-6.6-7-6.6z" fill="#D97706" opacity="0.3" />
                  <circle cx="0" cy="0.6" r="2.5" fill="#FFFCF7" />
                  <circle cx="0" cy="0.6" r="1" fill="#D97706" />
                </g>
              </g>

              {/* === Primary GPS pin dropping above phone === */}
              <g style={{ animation: 'pin-bounce 2s ease-out infinite' }}>
                <g transform="translate(175, 68)">
                  <ellipse cx="0" cy="32" rx="7" ry="2.5" fill="#D97706" opacity="0.15" />
                  <path d="M0-16C-9.4-16-17-8.3-17 1.2c0 12 17 28 17 28s17-16 17-28c0-9.5-7.6-17.2-17-17.2z" fill="#D97706" />
                  <circle cx="0" cy="1.2" r="7" fill="#FFFCF7" />
                  <circle cx="0" cy="1.2" r="3" fill="#D97706" style={{ animation: 'status-blink 1.2s infinite' }} />
                </g>
              </g>

              {/* === Floating "Signal Detected" info card === */}
              <g style={{ animation: 'float-card 3s ease-in-out infinite' }}>
                <g transform="translate(30, 30)">
                  {/* Card shadow */}
                  <rect x="2" y="3" width="120" height="42" rx="8" fill="#1C1412" opacity="0.06" />
                  {/* Card body */}
                  <rect x="0" y="0" width="120" height="42" rx="8" fill="#FFFCF7" stroke="#D97706" strokeWidth="1.5" />
                  {/* Pulsing dot */}
                  <circle cx="14" cy="15" r="4" fill="#16A34A" opacity="0.2" style={{ animation: 'signal-wave 2s infinite' }} />
                  <circle cx="14" cy="15" r="3" fill="#16A34A" style={{ animation: 'status-blink 1s infinite' }} />
                  {/* Text */}
                  <text x="24" y="18" fontSize="8.5" fontWeight="700" fill="#1C1412" fontFamily="sans-serif">Signal Detected</text>
                  <text x="14" y="33" fontSize="7" fill="#78716C" fontFamily="monospace">GPS Lock  +/-3m</text>
                  {/* Signal bars icon */}
                  <rect x="92" y="26" width="3" height="10" rx="0.5" fill="#D97706" opacity="0.7" />
                  <rect x="97" y="23" width="3" height="13" rx="0.5" fill="#D97706" opacity="0.8" />
                  <rect x="102" y="20" width="3" height="16" rx="0.5" fill="#D97706" opacity="0.9" />
                  <rect x="107" y="17" width="3" height="19" rx="0.5" fill="#D97706" />
                </g>
              </g>

              {/* === Dashed tracking path connecting pins === */}
              <path d="M55 126 Q100 140 130 155 Q155 140 175 100" stroke="#D97706" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.2" style={{ animation: 'dash-flow 4s linear infinite' }} />

              {/* === Small "47m away" badge bottom-right === */}
              <g style={{ animation: 'float-card 3.5s 1s ease-in-out infinite' }}>
                <g transform="translate(220, 200)">
                  <rect x="0" y="0" width="80" height="30" rx="6" fill="#FFFCF7" stroke="#D97706" strokeWidth="1.2" />
                  <circle cx="14" cy="15" r="3" fill="#D97706" opacity="0.2" />
                  <circle cx="14" cy="15" r="1.5" fill="#D97706" />
                  <text x="24" y="13" fontSize="7" fontWeight="700" fill="#D97706" fontFamily="monospace">47m away</text>
                  <text x="24" y="23" fontSize="6" fill="#78716C" fontFamily="sans-serif">Updating...</text>
                </g>
              </g>

            </svg>
          </div>

          {/* Input bar — pill shape, wide */}
          <div style={{
            display: 'flex', alignItems: 'center', background: SURFACE, border: `1.5px solid ${BORDER}`,
            borderRadius: 12, padding: 5, width: '100%', maxWidth: 520, margin: '0 auto',
            boxShadow: `0 0 40px ${AMBER}08, 0 4px 24px rgba(0,0,0,0.3)`, boxSizing: 'border-box',
            ...heroDelay(400)
          }}>
            <button onClick={() => setSheetOpen(true)} style={{
              height: 48, padding: '0 14px', border: 'none', background: SURFACE2, borderRadius: 9,
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0
            }}>
              <span style={{ fontSize: 18 }}>{country.flag}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: INK, fontFamily: MONO }}>{country.dial}</span>
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 3.5L5 7l3-3.5" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
            <input type="tel" value={phone} maxLength={(PHONE_LENGTHS[country?.code] || [7,15])[1] + 3} onChange={e => setPhone(formatPhone(e.target.value))} onKeyDown={e => e.key === 'Enter' && handleLocate()}
              placeholder={isMobile ? "Phone number" : "Enter phone number"}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: INK, fontFamily: FONT, padding: '0 14px', minWidth: 0 }} />
            <button onClick={handleLocate} disabled={!valid} style={{
              height: 48, padding: isMobile ? '0 14px' : '0 24px', borderRadius: 9, border: 'none',
              background: valid ? AMBER : '#D6D3D1',
              color: valid ? '#0C0C0C' : '#78716C', fontSize: isMobile ? 13 : 14, fontWeight: 700, cursor: valid ? 'pointer' : 'not-allowed',
              fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
              boxShadow: valid ? `0 4px 20px ${AMBER_GLOW}` : 'none',
              transition: 'all 200ms', whiteSpace: 'nowrap'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
              LOCATE
            </button>
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

          <p style={{ fontSize: 10.5, color: '#A8A29E', marginTop: 14, fontFamily: MONO, letterSpacing: 0.5 }}>
            SMS consent sent to device owner. Legal and compliant worldwide.
          </p>
        </div>
      </div>

      {/* STATS BAR — horizontal strip with key metrics */}
      <div ref={statsRef} style={{
        background: SURFACE, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
        position: 'relative', zIndex: 1
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: isMobile ? '20px 16px' : '0 40px',
          display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: isMobile ? 16 : 0
        }}>
          {[
            { val: 190, suf: '+', label: 'Countries covered' },
            { val: 60, suf: 's', label: 'Avg. locate time' },
            { val: 99, suf: '%', label: 'Recovery success' },
            { val: 24, suf: '/7', label: 'Always active' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: isMobile ? '0' : '22px 24px',
              borderRight: !isMobile && i < 3 ? `1px solid ${BORDER}` : 'none',
              textAlign: 'center',
              opacity: statsVisible ? 1 : 0,
              transform: statsVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity 0.5s ${i * 100}ms, transform 0.5s ${i * 100}ms`
            }}>
              <div style={{ fontSize: isMobile ? 28 : 34, fontWeight: 700, color: AMBER, fontFamily: FONT, overflow: 'hidden' }}>
                {statsVisible ? <Counter end={s.val} suffix={s.suf} /> : <span>0{s.suf}</span>}
              </div>
              <div style={{ fontSize: 11, fontFamily: MONO, color: MUTED, letterSpacing: 0.5, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS — 3 vertical steps with connecting line */}
      <div ref={howItWorksRef} style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '40px 16px' : '80px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 10, fontFamily: MONO, color: AMBER, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>RECOVERY PROTOCOL</div>
          <h2 style={{ fontSize: isMobile ? 26 : 38, fontWeight: 700, letterSpacing: -1, margin: 0 }}>Locate in three steps</h2>
        </div>
        <div style={{ position: 'relative' }}>
          {/* Connecting line */}
          {!isMobile && <div style={{ position: 'absolute', left: 32, top: 48, bottom: 48, width: 2, background: `linear-gradient(180deg, ${AMBER}, ${AMBER}33)` }} />}
          {[
            { num: '01', title: 'Enter device number', desc: 'Type the phone number of your lost or stolen device. Select the country and carrier is auto-detected.', icon: <svg width={isMobile ? 18 : 20} height={isMobile ? 18 : 20} viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg> },
            { num: '02', title: 'GPS signal acquired', desc: 'Our system scans cell towers, Wi-Fi networks, and GPS satellites to triangulate the exact position of the device.', icon: <svg width={isMobile ? 18 : 20} height={isMobile ? 18 : 20} viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
            { num: '03', title: 'View location on map', desc: 'See the exact GPS coordinates, street address, and nearby landmarks on an interactive map in your dashboard.', icon: <svg width={isMobile ? 18 : 20} height={isMobile ? 18 : 20} viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> },
          ].map((step, i) => (
            <div key={i} style={{
              display: 'flex', gap: isMobile ? 14 : 28, alignItems: 'flex-start',
              marginBottom: i < 2 ? (isMobile ? 28 : 48) : 0,
              position: 'relative',
              opacity: howItWorksVisible ? 1 : 0,
              transform: howItWorksVisible ? 'translateX(0)' : 'translateX(-30px)',
              transition: `opacity 0.55s ${i * 200}ms, transform 0.55s ${i * 200}ms`
            }}>
              <div style={{
                width: isMobile ? 48 : 64, height: isMobile ? 48 : 64, borderRadius: isMobile ? 12 : 16, flexShrink: 0,
                background: `${AMBER}10`, border: `1.5px solid ${AMBER}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', zIndex: 1,
                animation: howItWorksVisible ? `icon-pulse 2s ${i * 200 + 600}ms ease-out 1` : 'none'
              }}>
                {step.icon}
              </div>
              <div style={{ paddingTop: isMobile ? 4 : 8 }}>
                <div style={{ fontSize: 10, fontFamily: MONO, color: AMBER, letterSpacing: 2, marginBottom: 6, fontWeight: 600 }}>STEP {step.num}</div>
                <div style={{ fontSize: isMobile ? 17 : 22, fontWeight: 700, color: INK, marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: isMobile ? 13 : 14, color: '#78716C', lineHeight: 1.65, maxWidth: 460 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES — 2x3 status-card grid */}
      <div ref={featuresRef} style={{
        background: SURFACE, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
        padding: isMobile ? '40px 16px' : '80px 40px', position: 'relative', zIndex: 1
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ fontSize: 10, fontFamily: MONO, color: AMBER, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>SYSTEM CAPABILITIES</div>
            <h2 style={{ fontSize: isMobile ? 26 : 38, fontWeight: 700, letterSpacing: -1, margin: 0 }}>Everything you need to recover your device</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 16 }}>
            {[
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>,
                title: 'GPS Pinpoint', desc: 'Exact coordinates with \u00b13 meter accuracy via satellite triangulation.', status: 'ACTIVE', statusColor: GREEN },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                title: 'Last Known Location', desc: 'Even if the device is off, see its last recorded position before shutdown.', status: 'CACHED', statusColor: AMBER },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2"><path d="M5.636 18.364a9 9 0 0112.728 0"/><path d="M1.393 14.121a14 14 0 0121.214 0"/><path d="M9.879 22.607a4 4 0 015.656 0"/><circle cx="12" cy="24" r="1" fill={AMBER}/></svg>,
                title: 'Wi-Fi Triangulation', desc: 'Uses nearby Wi-Fi access points to narrow location when GPS is unavailable.', status: 'SCANNING', statusColor: AMBER },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2"><rect x="1" y="6" width="22" height="12" rx="2"/><line x1="6" y1="10" x2="6" y2="14"/><line x1="10" y1="10" x2="10" y2="14"/><line x1="14" y1="10" x2="14" y2="14"/><line x1="18" y1="10" x2="18" y2="14"/></svg>,
                title: 'Battery Status', desc: 'See remaining battery percentage. Get alerts before the device powers off.', status: 'MONITORED', statusColor: GREEN },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
                title: 'Movement Trail', desc: '48-hour movement history plotted on map. See everywhere the device has been.', status: 'TRACKING', statusColor: GREEN },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
                title: 'Remote Alarm', desc: 'Trigger a loud alarm on the device even if it\'s on silent mode.', status: 'READY', statusColor: AMBER },
            ].map((f, i) => (
              <div key={i} className="feature-card" style={{
                background: BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: isMobile ? 16 : 22,
                display: 'flex', flexDirection: 'column', gap: 14,
                transition: 'border-color 200ms, transform 200ms, box-shadow 200ms',
                opacity: featuresVisible ? 1 : 0,
                transform: featuresVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${i * 100}ms`,
                cursor: 'default'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = AMBER; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${AMBER_GLOW}`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: `${AMBER}10`, border: `1px solid ${AMBER}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {f.icon}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, fontFamily: MONO, color: f.statusColor, letterSpacing: 1, fontWeight: 600 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: f.statusColor, animation: 'status-blink 2s infinite' }} />
                    {f.status}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: INK, marginBottom: 6 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: '#78716C', lineHeight: 1.55 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS — Single-column timeline with left accent bar */}
      <div ref={testimonialsRef} style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '40px 16px' : '80px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontSize: 10, fontFamily: MONO, color: AMBER, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>RECOVERY REPORTS</div>
          <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 700, letterSpacing: -0.5, margin: 0 }}>Devices found. Lives saved.</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {REVIEWS.map((r, i) => (
            <div key={i} style={{
              background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10,
              padding: isMobile ? '14px 16px' : '18px 22px', borderLeft: `3px solid ${AMBER}40`,
              display: 'flex', flexDirection: 'column', gap: 10,
              opacity: testimonialsVisible ? 1 : 0,
              transform: testimonialsVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.5s ${i * 80}ms, transform 0.5s ${i * 80}ms, border-left-width 200ms`,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderLeftWidth = '5px'; }}
              onMouseLeave={e => { e.currentTarget.style.borderLeftWidth = '3px'; }}
            >
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#57534E', margin: 0 }}>"{r.q}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${AMBER}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: AMBER }}>{r.n[0]}</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#78716C' }}>{r.n}</span>
                <span style={{ fontSize: 10, color: '#A8A29E', marginLeft: 'auto', fontFamily: MONO }}>{r.t}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA STRIP */}
      <div ref={ctaRef} style={{
        background: `linear-gradient(135deg, ${AMBER}12, ${AMBER}05)`,
        borderTop: `1px solid ${AMBER}20`, borderBottom: `1px solid ${AMBER}20`,
        padding: isMobile ? '40px 16px' : '56px 40px', textAlign: 'center',
        position: 'relative', zIndex: 1
      }}>
        <h2 style={{
          fontSize: isMobile ? 24 : 34, fontWeight: 700, letterSpacing: -0.5, margin: '0 0 12px',
          opacity: ctaVisible ? 1 : 0, transform: ctaVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s, transform 0.5s'
        }}>
          Don't wait. Every second counts.
        </h2>
        <p style={{
          fontSize: 15, color: '#78716C', maxWidth: 460, margin: '0 auto 24px', lineHeight: 1.6,
          opacity: ctaVisible ? 1 : 0, transition: 'opacity 0.5s 150ms'
        }}>
          The longer you wait, the harder it is to recover your device. Start the GPS scan now.
        </p>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{
          height: 52, padding: isMobile ? '0 24px' : '0 36px', borderRadius: 10, border: 'none',
          background: AMBER, color: '#0C0C0C', fontSize: 15, fontWeight: 700,
          cursor: 'pointer', fontFamily: FONT,
          boxShadow: `0 8px 30px ${AMBER_GLOW}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: isMobile ? '100%' : 'auto',
          animation: ctaVisible ? 'cta-pulse-glow 2s ease-in-out infinite' : 'none'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
          Emergency Locate Now
        </button>
      </div>

      {/* FOOTER — minimal, dark */}
      <div style={{
        padding: '24px 20px 32px', textAlign: 'center', position: 'relative', zIndex: 1,
        borderTop: `1px solid ${BORDER}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontSize: 11, fontFamily: MONO, flexWrap: 'wrap' }}>
          <a href="/terms" style={{ color: MUTED, textDecoration: 'none' }}>Terms</a>
          <span style={{ color: BORDER }}>|</span>
          <a href="/privacy" style={{ color: MUTED, textDecoration: 'none' }}>Privacy</a>
          <span style={{ color: BORDER }}>|</span>
          <a href="/contact" style={{ color: MUTED, textDecoration: 'none' }}>Contact</a>
        </div>
        <div style={{ marginTop: 8, fontSize: 10, color: '#A8A29E', fontFamily: MONO }}>&copy; 2026 Tracify. GPS locate with SMS consent.</div>
      </div>

      {/* OVERLAYS */}
      {sheetOpen && <CountrySheet countries={window.COUNTRIES} selectedCode={country.code} onSelect={setCountry} onClose={() => setSheetOpen(false)} />}
      {searchOverlay && <SearchingOverlay country={country} phone={phone} carrier={lookup.carrier} mapTarget={mapTarget} onComplete={handleSearchComplete} onClose={() => history.back()} />}
      {resultModal && <LocatedModal onClose={() => history.back()} onContinue={handleContinueToReport} country={country} phoneDisplay={phone || '--- --- ----'} carrier={lookup.carrier} city={lookup.city} localTime={localTime} tzSign={country.tzOffset >= 0 ? '+' : ''} />}
      {reportPage && <ReportPage onBack={() => history.back()} country={country} phone={phone} carrier={lookup.carrier} city={lookup.city} />}
    </div>
  );
}

// ─── Searching Overlay — Radar / emergency command center ────
function SearchingOverlay({ country, phone, carrier, mapTarget, onComplete, onClose }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 820);
  useEffect(() => { const fn = () => setIsMobile(window.innerWidth < 820); window.addEventListener('resize', fn); return () => window.removeEventListener('resize', fn); }, []);
  const STEPS = ['Scanning cell towers', 'Triangulating GPS signal', 'Locking onto device'];
  const STEP_DURATION = 1600;
  const TOTAL = STEP_DURATION * STEPS.length;
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(28,20,18,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.85 }}>
        <RealMap country={mapTarget ? { ...country, center: mapTarget.center, zoom: mapTarget.zoom } : country} playing={true} accent={AMBER} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 0%, rgba(28,20,18,0.4) 80%)' }} />

      {/* Emergency flash */}
      <div style={{ position: 'absolute', inset: 0, background: AMBER, animation: 'emergency-flash 4s infinite', pointerEvents: 'none' }} />

      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, width: 36, height: 36, borderRadius: 8, border: `1px solid ${BORDER}`, background: SURFACE, cursor: 'pointer', color: MUTED, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>

      <div style={{ position: 'relative', zIndex: 10, width: '90%', maxWidth: isMobile ? 340 : 460, textAlign: 'center' }}>
        {/* Radar animation above card */}
        {!isMobile && <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
          <RadarPulse size={120} />
        </div>}

        <div style={{ background: SURFACE, borderRadius: 16, padding: isMobile ? 16 : 28, border: `1px solid ${BORDER}`, boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 60px ${AMBER}08` }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: RED, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>
            <span style={{ animation: 'status-blink 0.8s infinite' }}>{'\u25CF'}</span> LOCATING DEVICE
          </div>
          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: INK, marginBottom: 4 }}>Searching for signal...</div>
          <div style={{ fontSize: 13, color: MUTED, fontFamily: MONO, marginBottom: 24 }}>{country.flag} {country.dial} {phone || '--- --- ----'}</div>

          {/* Progress bar */}
          <div style={{ height: 6, borderRadius: 999, background: SURFACE2, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{
              height: '100%', width: `${progress}%`, borderRadius: 999, transition: 'width 100ms linear',
              background: `linear-gradient(90deg, ${AMBER}, #FB923C)`,
              boxShadow: `0 0 16px ${AMBER}55`
            }} />
          </div>

          {/* Steps */}
          {STEPS.map((label, i) => {
            const done = i < activeStep, active = i === activeStep;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', opacity: done || active ? 1 : 0.3, textAlign: 'left' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: done ? AMBER : 'transparent',
                  border: done ? 'none' : `2px solid ${active ? AMBER : BORDER}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {done && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M10 3L4.5 8.5 2 6" stroke="#FFFCF7" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: AMBER, animation: 'status-blink 0.8s infinite' }} />}
                </div>
                <span style={{ fontSize: isMobile ? 11 : 13, fontFamily: MONO, color: active ? INK : MUTED, fontWeight: active ? 600 : 400 }}>
                  {label}{active && <span style={{ color: AMBER, animation: 'status-blink 1s infinite' }}>_</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Located Modal — Device Found ─────────────────────────
function LocatedModal({ onClose, onContinue, country, phoneDisplay, carrier, city, localTime, tzSign }) {
  useEffect(() => { const fn = e => { if(e.key==='Escape') onClose(); }; window.addEventListener('keydown', fn); document.body.style.overflow='hidden'; return () => { window.removeEventListener('keydown', fn); document.body.style.overflow=''; }; }, [onClose]);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', padding: 20 }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 440, background: SURFACE, borderRadius: 16, overflow: 'hidden', border: `1px solid ${AMBER}30`, boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 40px ${AMBER}10` }} onClick={e => e.stopPropagation()}>
        {/* Header with amber accent */}
        <div style={{ padding: '16px 22px', background: `linear-gradient(135deg, ${AMBER}15, transparent)`, borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={AMBER}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="#0C0C0C"/></svg>
            <span style={{ fontSize: 13, fontFamily: MONO, color: AMBER, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Device found</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: 18 }}>x</button>
        </div>

        <div style={{ padding: '4px 22px 14px' }}>
          {[
            { l: 'Device', v: carrier },
            { l: 'Number', v: `${country.dial} ${phoneDisplay}`, mono: true },
            { l: 'Region', v: `${country.flag}  ${country.name}` },
            { l: 'Local time', v: `${localTime}  UTC${tzSign}${country.tzOffset}`, mono: true },
            { l: 'Area', v: '\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588', mono: true, locked: true },
            { l: 'Coordinates', v: '\u2588\u2588.\u2588\u2588\u2588\u00b0N, \u2588\u2588.\u2588\u2588\u2588\u00b0E', mono: true, locked: true },
            { l: 'Address', v: '\u2588\u2588 \u2588\u2588\u2588\u2588\u2588\u2588 \u2588\u2588\u2588, \u2588\u2588\u2588', mono: true, locked: true },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < 6 ? `1px solid ${BORDER}` : 'none' }}>
              <div style={{ fontSize: 10, fontFamily: MONO, color: MUTED, letterSpacing: 0.5, textTransform: 'uppercase', width: 85, flexShrink: 0 }}>{row.l}</div>
              <div style={{ fontSize: 14, color: row.locked ? '#A8A29E' : INK, fontWeight: 500, fontFamily: row.mono ? MONO : FONT, filter: row.locked ? 'blur(4px)' : 'none', userSelect: row.locked ? 'none' : 'auto' }}>{row.v}</div>
              {row.locked && <svg width="12" height="12" viewBox="0 0 11 11" fill="none" stroke={AMBER} strokeWidth="1.4" style={{ marginLeft: 'auto' }}><rect x="2" y="5" width="7" height="5" rx="1" /><path d="M3.5 5V3.5a2 2 0 014 0V5" /></svg>}
            </div>
          ))}
        </div>

        <div style={{ padding: '10px 22px 20px' }}>
          <button onClick={onContinue} style={{
            width: '100%', height: 50, border: 'none',
            background: AMBER, color: '#0C0C0C', borderRadius: 10,
            fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
            boxShadow: `0 8px 24px ${AMBER_GLOW}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            View full recovery report
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7h10m-4-4l4 4-4 4" stroke="#0C0C0C" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 10, fontFamily: MONO, color: '#A8A29E', letterSpacing: 0.5 }}>GPS accurate to \u00b13 meters . Updated in real-time</div>
        </div>
      </div>
    </div>
  );
}

// ─── Report Page — Recovery Report ────────────────────────
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
      const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, phoneToTrack: phone.replace(/\D/g, ''), countryCode: country.dial, source: 'find', plan: 'find' }) });
      const data = await res.json();
      if (!res.ok) { if (data.error && data.error.includes('already exists')) { setError('Account exists. Redirecting...'); setTimeout(() => { window.location.href = '/payment'; }, 1500); return; } throw new Error(data.error || 'Failed'); }
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else window.location.href = data.redirectTo || '/payment';
    } catch (err) { setError(err.message); setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: BG, overflowY: 'auto', fontFamily: FONT, color: INK }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TracifyLogo size={20} accent={AMBER} color="#1C1412" />
          <div style={{ height: 14, width: 1, background: BORDER }} />
          <span style={{ fontSize: 9, fontFamily: MONO, color: AMBER, letterSpacing: 2, fontWeight: 600 }}>RECOVERY</span>
        </div>
        <button onClick={onBack} style={{ fontSize: 12, color: MUTED, background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: MONO }}>
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M10 6H2m4-3L2 6l4 3" stroke={MUTED} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>Back
        </button>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '32px 20px 80px' : '48px 24px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={AMBER}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="#0C0C0C"/></svg>
          <span style={{ fontSize: 10, fontFamily: MONO, color: AMBER, letterSpacing: 2, fontWeight: 600 }}>DEVICE RECOVERY REPORT</span>
        </div>
        <h1 style={{ fontSize: isMobile ? 32 : 44, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.5, margin: '0 0 12px' }}>
          Device located.<br />
          <span style={{ color: AMBER }}>Recover it now.</span>
        </h1>
        <p style={{ fontSize: 16, color: '#78716C', maxWidth: 500, lineHeight: 1.6, margin: '0 0 36px' }}>
          We've pinpointed your device's location. Create your account to access the full GPS coordinates, street address, and real-time tracking dashboard.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* Left — device info card */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' }}>Signal data</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, fontFamily: MONO, color: GREEN, letterSpacing: 1 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN, animation: 'status-blink 1.5s infinite' }} />LIVE
              </div>
            </div>
            {[
              { l: 'Carrier', v: carrier },
              { l: 'Number', v: `${country.dial} ${phone || '---'}` },
              { l: 'Country', v: `${country.flag}  ${country.name}` },
              { l: 'Area', v: '\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588', blur: true },
              { l: 'Accuracy', v: '\u00b13 meters (GPS)' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '13px 20px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 10, fontFamily: MONO, color: MUTED, letterSpacing: 0.5, textTransform: 'uppercase', width: 90 }}>{r.l}</div>
                <div style={{ fontSize: 14, color: r.blur ? '#D6D3D1' : INK, fontWeight: 500, filter: r.blur ? 'blur(4px)' : 'none', userSelect: r.blur ? 'none' : 'auto' }}>{r.v}</div>
                {r.blur && <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke={AMBER} strokeWidth="1.4" style={{ marginLeft: 'auto' }}><rect x="2" y="5" width="7" height="5" rx="1" /><path d="M3.5 5V3.5a2 2 0 014 0V5" /></svg>}
              </div>
            ))}

            {/* Locked recovery data */}
            <div style={{ padding: '16px 20px', background: `linear-gradient(180deg, ${SURFACE} 0%, ${BG} 100%)` }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: AMBER, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <svg width="10" height="10" viewBox="0 0 11 11" fill="none" stroke={AMBER} strokeWidth="1.4"><rect x="2" y="5" width="7" height="5" rx="1" /><path d="M3.5 5V3.5a2 2 0 014 0V5" /></svg>
                UNLOCK TO RECOVER
              </div>
              {['Exact GPS coordinates', 'Full street address', 'Real-time movement tracking', '48-hour location history', 'Remote alarm trigger'].map((item, i) => (
                <div key={i} style={{ padding: '9px 0', borderTop: i > 0 ? `1px dashed ${BORDER}` : 'none' }}>
                  <div style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>{item}</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, color: '#D6D3D1', filter: 'blur(4px)', userSelect: 'none', marginTop: 3 }}>{'\u2588\u2588\u2588\u2588 \u2588\u2588\u2588\u2588\u2588\u2588 \u2588\u2588\u2588\u2588\u2588'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — signup card */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 22, position: isMobile ? 'static' : 'sticky', top: 24 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: AMBER, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>START RECOVERY</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Get your phone back</h3>
            <p style={{ fontSize: 13, color: '#78716C', margin: '0 0 20px', lineHeight: 1.5 }}>
              Access the full recovery dashboard. See exactly where your device is.
            </p>
            <div style={{ marginBottom: 4, fontSize: 10, fontFamily: MONO, color: MUTED, letterSpacing: 0.5, textTransform: 'uppercase' }}>Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSubmit()} placeholder="you@example.com" autoFocus
              style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '13px 14px', fontSize: 14, outline: 'none', fontFamily: FONT, background: SURFACE2, color: INK, boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = AMBER} onBlur={e => e.target.style.borderColor = BORDER} />
            {error && <div style={{ marginTop: 8, fontSize: 12, color: RED, fontWeight: 500 }}>{error}</div>}
            <button onClick={handleSubmit} disabled={!validEmail || loading} style={{
              marginTop: 14, width: '100%', height: 50, border: 'none',
              background: validEmail && !loading ? AMBER : '#D6D3D1',
              color: validEmail && !loading ? '#0C0C0C' : '#78716C', borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: validEmail && !loading ? 'pointer' : 'not-allowed',
              boxShadow: validEmail && !loading ? `0 8px 24px ${AMBER_GLOW}` : 'none', fontFamily: FONT
            }}>{loading ? 'Setting up...' : 'Start for $0.50'}</button>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: '#A8A29E', lineHeight: 1.6 }}>
              $0.50 for 24h access, then $14.98/mo. Cancel anytime.<br />
              <a href="/terms" style={{ color: AMBER, textDecoration: 'none' }}>Terms</a> & <a href="/privacy" style={{ color: AMBER, textDecoration: 'none' }}>Privacy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Country Sheet ──────────────────────────────────────
function CountrySheet({ countries, selectedCode, onSelect, onClose }) {
  const [q, setQ] = useState('');
  const filtered = countries.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.dial.includes(q));
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: window.innerWidth < 820 ? '92%' : 400, maxWidth: 400, maxHeight: '70vh', background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', fontFamily: FONT }}>
        <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: 10 }}>Select country</div>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search countries..." style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', fontFamily: FONT, background: SURFACE2, color: INK, boxSizing: 'border-box' }} />
        </div>
        <div style={{ overflowY: 'auto', padding: 6 }}>
          {filtered.map(c => (
            <button key={c.code} onClick={() => { onSelect(c); onClose(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: selectedCode===c.code ? SURFACE2 : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontFamily: FONT }}>
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
  { n: 'Thomas K.', t: '2 days ago', q: "Left my phone in a taxi. Tracify pinpointed it to the cab company's lot in 45 seconds. Got it back the same night." },
  { n: 'Maria G.', t: '1 week ago', q: "Someone snatched my phone on the subway. Police used the GPS coordinates to recover it within 2 hours." },
  { n: 'James W.', t: '4 days ago', q: "My son lost his iPhone at the park. Found it under a bench exactly where the map showed. Incredible accuracy." },
  { n: 'Lisa P.', t: '3 days ago', q: "Phone was stolen from my car. Tracked it to a pawn shop 3 miles away. Filed a police report with the exact address." },
  { n: 'Ahmed R.', t: '1 week ago', q: "Dropped my phone hiking. The last known location feature showed me exactly where on the trail it was. Saved me hours of searching." },
  { n: 'Sandra M.', t: '5 days ago', q: "My elderly mother lost her phone at the mall. Tracked it to the food court lost and found. She was so relieved." },
];

// ─── Inject animations ─────────────────────────────────────
const styles = document.createElement('style');
styles.textContent = `
  @keyframes tracify-fadein { from { opacity: 0; } to { opacity: 1; } }
  @keyframes tracify-popin { 0% { transform: translateY(20px) scale(0.94); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
  @keyframes tracify-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes phone-wobble {
    0%, 100% { transform: rotate(0deg) translateX(0); }
    15% { transform: rotate(1.5deg) translateX(1px); }
    30% { transform: rotate(-1deg) translateX(-0.5px); }
    45% { transform: rotate(0.8deg) translateX(0.5px); }
    60% { transform: rotate(-0.5deg) translateX(-0.3px); }
    75% { transform: rotate(0.3deg); }
  }
  @keyframes pin-bounce {
    0% { transform: translateY(-18px); opacity: 0; }
    25% { transform: translateY(0px); opacity: 1; }
    35% { transform: translateY(-8px); }
    45% { transform: translateY(0px); }
    52% { transform: translateY(-3px); }
    58%, 100% { transform: translateY(0px); opacity: 1; }
  }
  @keyframes signal-wave {
    0% { r: 30; opacity: 0.3; stroke-width: 1.5; }
    100% { r: 75; opacity: 0; stroke-width: 0.5; }
  }

  /* Entrance animation — hero stagger */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Hero shimmer scan line */
  @keyframes hero-shimmer {
    0% { transform: translateX(-120%); }
    40%, 100% { transform: translateX(120%); }
  }

  /* Icon pulse for How It Works steps */
  @keyframes icon-pulse {
    0% { box-shadow: 0 0 0 0 rgba(217,119,6,0.35); }
    50% { box-shadow: 0 0 0 10px rgba(217,119,6,0); }
    100% { box-shadow: 0 0 0 0 rgba(217,119,6,0); }
  }

  /* CTA button pulsing amber glow */
  @keyframes cta-pulse-glow {
    0%, 100% { box-shadow: 0 8px 30px rgba(217,119,6,0.2); }
    50% { box-shadow: 0 8px 40px rgba(217,119,6,0.45), 0 0 20px rgba(217,119,6,0.2); }
  }

  /* Floating info card hover animation */
  @keyframes float-card {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  /* Dashed path flow animation */
  @keyframes dash-flow {
    0% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: -40; }
  }

  /* Prevent horizontal overflow on small screens */
  html, body { overflow-x: hidden; max-width: 100vw; }

  div::-webkit-scrollbar { display: none; }
`;
document.head.appendChild(styles);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
