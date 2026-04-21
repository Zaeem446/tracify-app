// Tracify Ad Landing — adapted from design zip
// Flow: Enter number → Searching animation → Located modal → Email → Signup → Stripe checkout → Dashboard

const { useState, useEffect, useRef, useMemo } = React;

const ACCENT = '#1B8A5A';

// ─── useInView hook — scroll-triggered animations ───────────
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

// ─── Splash Overlay ─────────────────────────────────────────
function SplashOverlay({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (elapsed < duration) {
        raf = requestAnimationFrame(tick);
      } else {
        setFading(true);
        setTimeout(onDone, 400);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#1B1B1B',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: fading ? 0 : 1,
      transition: 'opacity 400ms ease',
      pointerEvents: fading ? 'none' : 'auto'
    }}>
      <TracifyLogo size={32} accent={ACCENT} />
      <div style={{
        marginTop: 16, fontSize: 13, fontWeight: 500,
        color: '#6B6B6B', fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        letterSpacing: 1.5, textTransform: 'uppercase'
      }}>Locating...</div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 3, background: '#2A2A2A'
      }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: ACCENT, borderRadius: '0 2px 2px 0',
          transition: 'width 60ms linear',
          boxShadow: `0 0 8px ${ACCENT}88`
        }} />
      </div>
    </div>
  );
}

// Mobile-number prefix tables for carrier resolution
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
  DE: ['Berlin','Munich','Hamburg','Cologne','Frankfurt','Stuttgart','Düsseldorf','Leipzig'],
  FR: ['Paris','Marseille','Lyon','Toulouse','Nice','Nantes','Bordeaux','Lille'],
  BR: ['São Paulo','Rio de Janeiro','Brasília','Salvador','Fortaleza','Belo Horizonte','Curitiba','Recife'],
  AE: ['Dubai','Abu Dhabi','Sharjah','Ajman'],
  SA: ['Riyadh','Jeddah','Mecca','Medina','Dammam'],
  CA: ['Toronto','Montreal','Vancouver','Calgary','Ottawa','Edmonton'],
  AU: ['Sydney','Melbourne','Brisbane','Perth','Adelaide'],
  JP: ['Tokyo','Osaka','Yokohama','Nagoya','Sapporo','Kyoto'],
  CN: ['Beijing','Shanghai','Guangzhou','Shenzhen','Chengdu'],
  MX: ['Mexico City','Guadalajara','Monterrey','Puebla','Tijuana'],
  NG: ['Lagos','Abuja','Kano','Ibadan','Port Harcourt'],
  ID: ['Jakarta','Surabaya','Bandung','Medan','Makassar'],
  TR: ['Istanbul','Ankara','Izmir','Bursa','Antalya'],
  EG: ['Cairo','Alexandria','Giza','Luxor'],
  ZA: ['Johannesburg','Cape Town','Durban','Pretoria'],
  IT: ['Rome','Milan','Naples','Turin','Florence'],
  ES: ['Madrid','Barcelona','Valencia','Seville','Bilbao'],
  NL: ['Amsterdam','Rotterdam','The Hague','Utrecht']
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

// City coordinates for map zoom — major cities worldwide
const CITY_COORDS = {
  'Karachi': [24.86, 67.01, 11], 'Lahore': [31.55, 74.35, 12], 'Islamabad': [33.69, 73.04, 12],
  'Rawalpindi': [33.6, 73.05, 12], 'Faisalabad': [31.42, 73.08, 12], 'Multan': [30.2, 71.45, 12],
  'Peshawar': [34.01, 71.58, 12], 'Quetta': [30.18, 66.99, 12], 'Hyderabad': [25.4, 68.37, 12],
  'Sialkot': [32.5, 74.53, 12],
  'Mumbai': [19.08, 72.88, 12], 'Delhi': [28.61, 77.21, 12], 'New Delhi': [28.61, 77.21, 12],
  'Bengaluru': [12.97, 77.59, 12], 'Chennai': [13.08, 80.27, 12], 'Kolkata': [22.57, 88.36, 12],
  'Pune': [18.52, 73.86, 12], 'Ahmedabad': [23.02, 72.57, 12], 'Jaipur': [26.91, 75.79, 12],
  'Lucknow': [26.85, 80.95, 12],
  'New York': [40.71, -74.01, 12], 'New York, NY': [40.71, -74.01, 12],
  'Los Angeles': [34.05, -118.24, 11], 'Los Angeles, CA': [34.05, -118.24, 11],
  'Chicago': [41.88, -87.63, 12], 'Chicago, IL': [41.88, -87.63, 12],
  'Houston': [29.76, -95.37, 11], 'Houston, TX': [29.76, -95.37, 11],
  'Phoenix': [33.45, -112.07, 11], 'Phoenix, AZ': [33.45, -112.07, 11],
  'Dallas': [32.78, -96.8, 12], 'Dallas, TX': [32.78, -96.8, 12],
  'Miami': [25.76, -80.19, 12], 'Miami, FL': [25.76, -80.19, 12],
  'San Francisco': [37.77, -122.42, 13], 'San Francisco, CA': [37.77, -122.42, 13],
  'Seattle': [47.61, -122.33, 12], 'Seattle, WA': [47.61, -122.33, 12],
  'Boston': [42.36, -71.06, 13], 'Boston, MA': [42.36, -71.06, 13],
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
  'Singapore': [1.35, 103.82, 12], 'Kuala Lumpur': [3.14, 101.69, 12],
  'Buenos Aires': [-34.6, -58.38, 12], 'Lima': [-12.05, -77.04, 12],
  'Bogota': [4.71, -74.07, 12], 'Santiago': [-33.45, -70.67, 12],
  'Warsaw': [52.23, 21.01, 12], 'Prague': [50.08, 14.44, 13], 'Vienna': [48.21, 16.37, 13],
  'Stockholm': [59.33, 18.07, 12], 'Oslo': [59.91, 10.75, 12], 'Copenhagen': [55.68, 12.57, 13],
};

function resolveCarrierAndCity(country, digits) {
  const code = country.code;
  let carrier = null;
  const prefixes = CARRIER_PREFIXES[code];
  if (prefixes) {
    let best = null;
    for (const entry of prefixes) {
      for (const pfx of entry.p) {
        if (digits.startsWith(pfx) && (!best || pfx.length > best.len)) {
          best = { name: entry.name, len: pfx.length };
        }
      }
    }
    if (best) carrier = best.name;
  }
  if (!carrier) {
    const seed = digits.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    carrier = country.carriers[seed % country.carriers.length];
  }
  const pool = CITY_POOLS[code];
  let city;
  if (pool && pool.length) {
    const seed = digits.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 7), 0);
    city = pool[seed % pool.length];
  } else {
    city = country.capital;
  }
  return { carrier, city };
}

// ─── Main App ───────────────────────────────────────────────
function App() {
  const [country, setCountry] = useState(window.COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 820 : false
  );

  // Refs for scroll-triggered animations
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const featuresVisible = useInView(featuresRef, 0.1);
  const testimonialsVisible = useInView(testimonialsRef, 0.1);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 820);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Auto-detect country on load via API
  useEffect(() => {
    fetch('/api/geo/detect')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.countryCode) {
          const found = window.COUNTRIES.find(c => c.code === data.countryCode);
          if (found) setCountry(found);
        }
      })
      .catch(() => {});
  }, []);

  const formatPhone = (raw) => {
    const d = raw.replace(/\D/g, '').slice(0, 12);
    return d.replace(/(.{3})/g, '$1 ').trim();
  };

  const [searchOverlay, setSearchOverlay] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [reportPage, setReportPage] = useState(false);
  const [lookup, setLookup] = useState({ carrier: '...', city: '', loading: false });
  const [mapTarget, setMapTarget] = useState(null); // { center: [lat,lng], zoom: N } for city-level zoom

  // ─── pushState routing — browser back button goes to previous step ───
  const pushStep = (hash) => {
    history.pushState({ step: hash }, '', '/go#' + hash);
  };
  const clearToHome = () => {
    setSearchOverlay(false);
    setResultModal(false);
    setReportPage(false);
  };

  useEffect(() => {
    const onPop = () => {
      const hash = location.hash.replace('#', '');
      if (hash === 'searching') {
        setResultModal(false);
        setReportPage(false);
        setSearchOverlay(true);
      } else if (hash === 'located') {
        setSearchOverlay(false);
        setReportPage(false);
        setResultModal(true);
      } else if (hash === 'report') {
        setSearchOverlay(false);
        setResultModal(false);
        setReportPage(true);
      } else {
        // No hash = home
        clearToHome();
      }
    };
    window.addEventListener('popstate', onPop);

    // Handle initial hash on page load (e.g. user refreshes on #report — go back to home)
    if (location.hash) {
      history.replaceState(null, '', '/go');
    }

    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Live clock in target timezone
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  const localTime = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false, timeZone: country.tz
      }).format(now);
    } catch { return '--:--:--'; }
  }, [now, country.tz]);

  const handleLocate = () => {
    const digits = phone.replace(/\D/g, '');
    const range = PHONE_LENGTHS[country?.code] || [7, 15];
    if (digits.length < range[0] || digits.length > range[1]) return;

    // Start with prefix-based fallback immediately
    const fallback = resolveCarrierAndCity(country, digits);
    setLookup({ ...fallback, loading: true });
    setMapTarget(null); // reset — will zoom to country first
    setSearchOverlay(true);
    pushStep('searching');

    // Call real API in background during animation
    const fullNumber = country.dial.replace('+', '') + digits;
    fetch(`/api/lookup/phone?number=${encodeURIComponent(fullNumber)}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.valid) {
          const realCarrier = data.carrier || fallback.carrier;
          const city = fallback.city; // city from prefix mapping (Twilio doesn't return city)
          setLookup({
            carrier: realCarrier,
            city: city,
            loading: false
          });
          // Zoom map to city if we have coordinates
          const coords = CITY_COORDS[city];
          if (coords) {
            setMapTarget({ center: [coords[0], coords[1]], zoom: coords[2] });
          }
        } else {
          // API failed — use prefix-based data but still zoom to city
          setLookup({ ...fallback, loading: false });
          const coords = CITY_COORDS[fallback.city];
          if (coords) {
            setMapTarget({ center: [coords[0], coords[1]], zoom: coords[2] });
          }
        }
      })
      .catch(() => {
        setLookup({ ...fallback, loading: false });
        const coords = CITY_COORDS[fallback.city];
        if (coords) {
          setMapTarget({ center: [coords[0], coords[1]], zoom: coords[2] });
        }
      });
  };

  const handleSearchComplete = () => {
    setSearchOverlay(false);
    setResultModal(true);
    history.replaceState({ step: 'located' }, '', '/go#located');
  };

  const handleContinueToReport = () => {
    setResultModal(false);
    setReportPage(true);
    pushStep('report');
  };

  const accent = ACCENT;
  const goDigits = phone.replace(/\D/g, '');
  const goRange = PHONE_LENGTHS[country?.code] || [7, 15];
  const valid = goDigits.length >= goRange[0] && goDigits.length <= goRange[1];

  return (
    <div style={{
      minHeight: '100vh', background: '#F7F3EB',
      fontFamily: 'Geist, system-ui, sans-serif',
      color: '#0B1F1A', position: 'relative', overflowX: 'hidden'
    }}>

      {/* Splash Overlay */}
      {!splashDone && <SplashOverlay onDone={() => setSplashDone(true)} />}

      {/* Nav — minimal, logo only */}
      <nav style={{
        maxWidth: 1240, margin: '0 auto',
        padding: isMobile ? '16px 20px' : '22px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <TracifyLogo size={isMobile ? 22 : 26} accent={accent} />
      </nav>

      {/* Hero */}
      <div style={{
        maxWidth: 720, margin: '0 auto',
        padding: isMobile ? '28px 16px 60px' : '56px 40px 96px'
      }}>
        <div style={{ textAlign: 'center' }}>
          {/* Trust badge — entrance delay 0ms */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            color: accent, fontSize: isMobile ? 15 : 17, fontWeight: 600, marginBottom: 6,
            fontFamily: 'Geist, system-ui',
            animation: splashDone ? 'tracify-fadeInUp 600ms ease both' : 'none',
            animationDelay: '0ms'
          }}>
            <Laurel accent={accent} side="left" />
            <span>12M+ peaceful families</span>
            <Laurel accent={accent} side="right" />
          </div>
          <div style={{
            fontSize: 13, color: '#5A5750', marginBottom: 22,
            animation: splashDone ? 'tracify-fadeInUp 600ms ease both' : 'none',
            animationDelay: '50ms'
          }}>trust Tracify</div>

          {/* Hero Illustration — tracking scene with floating card */}
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: isMobile ? 16 : 24,
            animation: splashDone ? 'tracify-fadeInUp 600ms ease both' : 'none',
            animationDelay: '70ms'
          }}>
            <div style={{ position: 'relative', width: isMobile ? 200 : 260, height: isMobile ? 160 : 210 }}>
              <svg
                viewBox="0 0 260 210"
                width={isMobile ? 200 : 260}
                height={isMobile ? 160 : 210}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block' }}
              >
                {/* Map grid background */}
                <rect x="20" y="20" width="220" height="170" rx="16" fill="#F7F3EB" stroke="#E6DFD2" strokeWidth="1.2" />
                <line x1="80" y1="20" x2="80" y2="190" stroke="#E6DFD2" strokeWidth="0.7" />
                <line x1="140" y1="20" x2="140" y2="190" stroke="#E6DFD2" strokeWidth="0.7" />
                <line x1="200" y1="20" x2="200" y2="190" stroke="#E6DFD2" strokeWidth="0.7" />
                <line x1="20" y1="70" x2="240" y2="70" stroke="#E6DFD2" strokeWidth="0.7" />
                <line x1="20" y1="120" x2="240" y2="120" stroke="#E6DFD2" strokeWidth="0.7" />

                {/* Dashed route path connecting two pins */}
                <path d="M62 130 C80 90, 120 100, 140 80 S180 60, 198 95" stroke={accent} strokeWidth="1.8" strokeDasharray="5 4" strokeLinecap="round" fill="none" opacity="0.5" />

                {/* Location pin A (origin) */}
                <g>
                  <circle cx="62" cy="130" r="6" fill={accent} opacity="0.15" />
                  <circle cx="62" cy="130" r="3" fill={accent} />
                  <path d="M62 122 C58 122 55 125 55 128.5 C55 133 62 139 62 139 C62 139 69 133 69 128.5 C69 125 66 122 62 122Z" fill={accent} opacity="0.25" />
                </g>

                {/* Location pin B (destination) with pulse */}
                <g>
                  <circle cx="198" cy="95" r="10" fill={accent} opacity="0.08">
                    <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.08;0;0.08" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="198" cy="95" r="4.5" fill={accent} />
                  <path d="M198 85 C193 85 189 89 189 93.5 C189 99 198 107 198 107 C198 107 207 99 207 93.5 C207 89 203 85 198 85Z" fill={accent} opacity="0.3" />
                </g>

                {/* Phone device */}
                <rect x="105" y="50" width="50" height="85" rx="10" fill="#fff" stroke="#D8D0C1" strokeWidth="1.5" />
                <rect x="110" y="58" width="40" height="60" rx="4" fill="#F7F3EB" />
                {/* Phone screen map lines */}
                <line x1="110" y1="78" x2="150" y2="78" stroke="#E6DFD2" strokeWidth="0.5" />
                <line x1="130" y1="58" x2="130" y2="118" stroke="#E6DFD2" strokeWidth="0.5" />
                {/* Location dot on phone screen */}
                <circle cx="130" cy="85" r="3.5" fill={accent}>
                  <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="130" cy="85" r="7" fill={accent} opacity="0.12">
                  <animate attributeName="r" values="7;12;7" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.12;0;0.12" dur="1.5s" repeatCount="indefinite" />
                </circle>
                {/* Phone notch */}
                <rect x="122" y="126" width="16" height="3" rx="1.5" fill="#E6DFD2" />

                {/* Signal arcs from phone */}
                <path d="M155 72 C160 68, 164 72, 164 78" stroke={accent} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.35" />
                <path d="M159 66 C167 60, 173 66, 173 76" stroke={accent} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.22" />
                <path d="M163 60 C174 52, 182 60, 182 74" stroke={accent} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.12" />

                {/* Person figure looking at phone */}
                <g transform="translate(30, 42)" opacity="0.55">
                  <circle cx="12" cy="6" r="5" fill="#3C3A33" />
                  <path d="M12 11 L12 28" stroke="#3C3A33" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M12 16 L4 24" stroke="#3C3A33" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 16 L22 20" stroke="#3C3A33" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 28 L5 40" stroke="#3C3A33" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 28 L19 40" stroke="#3C3A33" strokeWidth="2" strokeLinecap="round" />
                </g>
              </svg>

              {/* Floating info card */}
              <div style={{
                position: 'absolute',
                bottom: isMobile ? 4 : 8,
                right: isMobile ? -10 : -16,
                background: '#fff',
                border: `1.5px solid ${accent}33`,
                borderRadius: 10,
                padding: isMobile ? '6px 10px' : '8px 14px',
                boxShadow: '0 6px 24px rgba(11,31,26,0.10)',
                display: 'flex', alignItems: 'center', gap: 8,
                animation: 'tracify-heroCardFloat 3s ease-in-out infinite',
                whiteSpace: 'nowrap'
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: accent,
                  display: 'inline-block', flexShrink: 0,
                  animation: 'tracify-pulse 1.5s infinite'
                }} />
                <div>
                  <div style={{ fontSize: isMobile ? 10.5 : 12, fontWeight: 600, color: '#0B1F1A', lineHeight: 1.2 }}>
                    Device Located
                  </div>
                  <div style={{ fontSize: isMobile ? 9 : 10.5, color: '#8B8378', lineHeight: 1.3 }}>
                    Signal acquired — 2 min ago
                  </div>
                </div>
              </div>
            </div>

            <style>{`
              @keyframes tracify-heroCardFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-6px); }
              }
            `}</style>
          </div>

          {/* Heading — entrance delay 100ms */}
          <h1 style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: isMobile ? 'clamp(32px, 9vw, 44px)' : 'clamp(48px, 5vw, 64px)',
            lineHeight: 1.0, letterSpacing: isMobile ? -0.5 : -1.5,
            margin: 0, color: '#0B1F1A', fontWeight: 400, textAlign: 'center',
            animation: splashDone ? 'tracify-fadeInUp 600ms ease both' : 'none',
            animationDelay: '100ms'
          }}>
            See where they are.<br />
            <em style={{ color: accent, fontStyle: 'italic' }}>Anywhere, anytime.</em>
          </h1>

          {/* Subtitle — entrance delay 200ms */}
          <p style={{
            fontSize: isMobile ? 14 : 15.5, lineHeight: 1.55, color: '#3C3A33',
            marginTop: 18, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto',
            animation: splashDone ? 'tracify-fadeInUp 600ms ease both' : 'none',
            animationDelay: '200ms'
          }}>Enter a phone number to locate</p>

          {/* Compatibility pills */}
          <div style={{
            display: 'flex', gap: 8, justifyContent: 'center', marginTop: 22, flexWrap: 'wrap',
            padding: isMobile ? '0 4px' : 0,
            animation: splashDone ? 'tracify-fadeInUp 600ms ease both' : 'none',
            animationDelay: '250ms'
          }}>
            {[
              { l: 'iOS', i: <AppleIcon /> },
              { l: 'Android', i: <AndroidIcon /> },
              { l: 'All devices', i: <DevicesIcon /> },
              { l: 'Any network', i: <NetworkIcon /> }
            ].map((p) =>
              <div key={p.l} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                border: '1.5px solid #E6DFD2', borderRadius: 999,
                padding: isMobile ? '6px 10px' : '7px 13px', fontSize: isMobile ? 11.5 : 12.5, color: '#3C3A33', background: '#fff'
              }}>{p.i} {p.l}</div>
            )}
          </div>

          {/* Phone input — entrance delay 300ms */}
          <div style={{
            marginTop: 24, display: 'flex', alignItems: 'center', gap: 0,
            background: '#fff', borderRadius: 14, padding: 6,
            border: '1.5px solid #E6DFD2', maxWidth: isMobile ? '100%' : 440, margin: '24px auto 0',
            boxSizing: 'border-box',
            animation: splashDone ? 'tracify-fadeInUp 600ms ease both' : 'none',
            animationDelay: '300ms'
          }}>
            <button onClick={() => setSheetOpen(true)} style={{
              height: 44, padding: '0 12px', border: 'none', background: '#F7F3EB',
              borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer', flexShrink: 0
            }}>
              <span style={{ fontSize: 20 }}>{country.flag}</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#0B1F1A', fontVariantNumeric: 'tabular-nums' }}>{country.dial}</span>
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 3.5L5 7l3-3.5" fill="none" stroke="#8B8378" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
            <input
              type="tel" value={phone}
              maxLength={(PHONE_LENGTHS[country?.code] || [7,15])[1] + 3}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && handleLocate()}
              placeholder="Phone number to locate"
              className="tracify-phone-input"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 15, color: '#0B1F1A', fontFamily: 'Geist, system-ui',
                padding: '0 12px', fontVariantNumeric: 'tabular-nums',
                minWidth: 0
              }} />
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

          <button onClick={handleLocate} disabled={!valid} className="tracify-cta-btn" style={{
            marginTop: 12, width: '100%', maxWidth: isMobile ? '100%' : 440,
            height: 56, borderRadius: 14, border: 'none',
            background: valid ? accent : '#D8D0C1',
            backgroundSize: '200% 100%',
            color: '#fff', fontSize: 16, fontWeight: 600, letterSpacing: 0.2,
            cursor: valid ? 'pointer' : 'not-allowed',
            boxShadow: valid ? '0 6px 18px rgba(27, 138, 90, 0.28)' : 'none',
            fontFamily: 'Geist, system-ui', transition: 'all 200ms ease',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            animation: splashDone ? 'tracify-fadeInUp 600ms ease both' : 'none',
            animationDelay: '350ms'
          }}>Locate</button>

          <div style={{
            display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14,
            animation: splashDone ? 'tracify-fadeInUp 600ms ease both' : 'none',
            animationDelay: '400ms'
          }}>
            <SecurityBadge icon={<ShieldIcon />} label="100% Confidential" />
            <SecurityBadge icon={<LockIcon />} label="SSL Secured" />
          </div>
          <p style={{
            fontSize: 11.5, color: '#8B8378', marginTop: 14, maxWidth: 380,
            marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5, textAlign: 'center',
            padding: isMobile ? '0 8px' : 0,
            animation: splashDone ? 'tracify-fadeInUp 600ms ease both' : 'none',
            animationDelay: '450ms'
          }}>
            The recipient receives an SMS asking for consent to share their location. No app install required.
          </p>
        </div>
      </div>

      {/* Features */}
      <div ref={featuresRef} style={{ maxWidth: 1240, margin: '0 auto', padding: isMobile ? '40px 16px' : '60px 40px' }}>
        <h2 style={{
          fontFamily: 'Instrument Serif, serif',
          fontSize: isMobile ? 'clamp(28px, 8vw, 36px)' : 48, lineHeight: 1, letterSpacing: -1,
          textAlign: 'center', margin: 0, color: '#0B1F1A', fontWeight: 400,
          opacity: featuresVisible ? 1 : 0,
          animation: featuresVisible ? 'tracify-fadeInUp 600ms ease both' : 'none'
        }}>What you get</h2>
        <p style={{
          textAlign: 'center', color: '#5A5750', fontSize: isMobile ? 14 : 15, marginTop: 12,
          opacity: featuresVisible ? 1 : 0,
          animation: featuresVisible ? 'tracify-fadeInUp 600ms ease both' : 'none',
          animationDelay: '80ms'
        }}>
          Everything a family needs to stay connected.
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20, marginTop: 42
        }}>
          {[
            { t: 'Real-time location', d: 'A calm dot on the map. Updates every minute, battery-friendly.', tone: 'mint', preview: <PreviewRealtime accent={accent} /> },
            { t: 'Location history', d: 'A 30-day trail of where your circle has been. Scrub back in time.', tone: 'peach', preview: <PreviewHistory accent={accent} /> },
            { t: 'Place alerts', d: 'Home, school, gym. A gentle heads-up when they arrive or leave.', tone: 'cream', preview: <PreviewPlaceAlert accent={accent} /> },
            { t: 'Carrier lookup', d: 'Identify the mobile network from the number prefix.', tone: 'sky', preview: <PreviewCarrier accent={accent} /> }
          ].map((f, idx) => <FeatureCard key={f.t} f={f} accent={accent} visible={featuresVisible} delay={idx * 80} />)}
        </div>
      </div>

      {/* Testimonials */}
      <div ref={testimonialsRef} style={{ padding: isMobile ? '20px 0 60px' : '40px 0 80px', overflow: 'hidden' }}>
        <div style={{
          maxWidth: 1240, margin: '0 auto', padding: isMobile ? '0 16px' : '0 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: isMobile ? 8 : 14, marginBottom: 40, flexWrap: 'wrap',
          opacity: testimonialsVisible ? 1 : 0,
          animation: testimonialsVisible ? 'tracify-fadeInUp 600ms ease both' : 'none'
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: '#fff', border: '1px solid #EEE6D6',
            padding: '8px 14px', borderRadius: 999
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 4, background: '#00B67A',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7L12 17.8 5.7 21.2l1.7-7L2 9.5l7.1-.6L12 2z" /></svg>
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0B1F1A' }}>Trustpilot</span>
          </div>
          <StarRow accent="#00B67A" small={isMobile} />
          <div style={{ fontSize: isMobile ? 13 : 15, color: '#3C3A33' }}>
            <strong style={{ color: '#0B1F1A' }}>4.8 out of 5</strong> · 214,382 reviews
          </div>
        </div>
        <ReviewMarquee accent={accent} direction="left" reviews={REVIEWS_ROW_1} />
        <div style={{ height: isMobile ? 12 : 18 }} />
        <ReviewMarquee accent={accent} direction="right" reviews={REVIEWS_ROW_2} />
        <div style={{ height: isMobile ? 12 : 18 }} />
        <ReviewMarquee accent={accent} direction="left" reviews={REVIEWS_ROW_3} speed={55} />
      </div>

      {/* Minimal footer — just legal links */}
      <div style={{
        textAlign: 'center', padding: isMobile ? '24px 16px 32px' : '32px 40px 40px',
        fontSize: 12, color: '#8B8378'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <a href="/terms" style={{ color: '#5A5750', textDecoration: 'none', fontWeight: 500 }}>Terms</a>
          <span style={{ color: '#D8D0C1' }}>·</span>
          <a href="/privacy" style={{ color: '#5A5750', textDecoration: 'none', fontWeight: 500 }}>Privacy</a>
          <span style={{ color: '#D8D0C1' }}>·</span>
          <a href="/contact" style={{ color: '#5A5750', textDecoration: 'none', fontWeight: 500 }}>Contact</a>
        </div>
        <div style={{ marginTop: 8, color: '#A39C8E' }}>&copy; 2026 Tracify</div>
      </div>

      {/* Overlays / Modals */}
      {sheetOpen &&
        <HeroCountrySheet
          countries={window.COUNTRIES}
          selectedCode={country.code}
          onSelect={setCountry}
          onClose={() => setSheetOpen(false)} />
      }

      {searchOverlay &&
        <SearchingOverlay
          country={country}
          phone={phone}
          carrier={lookup.carrier}
          accent={accent}
          mapTarget={mapTarget}
          onComplete={handleSearchComplete}
          onClose={() => history.back()} />
      }

      <LocatedModal
        open={resultModal}
        onClose={() => history.back()}
        onContinue={handleContinueToReport}
        country={country}
        phoneDisplay={phone || '--- --- ----'}
        carrier={lookup.carrier}
        city={lookup.city}
        localTime={localTime}
        tzSign={country.tzOffset >= 0 ? '+' : ''}
        accent={accent} />

      {reportPage &&
        <ReportPage
          onBack={() => history.back()}
          country={country}
          phone={phone}
          carrier={lookup.carrier}
          city={lookup.city}
          accent={accent} />
      }
    </div>
  );
}

// ─── Searching Overlay ──────────────────────────────────────
function SearchingOverlay({ country, phone, carrier, accent, mapTarget, onComplete, onClose }) {
  const STEPS = [
    'Connecting to the cellular base station',
    'Identifying the network operator',
    'Connecting to the phone'
  ];
  const STEP_DURATION = 1400;
  const TOTAL = STEP_DURATION * STEPS.length;

  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const isMobile = window.innerWidth < 820;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / TOTAL) * 100);
      setProgress(pct);
      setActiveStep(Math.min(STEPS.length - 1, Math.floor(elapsed / STEP_DURATION)));
      if (elapsed < TOTAL) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(onComplete, 350);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const phoneDisplay = phone || '--- --- ----';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 900,
      background: '#EFE8DA', animation: 'tracify-fadein 240ms ease',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Geist, system-ui'
    }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <RealMap country={mapTarget ? { ...country, center: mapTarget.center, zoom: mapTarget.zoom } : country} playing={true} accent={accent} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(247,243,235,0) 0%, rgba(247,243,235,0.15) 70%, rgba(247,243,235,0.35) 100%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `linear-gradient(180deg, transparent 0%, ${accent}26 50%, transparent 100%)`,
          animation: 'tracify-scan 2.4s ease-in-out infinite', mixBlendMode: 'multiply'
        }} />
      </div>

      <button onClick={onClose} aria-label="Cancel" style={{
        position: 'absolute', top: 20, right: 20, zIndex: 1000,
        width: 40, height: 40, borderRadius: '50%',
        border: '1.5px solid #E6DFD2', background: '#fff',
        cursor: 'pointer', fontSize: 20, color: '#5A5750',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(11,31,26,0.08)'
      }}>x</button>

      <div style={{
        position: 'relative', zIndex: 1000, width: '92%', maxWidth: isMobile ? 340 : 460,
        background: '#fff', borderRadius: 24, padding: isMobile ? '18px 18px 14px' : '28px 28px 24px',
        boxShadow: '0 30px 80px rgba(11,31,26,0.25)', border: '1px solid #EEE6D6',
        animation: 'tracify-popin 380ms cubic-bezier(0.3,1.2,0.4,1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: `${accent}14`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              border: `2.5px solid ${accent}`, borderTopColor: 'transparent',
              animation: 'tracify-spin 0.9s linear infinite'
            }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'Instrument Serif, serif', fontSize: isMobile ? 18 : 24, lineHeight: 1.1,
              color: '#0B1F1A', fontWeight: 400, letterSpacing: -0.3
            }}>Searching...</div>
            <div style={{
              fontSize: 12.5, color: '#5A5750', marginTop: 2,
              fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center', gap: 6
            }}>
              <span style={{ fontSize: 14 }}>{country.flag}</span>
              {country.dial} {phoneDisplay}
            </div>
          </div>
        </div>

        <div style={{ height: 6, borderRadius: 999, background: '#F3EDDE', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{
            height: '100%', width: `${progress}%`, background: accent, borderRadius: 999,
            transition: 'width 120ms linear', boxShadow: `0 0 12px ${accent}55`
          }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STEPS.map((label, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                opacity: done || active ? 1 : 0.45, transition: 'opacity 240ms ease'
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: done ? accent : active ? '#fff' : '#F7F3EB',
                  border: done ? 'none' : `1.8px solid ${active ? accent : '#D8D0C1'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {done ? (
                    <svg width="11" height="11" viewBox="0 0 12 12"><path d="M10 3L4.5 8.5 2 6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : active ? (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, animation: 'tracify-pulse 1.2s infinite' }} />
                  ) : null}
                </div>
                <div style={{ fontSize: isMobile ? 12 : 14, color: done || active ? '#0B1F1A' : '#8B8378', fontWeight: active ? 600 : 500 }}>
                  {label}{active && <span style={{ display: 'inline-block', marginLeft: 4, color: accent }}>...</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 22, paddingTop: 18, borderTop: '1px solid #F3EDDE',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 14, fontSize: 11.5, color: '#8B8378', fontWeight: 500
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><ShieldIcon /> 100% confidential</span>
          <span>.</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><LockIcon /> SSL secured</span>
        </div>
      </div>
    </div>
  );
}

// ─── Located Modal ──────────────────────────────────────────
function LocatedModal({ open, onClose, onContinue, country, phoneDisplay, carrier, city, localTime, tzSign, accent }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(11,31,26,0.55)', backdropFilter: 'blur(6px)',
      animation: 'tracify-fadein 220ms ease', padding: 20
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: 440, background: '#fff', borderRadius: 24,
        overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.3)',
        animation: 'tracify-popin 360ms cubic-bezier(0.3,1.2,0.4,1)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          padding: '22px 24px 18px',
          background: `linear-gradient(180deg, ${accent}12, #fff)`,
          borderBottom: '1px solid #F3EDDE', position: 'relative'
        }}>
          <button onClick={onClose} aria-label="Close" style={{
            position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: '50%',
            border: 'none', background: 'rgba(11,31,26,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 18, color: '#5A5750', lineHeight: 1
          }}>x</button>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 600, color: accent,
            background: `${accent}18`, padding: '4px 10px', borderRadius: 999,
            letterSpacing: 0.4, textTransform: 'uppercase'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, animation: 'tracify-pulse 1.4s infinite' }} />
            Located
          </div>
          <h3 style={{
            fontFamily: 'Instrument Serif, serif', fontWeight: 400,
            fontSize: 30, lineHeight: 1.05, letterSpacing: -0.5,
            color: '#0B1F1A', margin: '10px 0 4px'
          }}>Signal found</h3>
          <div style={{ fontSize: 13, color: '#5A5750' }}>Last seen about 2 minutes ago . Accuracy +/-47 m</div>
        </div>

        <div style={{ padding: '8px 24px' }}>
          <ModalRow label="SIM carrier" value={carrier} accent={accent} glyph="carrier" />
          <ModalRow label="Number" value={`${country.dial} ${phoneDisplay}`} mono accent={accent} glyph="phone" />
          <ModalRow label="Country" value={`${country.flag}  ${country.name}`} accent={accent} glyph="flag" />
          <ModalRow label="Local time" value={`${localTime}  .  UTC${tzSign}${country.tzOffset}`} mono live accent={accent} glyph="clock" />
          <ModalRow label="City" value="██████████" mono accent={accent} glyph="pin" blurred />
          <ModalRow label="Exact address" value="██ ████████ ███, ██████" mono accent={accent} glyph="pin" blurred last />
        </div>

        <div style={{
          margin: '8px 24px 0', padding: '10px 12px', borderRadius: 10,
          background: '#F7F3EB', display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 12, color: '#5A5750', lineHeight: 1.45
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#8B8378" strokeWidth="1.2" style={{ flexShrink: 0 }}>
            <circle cx="7" cy="7" r="5.5" /><path d="M7 4v3m0 2v.5" strokeLinecap="round" />
          </svg>
          Exact street, recent trail and WiFi are hidden. Unlock the full report to reveal.
        </div>

        <div style={{ padding: '16px 24px 22px' }}>
          <button onClick={onContinue} style={{
            width: '100%', height: 52, border: 'none',
            background: accent, color: '#fff', borderRadius: 14,
            fontSize: 15.5, fontWeight: 600, cursor: 'pointer',
            boxShadow: `0 10px 24px ${accent}55`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            Continue
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7h10m-4-4l4 4-4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div style={{
            textAlign: 'center', marginTop: 10, fontSize: 11.5, color: '#8B8378',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
          }}>
            <span>SSL secured</span><span>.</span>
            <span>100% confidential</span><span>.</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Report Page (after Located → full page with data card + email signup) ───
function ReportPage({ onBack, country, phone, carrier, city, accent }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 820);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onResize = () => setIsMobile(window.innerWidth < 820);
    window.addEventListener('resize', onResize);
    return () => { document.body.style.overflow = ''; window.removeEventListener('resize', onResize); };
  }, []);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    if (!validEmail || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phoneToTrack: phone.replace(/\D/g, ''),
          countryCode: country.dial,
          source: 'go',
          plan: 'go'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error && data.error.includes('already exists')) {
          setError('Account exists. Redirecting to login...');
          setTimeout(() => { window.location.href = '/payment'; }, 1500);
          return;
        }
        throw new Error(data.error || 'Signup failed');
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        window.location.href = data.redirectTo || '/payment';
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const phoneDisplay = phone || '--- --- ----';
  const border = '#F3EDDE';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      background: '#F7F3EB', overflowY: 'auto',
      animation: 'tracify-fadein 240ms ease',
      fontFamily: 'Geist, system-ui, sans-serif', color: '#0B1F1A'
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 28px', borderBottom: `1px solid ${border}`, background: '#fff'
      }}>
        <TracifyLogo size={22} accent={accent} />
        <button onClick={onBack} style={{
          fontSize: 13, color: '#5A5750', background: 'none', border: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          fontFamily: 'Geist, system-ui'
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M10 6H2m4-3L2 6l4 3" stroke="#5A5750" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '32px 16px 80px' : '48px 24px 80px' }}>
        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: 11.5, fontWeight: 600, color: accent,
          background: `${accent}18`, padding: '6px 12px', borderRadius: 999,
          letterSpacing: 0.5, textTransform: 'uppercase'
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent, animation: 'tracify-pulse 1.4s infinite' }} />
          Report ready
        </div>

        <h1 style={{
          fontFamily: 'Instrument Serif, serif', fontWeight: 400,
          fontSize: isMobile ? 'clamp(32px, 8vw, 40px)' : 'clamp(44px, 6vw, 72px)',
          lineHeight: 1, letterSpacing: isMobile ? -0.5 : -1.5, margin: '18px 0 14px'
        }}>
          Your report is<br />ready to unlock.
        </h1>
        <p style={{ fontSize: isMobile ? 15 : 17, color: '#5A5750', maxWidth: 560, lineHeight: 1.55, margin: '0 0 40px' }}>
          We found a match for your number. Enter your email to reveal the exact street, recent trail, and WiFi network.
        </p>

        {/* 2-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr',
          gap: 28, alignItems: 'start'
        }}>
          {/* LEFT — Data Card */}
          <div style={{
            background: '#fff', border: `1px solid ${border}`, borderRadius: 20, overflow: 'hidden'
          }}>
            {/* Map strip */}
            <div style={{
              height: 140, background: 'linear-gradient(135deg, #E8F2EC, #D8E8DD)',
              position: 'relative', overflow: 'hidden',
              borderBottom: `1px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg viewBox="0 0 400 140" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }}>
                <defs><pattern id="rpt-dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill={accent} opacity="0.4" /></pattern></defs>
                <rect width="400" height="140" fill="url(#rpt-dots)" />
                <path d="M0 100 Q80 70 160 85 T320 60 L400 75" stroke={accent} strokeWidth="1.2" fill="none" opacity="0.35" strokeDasharray="3 4" />
              </svg>
              <div style={{
                background: '#fff', padding: '10px 16px', borderRadius: 999,
                boxShadow: '0 6px 20px rgba(0,0,0,0.1)', fontSize: 13.5, fontWeight: 600,
                color: '#0B1F1A', display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 2
              }}>
                <svg width="14" height="14" viewBox="0 0 22 22"><path d="M11 2C7 2 3.5 5 3.5 9c0 5 7.5 11 7.5 11s7.5-6 7.5-11c0-4-3.5-7-7.5-7z" fill={accent} /><circle cx="11" cy="9" r="3" fill="#fff" /></svg>
                Located
              </div>
            </div>

            {/* "What we found" */}
            <div style={{ padding: '18px 22px 8px', fontSize: 13, color: '#8B8378', fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>
              What we found
            </div>

            <ReportRow label="SIM carrier" value={carrier} accent={accent} glyph="carrier" />
            <ReportRow label="Number" value={`${country.dial} ${phoneDisplay}`} accent={accent} glyph="phone" mono />
            <ReportRow label="Country" value={`${country.flag}  ${country.name}`} accent={accent} glyph="flag" />
            <ReportRow label="City" value="██████████" accent={accent} glyph="pin" mono blurred />
            <ReportRow label="Accuracy" value="±47 m from last known point" accent={accent} glyph="clock" />

            {/* Locked block */}
            <div style={{
              position: 'relative', padding: '18px 22px 22px',
              background: 'linear-gradient(180deg, #fff 0%, #F7F3EB 100%)',
              borderTop: `1px solid ${border}`
            }}>
              <div style={{
                fontSize: 12, color: '#8B8378', fontWeight: 600, letterSpacing: 0.5,
                textTransform: 'uppercase', marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#8B8378" strokeWidth="1.4"><rect x="2" y="5" width="7" height="5" rx="1" /><path d="M3.5 5V3.5a2 2 0 014 0V5" /></svg>
                Locked — unlock below
              </div>
              {[
                { label: 'Exact street address', val: '███ ████████ Ave, ██████' },
                { label: 'Last 7 days trail', val: '██ pings · ██ places visited' },
                { label: 'Current WiFi network', val: '████████_████ (5 GHz)' },
                { label: 'Top visited places', val: '██████ · ██████ · ██████' }
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 0', borderTop: i === 0 ? 'none' : '1px dashed #E6DFD2'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11.5, color: '#8B8378', fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>{item.label}</div>
                    <div style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                      color: '#A39C8E', filter: 'blur(5px)', userSelect: 'none',
                      fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', marginTop: 3
                    }}>{item.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Email Signup Card */}
          <div style={{
            background: '#fff', border: `1px solid ${border}`, borderRadius: 20,
            padding: 24, position: isMobile ? 'static' : 'sticky', top: 24
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: `${accent}14`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 7l10 7 10-7" />
              </svg>
            </div>

            <h3 style={{
              fontFamily: 'Instrument Serif, serif', fontWeight: 400,
              fontSize: 28, lineHeight: 1.1, letterSpacing: -0.3,
              color: '#0B1F1A', margin: '0 0 6px'
            }}>Unlock full report</h3>
            <p style={{ fontSize: 13.5, color: '#5A5750', margin: '0 0 20px', lineHeight: 1.55 }}>
              Enter your email to get started. We'll create your account and send your password.
            </p>

            <div style={{ marginBottom: 4, fontSize: 12, fontWeight: 600, color: '#5A5750', textTransform: 'uppercase', letterSpacing: 0.4 }}>Email address</div>
            <input
              type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="you@example.com"
              autoFocus
              style={{
                width: '100%', border: '1.5px solid #E6DFD2', borderRadius: 12,
                padding: '14px 16px', fontSize: 15, outline: 'none',
                fontFamily: 'Geist, system-ui', boxSizing: 'border-box',
                background: '#F7F3EB', transition: 'border-color 200ms',
              }}
              onFocus={(e) => e.target.style.borderColor = accent}
              onBlur={(e) => e.target.style.borderColor = '#E6DFD2'}
            />

            {error && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#D94545', fontWeight: 500 }}>{error}</div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!validEmail || loading}
              style={{
                marginTop: 16, width: '100%', height: 54, border: 'none',
                background: validEmail && !loading ? accent : '#D8D0C1',
                color: '#fff', borderRadius: 14, fontSize: 15.5, fontWeight: 600,
                cursor: validEmail && !loading ? 'pointer' : 'not-allowed',
                boxShadow: validEmail && !loading ? `0 10px 24px ${accent}55` : 'none',
                fontFamily: 'Geist, system-ui', transition: 'all 200ms ease',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              {loading ? 'Creating account...' : 'Start for $0.50'}
              {!loading && <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7h10m-4-4l4 4-4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>

            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <div style={{ fontSize: 12, color: '#8B8378', lineHeight: 1.5 }}>
                $0.50 for 24h trial, then $19.99/mo. Cancel anytime.
              </div>
              <div style={{ fontSize: 11, color: '#A39C8E', marginTop: 6 }}>
                By continuing, you agree to our <a href="/terms" style={{ color: accent, textDecoration: 'none' }}>Terms</a> and <a href="/privacy" style={{ color: accent, textDecoration: 'none' }}>Privacy Policy</a>.
              </div>
            </div>

            {/* Trust badges */}
            <div style={{
              display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap',
              borderTop: `1px solid ${border}`, paddingTop: 18
            }}>
              {['4.8 ★ on App Store', '500k+ lookups', 'GDPR compliant'].map((b) => (
                <span key={b} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 11.5, color: '#5A5750', background: '#F7F3EB',
                  border: `1px solid ${border}`, padding: '6px 12px', borderRadius: 999
                }}>{b}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 11.5, color: '#8B8378', marginTop: 48 }}>
          Tracify · Family location · Not affiliated with any carrier
        </div>
      </div>
    </div>
  );
}

// ─── Report Row (for report page data card) ───
function ReportRow({ label, value, accent, glyph, mono }) {
  const glyphs = {
    carrier: <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round"><path d="M3 11a6 6 0 0110 0" /><path d="M5.5 9a3 3 0 015 0" /><circle cx="8" cy="11.5" r="1" fill={accent} /></svg>,
    phone: <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4.5" y="2" width="7" height="12" rx="1.3" /><path d="M7 12h2" /></svg>,
    flag: <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14V3" /><path d="M4 3h7l-1.5 2.5L11 8H4" /></svg>,
    clock: <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="5.5" /><path d="M8 5v3l2 1.5" /></svg>,
    pin: <svg width="18" height="18" viewBox="0 0 16 16" fill={accent}><path d="M8 1.5c-2.8 0-5 2.2-5 5 0 3.5 5 8 5 8s5-4.5 5-8c0-2.8-2.2-5-5-5z" /><circle cx="8" cy="6.5" r="2" fill="#fff" /></svg>
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 22px', borderTop: '1px solid #F3EDDE'
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 11, background: '#F7F3EB',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>{glyphs[glyph]}</div>
      <div>
        <div style={{ fontSize: 11.5, color: '#8B8378', fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}</div>
        <div style={{
          fontSize: 15.5, color: '#0B1F1A', marginTop: 3, fontWeight: 500,
          fontFamily: mono ? 'ui-monospace, SFMono-Regular, monospace' : 'Geist, system-ui',
          fontVariantNumeric: 'tabular-nums'
        }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Modal Row ──────────────────────────────────────────────
function ModalRow({ label, value, mono, live, accent, glyph, blurred, last, loading }) {
  const glyphs = {
    carrier: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round"><path d="M3 11a6 6 0 0110 0" /><path d="M5.5 9a3 3 0 015 0" /><circle cx="8" cy="11.5" r="1" fill={accent} /></svg>,
    phone: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4.5" y="2" width="7" height="12" rx="1.3" /><path d="M7 12h2" /></svg>,
    flag: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14V3" /><path d="M4 3h7l-1.5 2.5L11 8H4" /></svg>,
    clock: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="5.5" /><path d="M8 5v3l2 1.5" /></svg>,
    pin: <svg width="16" height="16" viewBox="0 0 16 16" fill={accent}><path d="M8 1.5c-2.8 0-5 2.2-5 5 0 3.5 5 8 5 8s5-4.5 5-8c0-2.8-2.2-5-5-5z" /><circle cx="8" cy="6.5" r="2" fill="#fff" /></svg>
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '11px 0', borderBottom: last ? 'none' : '1px solid #F3EDDE'
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: blurred ? `${accent}14` : '#F7F3EB',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>{glyphs[glyph]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: '#8B8378', fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
          {label}
          {live && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6EE5A5', animation: 'tracify-pulse 1.4s infinite' }} />}
          {blurred && <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke={accent} strokeWidth="1.4"><rect x="2" y="5" width="7" height="5" rx="1" /><path d="M3.5 5V3.5a2 2 0 014 0V5" /></svg>}
        </div>
        <div style={{
          fontSize: 14.5, color: blurred ? '#A39C8E' : '#0B1F1A', fontWeight: 500, marginTop: 2,
          fontFamily: mono ? 'ui-monospace, SFMono-Regular, monospace' : 'Geist, system-ui',
          fontVariantNumeric: 'tabular-nums',
          filter: blurred ? 'blur(4px)' : 'none', userSelect: blurred ? 'none' : 'auto',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Small Components ───────────────────────────────────────
function Laurel({ accent, side }) {
  const flip = side === 'right' ? 'scaleX(-1)' : 'none';
  return (
    <svg width="22" height="28" viewBox="0 0 22 28" style={{ transform: flip }}>
      <path d="M11 26 Q4 22 3 14 Q4 6 11 2" stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {[6, 10, 14, 18, 22].map((y) =>
        <ellipse key={y} cx={5 + Math.abs(12 - y) * 0.25} cy={y} rx="3" ry="1.3" fill={accent} opacity="0.85"
          transform={`rotate(${-25 + (y - 6) * 2} ${5 + Math.abs(12 - y) * 0.25} ${y})`} />
      )}
    </svg>
  );
}

function SecurityBadge({ icon, label }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(27,138,90,0.06)', borderRadius: 8, padding: '6px 10px',
      fontSize: 11.5, color: '#1B8A5A', fontWeight: 500
    }}>{icon} {label}</div>
  );
}

function AppleIcon() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="#3C3A33"><path d="M9.3 6.3c0-1.3 1-1.9 1.1-1.9-.6-.9-1.5-1-1.9-1-.8-.1-1.6.5-2 .5-.4 0-1-.5-1.7-.5-.9 0-1.7.5-2.2 1.3-.9 1.6-.2 4 .7 5.3.4.6.9 1.4 1.6 1.3.7 0 .9-.4 1.7-.4.8 0 1 .4 1.7.4.7 0 1.1-.6 1.5-1.3.5-.8.7-1.5.7-1.6 0 0-1.4-.5-1.4-2.1zm-1.4-3.9c.4-.4.6-1 .6-1.6-.5 0-1.1.3-1.5.7-.3.3-.6 1-.5 1.5.5.1 1.1-.3 1.4-.6z" /></svg>; }
function AndroidIcon() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="#3C3A33"><path d="M3 5.5v3.5h6V5.5H3zm-1.3.3c-.4 0-.7.3-.7.7v2c0 .4.3.7.7.7s.7-.3.7-.7v-2c0-.4-.3-.7-.7-.7zm8.6 0c-.4 0-.7.3-.7.7v2c0 .4.3.7.7.7s.7-.3.7-.7v-2c0-.4-.3-.7-.7-.7zm-6.5 3.7v1.8c0 .4.3.7.7.7s.7-.3.7-.7V9.5h1.6v1.8c0 .4.3.7.7.7s.7-.3.7-.7V9.5H3.8zM8.5 3.2l.6-.9c.05-.1 0-.2-.1-.2-.1-.05-.2 0-.3.1l-.6.9c-.5-.2-1.1-.3-1.7-.3s-1.2.1-1.7.3l-.6-.9c-.05-.1-.2-.15-.3-.1-.1.05-.15.15-.1.2l.6.9C3.5 3.8 3 4.6 3 5.5h6c0-.9-.5-1.7-1.5-2.3zM4.5 4.7c-.2 0-.3-.15-.3-.3s.15-.3.3-.3.3.15.3.3-.15.3-.3.3zm3 0c-.2 0-.3-.15-.3-.3s.15-.3.3-.3.3.15.3.3-.15.3-.3.3z" /></svg>; }
function DevicesIcon() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#3C3A33" strokeWidth="1"><rect x="1" y="2" width="6" height="5" rx="0.5" /><rect x="7.5" y="4" width="3.5" height="6" rx="0.5" /></svg>; }
function NetworkIcon() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#3C3A33" strokeWidth="1" strokeLinecap="round"><path d="M2 8a5.6 5.6 0 018 0" /><path d="M3.5 6.5a3.5 3.5 0 015 0" /><circle cx="6" cy="9" r="0.7" fill="#3C3A33" /></svg>; }
function ShieldIcon() { return <svg width="11" height="11" viewBox="0 0 11 11" fill="#1B8A5A"><path d="M5.5 1L1.5 2.5v3c0 2.5 2 4.3 4 4.8 2-.5 4-2.3 4-4.8v-3L5.5 1z" /></svg>; }
function LockIcon() { return <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#1B8A5A" strokeWidth="1.2"><rect x="2" y="5" width="7" height="5" rx="1" /><path d="M3.5 5V3.5a2 2 0 014 0V5" /></svg>; }

function StarRow({ accent, small }) {
  const s = small ? 14 : 20;
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[0,1,2,3,4].map((i) =>
        <svg key={i} width={s} height={s} viewBox="0 0 20 20"><path d="M10 1l2.5 6 6.5.6-5 4.5 1.5 6.5L10 15l-5.5 3.6L6 12.1 1 7.6 7.5 7z" fill={accent} /></svg>
      )}
    </div>
  );
}

// ─── Country Sheet ──────────────────────────────────────────
function HeroCountrySheet({ countries, selectedCode, onSelect, onClose }) {
  const [q, setQ] = useState('');
  const [sheetIsMobile] = useState(window.innerWidth < 820);
  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase()) || c.dial.includes(q)
  );
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: sheetIsMobile ? 'flex-end' : 'center', justifyContent: 'center',
      background: 'rgba(11,31,26,0.35)', backdropFilter: 'blur(6px)'
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: sheetIsMobile ? '100%' : 420, maxHeight: sheetIsMobile ? '80vh' : '70vh',
        background: '#fff', borderRadius: sheetIsMobile ? '20px 20px 0 0' : 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
        fontFamily: 'Geist, system-ui'
      }}>
        <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid #EEE6D6' }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#0B1F1A', marginBottom: 12 }}>Select country</div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" style={{
            width: '100%', border: '1.5px solid #E6DFD2', borderRadius: 10,
            padding: '10px 12px', fontSize: 14, outline: 'none',
            fontFamily: 'Geist, system-ui', boxSizing: 'border-box'
          }} />
        </div>
        <div style={{ overflowY: 'auto', padding: 6 }}>
          {filtered.map((c) =>
            <button key={c.code} onClick={() => { onSelect(c); onClose(); }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', background: selectedCode === c.code ? '#F7F3EB' : 'transparent',
              border: 'none', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
              fontFamily: 'Geist, system-ui'
            }}>
              <span style={{ fontSize: 20 }}>{c.flag}</span>
              <span style={{ flex: 1, fontSize: 14.5, color: '#0B1F1A', fontWeight: 500 }}>{c.name}</span>
              <span style={{ fontSize: 13, color: '#8B8378' }}>{c.dial}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Feature Preview Cards ──────────────────────────────────
function PreviewRealtime({ accent }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: 105,
      background: 'linear-gradient(160deg, #F2EBDB 0%, #E6DDC5 100%)',
      borderRadius: 8, overflow: 'hidden',
      animation: 'tracify-float 4s ease-in-out infinite'
    }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} viewBox="0 0 200 105" preserveAspectRatio="none">
        <path d="M-10 40 Q60 30 120 45 T220 38" stroke="#D6C9A8" strokeWidth="3" fill="none" />
        <path d="M-10 75 Q70 80 140 65 T220 78" stroke="#D6C9A8" strokeWidth="3" fill="none" />
        <path d="M50 -5 Q55 40 62 60 T80 110" stroke="#D6C9A8" strokeWidth="2" fill="none" />
        <path d="M140 -5 Q145 30 150 55 T160 110" stroke="#D6C9A8" strokeWidth="2" fill="none" />
      </svg>
      <div style={{
        position: 'absolute', left: '50%', top: '48%', transform: 'translate(-50%, -50%)',
        width: 70, height: 70, borderRadius: '50%', background: `${accent}22`,
        animation: 'tracify-pulse 1.6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', left: '50%', top: '48%', transform: 'translate(-50%, -50%)',
        width: 18, height: 18, borderRadius: '50%', background: accent,
        border: '3px solid #fff', boxShadow: '0 3px 8px rgba(11,31,26,0.25)'
      }} />
      <div style={{
        position: 'absolute', top: 8, left: 8,
        background: 'rgba(11,31,26,0.78)', color: '#fff',
        fontSize: 9.5, fontWeight: 600, padding: '3px 7px', borderRadius: 999,
        display: 'inline-flex', alignItems: 'center', gap: 4
      }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#6EE5A5', animation: 'tracify-pulse 1.2s infinite' }} />
        LIVE
      </div>
      <div style={{
        position: 'absolute', bottom: 8, right: 8,
        background: '#fff', fontSize: 10, fontWeight: 600, color: '#0B1F1A',
        padding: '3px 7px', borderRadius: 6, boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        fontVariantNumeric: 'tabular-nums'
      }}>+/-4m . now</div>
    </div>
  );
}

function PreviewHistory({ accent }) {
  return (
    <div style={{ width: '100%', position: 'relative', background: 'linear-gradient(160deg, #F6EADB 0%, #ECDEC3 100%)',
      borderRadius: 8, overflow: 'hidden', height: 105
    }}>
      <svg width="100%" height="100%" viewBox="0 0 200 105" preserveAspectRatio="none">
        <path d="M20 85 Q40 70 60 60 T100 45 T140 30 T180 20" stroke={accent} strokeWidth="2.5" fill="none" strokeDasharray="1 4" strokeLinecap="round" opacity="0.9" />
        {[{ cx: 20, cy: 85 }, { cx: 75, cy: 55 }, { cx: 130, cy: 35 }, { cx: 180, cy: 20 }].map((p, i) =>
          <g key={i}><circle cx={p.cx} cy={p.cy} r="8" fill="#fff" stroke={accent} strokeWidth="2" /><circle cx={p.cx} cy={p.cy} r="3" fill={accent} /></g>
        )}
      </svg>
      <div style={{
        position: 'absolute', top: 8, left: 8,
        background: 'rgba(11,31,26,0.78)', color: '#fff',
        fontSize: 9.5, fontWeight: 600, padding: '3px 7px', borderRadius: 999
      }}>LAST WEEK</div>
    </div>
  );
}

function PreviewPlaceAlert({ accent }) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[
        { t: 'Arrived at Work', time: 'now', pin: '🏢', live: true },
        { t: 'Left Home', time: '8:42 AM', pin: '🏠' },
        { t: 'Arrived at School', time: 'Yesterday', pin: '🎒' }
      ].map((r, i) =>
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', background: i === 0 ? `${accent}14` : '#F7F3EB',
          borderRadius: 8, border: i === 0 ? `1px solid ${accent}44` : '1px solid transparent'
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11
          }}>{r.pin}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#0B1F1A', display: 'flex', alignItems: 'center', gap: 5 }}>
              {r.t}
              {r.live && <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, animation: 'tracify-pulse 1.4s infinite' }} />}
            </div>
            <div style={{ fontSize: 9.5, color: '#8B8378', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{r.time}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewCarrier({ accent }) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#F7F3EB', borderRadius: 8 }}>
        <span style={{ fontSize: 14 }}>🇺🇸</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#0B1F1A', fontVariantNumeric: 'tabular-nums' }}>+1 415 --- ----</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#fff', borderRadius: 8, border: `1.5px solid ${accent}44` }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 11a6 6 0 0110 0" /><path d="M5.5 9a3 3 0 015 0" /><circle cx="8" cy="11.5" r="1" fill={accent} />
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 8.5, color: '#8B8378', fontWeight: 600, letterSpacing: 0.4 }}>CARRIER</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#0B1F1A' }}>Verizon</div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, color: '#00B67A', fontWeight: 600 }}>
          <svg width="9" height="9" viewBox="0 0 12 12"><path d="M10 3L4.5 8.5 2 6" stroke="#00B67A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Matched
        </span>
      </div>
    </div>
  );
}

function FeatureCard({ f, accent, visible, delay = 0 }) {
  const tones = {
    mint: { bg: '#E8F2EC' },
    peach: { bg: '#FBEDE0' },
    cream: { bg: '#F2EADB' },
    sky: { bg: '#E6EEF2' }
  };
  const t = tones[f.tone];
  return (
    <div className="tracify-feature-card" style={{
      background: t.bg, borderRadius: 18, padding: 20,
      display: 'flex', flexDirection: 'column', gap: 14, minHeight: 260,
      transition: 'transform 200ms ease, box-shadow 200ms ease',
      cursor: 'default',
      opacity: visible ? 1 : 0,
      animation: visible ? 'tracify-fadeInUp 600ms ease both' : 'none',
      animationDelay: `${delay}ms`
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 14,
        minHeight: 130, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(11,31,26,0.04)'
      }}>{f.preview}</div>
      <div>
        <div style={{ fontFamily: 'Geist, system-ui', fontSize: 15.5, fontWeight: 600, color: '#0B1F1A', marginBottom: 6 }}>{f.t}</div>
        <div style={{ fontSize: 12.5, color: '#5A5750', lineHeight: 1.5 }}>{f.d}</div>
      </div>
    </div>
  );
}

// ─── Reviews ────────────────────────────────────────────────
const REVIEWS_ROW_1 = [
  { n: 'Priya M.', t: '2 days ago', q: "Finally a tracker that doesn't feel like spying. My teen actually leaves it on." },
  { n: 'Marcus L.', t: '1 week ago', q: 'The "arrived at school" alert is the only notification I welcome in the morning.' },
  { n: 'Ana C.', t: '3 weeks ago', q: "I use it for my mom when she travels. It's quiet, reliable, and she doesn't feel watched." },
  { n: 'Jordan W.', t: '5 days ago', q: 'Battery barely moves. Other apps killed my phone by 2pm.' },
  { n: 'Sara K.', t: '4 days ago', q: "My husband and I split school pickup. Tracify tells us who's closer." },
  { n: 'Emeka O.', t: '6 days ago', q: 'Set it up in 90 seconds. Clean UI. No upsell pop-ups.' },
  { n: 'Lena B.', t: '2 weeks ago', q: "Place alerts are gentle. Feels designed by actual parents." },
  { n: 'Rohit S.', t: '3 days ago', q: 'Works across India-US for our family. Both sides get the same map.' }
];

const REVIEWS_ROW_2 = [
  { n: 'Camila R.', t: 'Yesterday', q: "Crash detection called me before my son even realized his bike fell." },
  { n: 'Dev P.', t: '1 month ago', q: 'My aging dad finally agreed to install something. He says it feels like a family album.' },
  { n: 'Hannah T.', t: '2 weeks ago', q: 'Drive reports helped our teen actually slow down.' },
  { n: 'Mateo G.', t: '5 weeks ago', q: "Switched from a bigger app. Tracify is half the clutter, twice the calm." },
  { n: 'Ayesha N.', t: '1 week ago', q: 'The privacy model sold me. No data sold, no ads.' },
  { n: 'Grace H.', t: '10 days ago', q: 'Onboarding invited my whole family over SMS. Everyone was on in under 5 minutes.' },
  { n: 'Kofi A.', t: '3 weeks ago', q: 'Finally an app that respects both the parent and the kid.' }
];

const REVIEWS_ROW_3 = [
  { n: 'Yuki T.', t: '6 days ago', q: "Works seamlessly between my iPhone and my partner's Android." },
  { n: 'Olivia D.', t: '2 weeks ago', q: 'The 30-day history scrubber helped me reconstruct where my keys were.' },
  { n: 'Rafael P.', t: '3 days ago', q: "I'm a caregiver for 3 seniors. Tracify is the only tool they'd all accept." },
  { n: 'Ingrid F.', t: '1 week ago', q: "Battery alert pinged me before my son's phone died on his field trip." },
  { n: 'Daniel B.', t: '2 months ago', q: 'Been using it for 8 months. Zero bugs.' },
  { n: 'Noor Z.', t: '5 days ago', q: 'Love that pausing sharing is one tap and totally transparent.' },
  { n: 'Theo C.', t: '4 weeks ago', q: "The place I trust most with my family's location." },
  { n: 'Harper J.', t: '1 week ago', q: 'Beautifully designed. My 8-year-old navigates it on her own watch.' }
];

function ReviewMarquee({ reviews, direction = 'left', speed = 45, accent }) {
  const marqueeMobile = window.innerWidth < 820;
  const items = [...reviews, ...reviews];
  return (
    <div style={{
      position: 'relative',
      WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 40px, #000 calc(100% - 40px), transparent)',
      maskImage: 'linear-gradient(90deg, transparent, #000 40px, #000 calc(100% - 40px), transparent)'
    }}>
      <div style={{
        display: 'flex', gap: marqueeMobile ? 12 : 18, width: 'max-content',
        animation: `tracify-marquee-${direction} ${speed}s linear infinite`
      }}>
        {items.map((r, i) => <ReviewCard key={i} r={r} accent={accent} />)}
      </div>
    </div>
  );
}

function ReviewCard({ r, accent }) {
  const cardMobile = window.innerWidth < 820;
  return (
    <div style={{
      flexShrink: 0, width: cardMobile ? 280 : 340, background: '#fff', borderRadius: 16,
      padding: cardMobile ? '16px 16px' : '20px 22px',
      border: '1px solid #EEE6D6', boxShadow: '0 2px 10px rgba(11,31,26,0.04)',
      display: 'flex', flexDirection: 'column', gap: cardMobile ? 10 : 12
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {[0,1,2,3,4].map((i) =>
            <span key={i} style={{
              width: 18, height: 18, background: '#00B67A',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7L12 17.8 5.7 21.2l1.7-7L2 9.5l7.1-.6L12 2z" /></svg>
            </span>
          )}
        </div>
        <div style={{ fontSize: 11.5, color: '#8B8378', fontWeight: 500 }}>{r.t}</div>
      </div>
      <p style={{
        fontFamily: 'Instrument Serif, serif', fontSize: cardMobile ? 15 : 17, lineHeight: 1.35,
        color: '#0B1F1A', margin: 0, fontWeight: 400,
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
      }}>"{r.q}"</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: `${accent}22`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, color: accent, fontSize: 12
        }}>{r.n[0]}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0B1F1A' }}>{r.n}</div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 11, color: '#00B67A', fontWeight: 600, marginLeft: 'auto'
        }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="#00B67A"><path d="M10 3L4.5 8.5 2 6" stroke="#00B67A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Verified
        </span>
      </div>
    </div>
  );
}

// ─── Extra keyframe animations ──────────────────────────────
const extraStyles = document.createElement('style');
extraStyles.textContent = `
  @keyframes tracify-marquee-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes tracify-marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }

  /* Entrance animation — staggered fade-in-up */
  @keyframes tracify-fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Feature card hover — scale + shadow lift */
  .tracify-feature-card {
    transition: transform 200ms ease, box-shadow 200ms ease;
  }
  .tracify-feature-card:hover {
    transform: scale(1.02);
    box-shadow: 0 12px 32px rgba(11,31,26,0.10);
  }

  /* Floating bob animation for preview illustrations */
  @keyframes tracify-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  /* CTA button gradient shift */
  .tracify-cta-btn:not(:disabled) {
    background: linear-gradient(90deg, #1B8A5A 0%, #24A96E 50%, #1B8A5A 100%) !important;
    background-size: 200% 100% !important;
    animation: tracify-gradient-shift 3s ease-in-out infinite !important;
  }
  @keyframes tracify-gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* Typing cursor blink on phone input placeholder */
  .tracify-phone-input::placeholder {
    color: #A39C8E;
  }
  @keyframes tracify-cursor-blink {
    0%, 49% { border-right-color: #8B8378; }
    50%, 100% { border-right-color: transparent; }
  }
  .tracify-phone-input:placeholder-shown {
    border-right: 2px solid transparent;
    animation: tracify-cursor-blink 1s step-end infinite;
  }
  .tracify-phone-input:focus {
    animation: none !important;
    border-right: none !important;
  }

  /* Ensure no horizontal overflow on mobile */
  html, body { overflow-x: hidden; max-width: 100vw; }

  /* Disable hover transforms on touch devices */
  @media (hover: none) {
    .tracify-feature-card:hover {
      transform: none !important;
      box-shadow: none !important;
    }
  }
`;
document.head.appendChild(extraStyles);

// ─── Mount ──────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
