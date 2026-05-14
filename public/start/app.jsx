// Tracify /start — Geozilla clone with proper illustrations
var defined = React;
var useState = defined.useState, useEffect = defined.useEffect, useRef = defined.useRef, useMemo = defined.useMemo;

var C = {
  accent: '#1B8A5A', accentLight: '#E8F5EE', accentSoft: '#8BC4A8', accentBorder: '#2DA872',
  ctaBg: '#F0F9F4', dark: '#232323', mid: '#323232', muted: '#5B5B5B', gray: '#848484',
  cardBg: '#F4F4F4', cardBorder: '#DEDEDE', ratingBg: '#FFF8E6', ratingBorder: '#FAE9B7',
  pressBg: '#FBFBFB', inputBg: '#F9F9FA', inputBorder: '#D4DAE0'
};

var CARRIER_PREFIXES = {
  PK:[{p:['300','301','302','303','304','305','306','307','308','309'],name:'Jazz'},{p:['310','311','312','313','314','315','316','317','318','319'],name:'Zong'},{p:['320','321','322','323','324','325','326','327','328','329'],name:'Jazz'},{p:['330','331','332','333','334','335','336','337','338','339'],name:'Ufone'},{p:['340','341','342','343','344','345','346','347','348','349'],name:'Jazz'},{p:['355'],name:'SCOM'}],
  IN:[{p:['70','71','72','73','74','75','76','77','78','79'],name:'Jio'},{p:['80','81','82','83','84','85','86','87','88','89'],name:'Airtel'},{p:['90','91','92','93','94','95','96','97','98','99'],name:'Vi'}],
  US:[{p:['212','332','646','917','718','347'],name:'Verizon'},{p:['213','310','323','424','818'],name:'T-Mobile'},{p:['312','773','872','224','847'],name:'AT&T'},{p:['415','628','510','650'],name:'Verizon'},{p:['305','786','954','561'],name:'T-Mobile'},{p:['214','469','972','817'],name:'AT&T'}],
  GB:[{p:['74','75','77','78'],name:'EE'},{p:['73','79'],name:'Vodafone'},{p:['76'],name:'Three'},{p:['70','71','72'],name:'O2'}],
  DE:[{p:['151','160','170','171','175'],name:'Telekom'},{p:['152','162','172','173','174'],name:'Vodafone'},{p:['157','163','177','178'],name:'O2'}],
  FR:[{p:['6','7'],name:'Orange'}],BR:[{p:['11','21','31','41','51','61','71','81','91'],name:'Vivo'}],
  AE:[{p:['50','54','56'],name:'Etisalat'},{p:['52','55','58'],name:'du'}],
  SA:[{p:['50','53','55'],name:'STC'},{p:['54','56'],name:'Mobily'},{p:['58','59'],name:'Zain'}]
};
var CITY_POOLS = {
  PK:['Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar','Quetta','Hyderabad','Sialkot'],
  IN:['Mumbai','Delhi','Bengaluru','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Jaipur','Lucknow'],
  US:['New York, NY','Los Angeles, CA','Chicago, IL','Houston, TX','Phoenix, AZ','Dallas, TX','Miami, FL','San Francisco, CA','Seattle, WA','Boston, MA'],
  GB:['London','Manchester','Birmingham','Leeds','Glasgow','Liverpool','Edinburgh','Bristol'],
  DE:['Berlin','Munich','Hamburg','Cologne','Frankfurt','Stuttgart'],FR:['Paris','Marseille','Lyon','Toulouse','Nice','Nantes'],
  BR:['São Paulo','Rio de Janeiro','Brasília','Salvador','Fortaleza'],AE:['Dubai','Abu Dhabi','Sharjah'],SA:['Riyadh','Jeddah','Mecca','Medina'],
  CA:['Toronto','Montreal','Vancouver','Calgary'],AU:['Sydney','Melbourne','Brisbane','Perth'],
  JP:['Tokyo','Osaka','Yokohama','Nagoya'],CN:['Beijing','Shanghai','Guangzhou','Shenzhen'],
  MX:['Mexico City','Guadalajara','Monterrey'],NG:['Lagos','Abuja','Kano'],ID:['Jakarta','Surabaya','Bandung'],
  TR:['Istanbul','Ankara','Izmir'],EG:['Cairo','Alexandria','Giza'],ZA:['Johannesburg','Cape Town','Durban'],
  IT:['Rome','Milan','Naples','Turin'],ES:['Madrid','Barcelona','Valencia'],NL:['Amsterdam','Rotterdam','Utrecht']
};
var PHONE_LENGTHS = {US:[10,10],CA:[10,10],MX:[10,10],BR:[10,11],AR:[10,11],GB:[10,11],IE:[7,9],DE:[10,11],FR:[9,9],ES:[9,9],IT:[9,10],NL:[9,9],SE:[7,9],NO:[8,8],PL:[9,9],TR:[10,10],IN:[10,10],PK:[10,10],CN:[11,11],JP:[10,11],KR:[10,11],ID:[9,12],PH:[10,10],TH:[9,9],VN:[9,10],AU:[9,9],NZ:[8,10],ZA:[9,9],NG:[10,10],EG:[10,10],AE:[7,9],SA:[9,9],IL:[9,9]};
var CITY_COORDS = {'Karachi':[24.86,67.01,11],'Lahore':[31.55,74.35,12],'Islamabad':[33.69,73.04,12],'Rawalpindi':[33.6,73.05,12],'Faisalabad':[31.42,73.08,12],'Multan':[30.2,71.45,12],'Peshawar':[34.01,71.58,12],'Quetta':[30.18,66.99,12],'Mumbai':[19.08,72.88,12],'Delhi':[28.61,77.21,12],'Bengaluru':[12.97,77.59,12],'Chennai':[13.08,80.27,12],'Kolkata':[22.57,88.36,12],'Pune':[18.52,73.86,12],'Ahmedabad':[23.02,72.57,12],'Jaipur':[26.91,75.79,12],'Lucknow':[26.85,80.95,12],'New York, NY':[40.71,-74.01,12],'Los Angeles, CA':[34.05,-118.24,11],'Chicago, IL':[41.88,-87.63,12],'Houston, TX':[29.76,-95.37,11],'Phoenix, AZ':[33.45,-112.07,11],'Dallas, TX':[32.78,-96.8,12],'Miami, FL':[25.76,-80.19,12],'San Francisco, CA':[37.77,-122.42,13],'Seattle, WA':[47.61,-122.33,12],'Boston, MA':[42.36,-71.06,13],'London':[51.51,-0.13,12],'Manchester':[53.48,-2.24,12],'Birmingham':[52.49,-1.9,12],'Berlin':[52.52,13.41,12],'Munich':[48.14,11.58,12],'Hamburg':[53.55,9.99,12],'Paris':[48.86,2.35,12],'Dubai':[25.2,55.27,12],'Riyadh':[24.69,46.72,11],'Tokyo':[35.68,139.69,11],'Sydney':[-33.87,151.21,12],'Toronto':[43.65,-79.38,12],'São Paulo':[-23.55,-46.63,11],'Mexico City':[19.43,-99.13,11],'Istanbul':[41.01,28.98,11],'Cairo':[30.04,31.24,11],'Lagos':[6.45,3.4,12],'Johannesburg':[-26.2,28.04,12],'Rome':[41.9,12.5,12],'Madrid':[40.42,-3.7,12],'Amsterdam':[52.37,4.9,13],'Jakarta':[-6.21,106.85,11],'Seoul':[37.57,126.98,12],'Singapore':[1.35,103.82,12]};

function resolveCarrierAndCity(country, digits) {
  var code = country.code, carrier = null, prefixes = CARRIER_PREFIXES[code];
  if (prefixes) { var best = null; for (var e = 0; e < prefixes.length; e++) { for (var p = 0; p < prefixes[e].p.length; p++) { var pfx = prefixes[e].p[p]; if (digits.startsWith(pfx) && (!best || pfx.length > best.len)) best = { name: prefixes[e].name, len: pfx.length }; } } if (best) carrier = best.name; }
  if (!carrier) { var s = digits.split('').reduce(function(a,c){return a+c.charCodeAt(0);},0); carrier = country.carriers[s % country.carriers.length]; }
  var pool = CITY_POOLS[code], city;
  if (pool && pool.length) { var s2 = digits.split('').reduce(function(a,c,i){return a+c.charCodeAt(0)*(i+7);},0); city = pool[s2 % pool.length]; }
  else city = country.capital;
  return { carrier: carrier, city: city };
}

// ─── Feature card illustration builder ─────────────────────
function FeatureIcon(props) {
  var type = props.type;
  var ac = C.accent, al = C.accentLight, skin = '#F5D0A9', dark = '#232323';
  if (type === 'realtime') return (<svg viewBox="0 0 140 120" width="100%" height="100%"><rect width="140" height="120" rx="8" fill={al}/><rect x="5" y="55" width="12" height="30" fill="#d4e8dc"/><rect x="19" y="45" width="10" height="40" fill="#c8e0d0"/><rect x="110" y="48" width="12" height="37" fill="#d4e8dc"/><rect x="124" y="52" width="10" height="33" fill="#c8e0d0"/><rect x="0" y="85" width="140" height="35" fill="#d4e8dc"/><rect x="4" y="68" width="28" height="16" rx="3" fill={ac}/><rect x="6" y="70" width="8" height="7" rx="1" fill="#fff"/><rect x="16" y="70" width="8" height="7" rx="1" fill="#fff"/><circle cx="10" cy="86" r="3" fill={dark}/><circle cx="26" cy="86" r="3" fill={dark}/><rect x="52" y="18" width="38" height="72" rx="5" fill={dark}/><rect x="55" y="24" width="32" height="58" rx="2" fill="#e8f0e8"/><path d="M55,40 Q65,35 71,42 T87,38" stroke={ac} strokeWidth="1.5" fill="none" opacity="0.4"/><ellipse cx="71" cy="58" rx="4" ry="1.5" fill={ac} opacity="0.25"/><path d="M71,42 C65,42 62,47 62,51 C62,56 71,62 71,62 C71,62 80,56 80,51 C80,47 77,42 71,42Z" fill={ac}/><circle cx="71" cy="50" r="3" fill="#fff"/><circle cx="108" cy="52" r="7" fill={skin}/><ellipse cx="108" cy="44" rx="7" ry="5" fill={dark}/><rect x="102" y="59" width="12" height="20" rx="3" fill={ac}/><rect x="101" y="79" width="6" height="10" rx="2" fill={dark}/><rect x="109" y="79" width="6" height="10" rx="2" fill={dark}/><path d="M102,63 L92,50 L90,52 L100,65" fill={skin}/></svg>);
  if (type === 'history') return (<svg viewBox="0 0 140 120" width="100%" height="100%"><rect width="140" height="120" rx="8" fill={al}/><rect x="35" y="8" width="70" height="104" rx="8" fill={dark}/><rect x="39" y="16" width="62" height="86" rx="3" fill="#eef4ee"/><rect x="39" y="16" width="62" height="14" rx="3" fill={ac}/><text x="70" y="27" textAnchor="middle" fill="#fff" fontSize="7" fontFamily="sans-serif" fontWeight="bold">Last Week</text><path d="M50,50 L62,65 L78,45 L88,75 L72,88" stroke={ac} strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="4,2"/><circle cx="50" cy="50" r="4" fill={ac}/><circle cx="50" cy="50" r="2" fill="#fff"/><circle cx="62" cy="65" r="4" fill={ac}/><circle cx="62" cy="65" r="2" fill="#fff"/><circle cx="78" cy="45" r="4" fill={ac}/><circle cx="78" cy="45" r="2" fill="#fff"/><circle cx="88" cy="75" r="4" fill={ac}/><circle cx="88" cy="75" r="2" fill="#fff"/><path d="M72,80 C68,80 66,83 66,85 C66,88 72,93 72,93 C72,93 78,88 78,85 C78,83 76,80 72,80Z" fill={ac}/><circle cx="72" cy="84" r="2" fill="#fff"/></svg>);
  if (type === 'alerts') return (<svg viewBox="0 0 140 120" width="100%" height="100%"><rect width="140" height="120" rx="8" fill={al}/><circle cx="26" cy="42" r="8" fill={skin}/><ellipse cx="26" cy="36" rx="8" ry="6" fill={dark}/><rect x="19" y="50" width="14" height="24" rx="3" fill={ac}/><rect x="18" y="74" width="7" height="14" rx="2" fill={dark}/><rect x="27" y="74" width="7" height="14" rx="2" fill={dark}/><rect x="36" y="56" width="12" height="16" rx="2" fill="#FFD700"/><path d="M39,56 L39,52 Q42,49 45,52 L45,56" stroke={dark} strokeWidth="1" fill="none"/><rect x="58" y="12" width="42" height="78" rx="6" fill={dark}/><rect x="62" y="19" width="34" height="64" rx="2" fill="#eef4ee"/><path d="M79,40 C75,40 73,44 73,46 C73,50 79,55 79,55 C79,55 85,50 85,46 C85,44 83,40 79,40Z" fill={ac}/><circle cx="79" cy="45" r="2.5" fill="#fff"/><circle cx="79" cy="48" r="14" stroke={ac} strokeWidth="1" fill={ac} fillOpacity="0.08" strokeDasharray="3,2"/><rect x="56" y="88" width="48" height="22" rx="4" fill="#fff" stroke={ac} strokeWidth="1.5"/><text x="80" y="98" textAnchor="middle" fill={dark} fontSize="4.5" fontFamily="sans-serif" fontWeight="bold">Jim arrived</text><text x="80" y="104" textAnchor="middle" fill={ac} fontSize="4" fontFamily="sans-serif">at work</text></svg>);
  if (type === 'ar') return (<svg viewBox="0 0 140 120" width="100%" height="100%"><rect width="140" height="120" rx="8" fill={al}/><path d="M30,115 Q20,105 22,90 L28,60 Q30,55 34,58 L36,70 L38,55 Q40,50 44,54 L44,68 L46,52 Q48,48 52,52 L52,70 L54,56 Q56,52 60,56 L58,80 Q56,95 48,105 Q42,115 30,115Z" fill={skin} stroke="#D4A574" strokeWidth="0.8"/><rect x="42" y="10" width="58" height="85" rx="6" fill={dark}/><rect x="46" y="16" width="50" height="72" rx="3" fill="#1a1a2e"/><rect x="48" y="48" width="8" height="40" fill="#2a2a4a"/><rect x="58" y="38" width="10" height="50" fill="#333355"/><rect x="70" y="44" width="12" height="44" fill="#2a2a4a"/><rect x="84" y="52" width="10" height="36" fill="#333355"/><path d="M55,30 C53,30 52,32 52,33 C52,35 55,38 55,38 C55,38 58,35 58,33 C58,32 57,30 55,30Z" fill={ac}/><circle cx="55" cy="32.5" r="1.5" fill="#fff"/><path d="M78,26 C76,26 75,28 75,29 C75,31 78,34 78,34 C78,34 81,31 81,29 C81,28 80,26 78,26Z" fill={ac}/><circle cx="78" cy="28.5" r="1.5" fill="#fff"/><path d="M90,34 C88,34 87,36 87,37 C87,39 90,42 90,42 C90,42 93,39 93,37 C93,36 92,34 90,34Z" fill={ac}/><circle cx="90" cy="36.5" r="1.5" fill="#fff"/><rect x="48" y="52" width="3" height="3" fill="#FFD700" opacity="0.6"/><rect x="60" y="42" width="3" height="3" fill="#FFD700" opacity="0.5"/><rect x="72" y="48" width="3" height="3" fill="#FFD700" opacity="0.5"/><rect x="86" y="56" width="3" height="3" fill="#FFD700" opacity="0.4"/></svg>);
  if (type === 'sos') return (<svg viewBox="0 0 140 120" width="100%" height="100%"><rect width="140" height="120" rx="8" fill={al}/><circle cx="38" cy="28" r="9" fill={skin}/><ellipse cx="38" cy="22" rx="9" ry="6" fill={dark}/><circle cx="36" cy="28" r="1" fill={dark}/><circle cx="41" cy="28" r="1" fill={dark}/><rect x="28" y="37" width="20" height="28" rx="4" fill={ac}/><rect x="28" y="65" width="9" height="20" rx="3" fill={dark}/><rect x="39" y="65" width="9" height="20" rx="3" fill={dark}/><path d="M48,42 L56,38 L58,42 L50,46" fill={skin}/><rect x="54" y="30" width="10" height="16" rx="2" fill={dark}/><rect x="55.5" y="32" width="7" height="11" rx="1" fill="#fff"/><circle cx="59" cy="37" r="2.5" fill="#ff3b30"/><rect x="72" y="18" width="56" height="50" rx="6" fill="#fff" stroke="#ff3b30" strokeWidth="2"/><rect x="72" y="18" width="56" height="14" rx="6" fill="#ff3b30"/><rect x="72" y="26" width="56" height="6" fill="#ff3b30"/><polygon points="100,22 96,30 104,30" fill="#FFD700" stroke={dark} strokeWidth="0.8"/><text x="100" y="44" textAnchor="middle" fill="#ff3b30" fontSize="12" fontFamily="sans-serif" fontWeight="bold">Help!</text><ellipse cx="18" cy="92" rx="8" ry="5" fill="#D4A574"/><circle cx="12" cy="88" r="4" fill="#D4A574"/><circle cx="11" cy="87" r="1" fill={dark}/></svg>);
  if (type === 'fall') return (<svg viewBox="0 0 140 120" width="100%" height="100%"><rect width="140" height="120" rx="8" fill={al}/><rect x="0" y="95" width="140" height="25" fill="#d4e8dc"/><path d="M35,40 Q35,30 50,28 Q80,26 90,28 Q105,30 105,40 L105,85 L35,85 Z" fill={ac}/><path d="M42,40 Q42,35 50,34 Q80,32 88,34 Q98,35 98,40 L98,75 L42,75 Z" fill="#15704a"/><rect x="38" y="72" width="64" height="14" rx="4" fill={ac}/><rect x="28" y="42" width="12" height="38" rx="5" fill={ac}/><rect x="100" y="42" width="12" height="38" rx="5" fill={ac}/><rect x="36" y="86" width="6" height="10" rx="2" fill={dark}/><rect x="98" y="86" width="6" height="10" rx="2" fill={dark}/><circle cx="62" cy="46" r="10" fill={skin}/><ellipse cx="62" cy="39" rx="10" ry="7" fill="#999"/><circle cx="59" cy="46" r="3" stroke={dark} strokeWidth="0.8" fill="none"/><circle cx="66" cy="46" r="3" stroke={dark} strokeWidth="0.8" fill="none"/><line x1="62" y1="46" x2="63" y2="46" stroke={dark} strokeWidth="0.8"/><path d="M52,56 L48,76 L82,76 L78,56 Z" fill="#666"/><path d="M52,60 L38,72 L40,74 L54,64" fill={skin}/><path d="M76,60 L90,72 L88,74 L74,64" fill={skin}/><rect x="52" y="76" width="8" height="12" rx="2" fill="#555"/><rect x="68" y="76" width="8" height="12" rx="2" fill="#555"/><polygon points="118,20 110,45 116,45 108,72 122,40 116,40 124,20" fill="#FFD700" stroke="#e6c200" strokeWidth="1"/></svg>);
  if (type === 'crash') return (<svg viewBox="0 0 140 120" width="100%" height="100%"><rect width="140" height="120" rx="8" fill={al}/><rect x="0" y="88" width="140" height="32" fill="#d4e8dc"/><path d="M40,60 L42,48 Q50,38 72,38 Q94,38 98,48 L100,60 Z" fill={ac}/><path d="M48,48 L52,42 Q62,38 82,38 Q88,38 92,42 L96,48 Z" fill="#b3e0cc" opacity="0.7"/><rect x="30" y="58" width="80" height="20" rx="4" fill={ac}/><rect x="106" y="62" width="6" height="4" rx="1" fill="#FFD700"/><rect x="28" y="62" width="6" height="4" rx="1" fill="#FFD700"/><circle cx="46" cy="80" r="9" fill={dark}/><circle cx="46" cy="80" r="5" fill="#555"/><circle cx="94" cy="80" r="9" fill={dark}/><circle cx="94" cy="80" r="5" fill="#555"/><path d="M96,48 L108,38 L112,40 L100,52" fill={ac}/><rect x="98" y="50" width="12" height="10" fill="#444"/><circle cx="102" cy="55" r="2" fill="#666"/><circle cx="107" cy="55" r="2" fill="#666"/><circle cx="18" cy="48" r="7" fill={skin}/><ellipse cx="18" cy="43" rx="7" ry="5" fill={dark}/><rect x="12" y="55" width="12" height="20" rx="3" fill="#666"/><rect x="11" y="75" width="6" height="12" rx="2" fill={dark}/><rect x="19" y="75" width="6" height="12" rx="2" fill={dark}/><path d="M24,60 L36,54 L37,57 L26,62" fill={skin}/><ellipse cx="104" cy="38" rx="4" ry="3" fill="#ccc" opacity="0.5"/><ellipse cx="108" cy="32" rx="5" ry="4" fill="#ccc" opacity="0.4"/></svg>);
  if (type === 'wearable') return (<svg viewBox="0 0 140 120" width="100%" height="100%"><rect width="140" height="120" rx="8" fill={al}/><rect x="0" y="100" width="140" height="20" fill="#d4e8dc"/><circle cx="40" cy="30" r="8" fill={skin}/><ellipse cx="40" cy="25" rx="8" ry="5.5" fill={dark}/><path d="M32,38 L48,38 L50,62 L30,62 Z" fill={ac}/><path d="M34,62 L24,80 L28,82 L36,66" fill={dark}/><path d="M44,62 L56,78 L52,80 L42,66" fill={dark}/><rect x="20" y="80" width="10" height="5" rx="2.5" fill={ac}/><rect x="50" y="78" width="10" height="5" rx="2.5" fill={ac}/><path d="M32,42 L20,52 L22,55 L34,46" fill={skin}/><path d="M48,42 L60,36 L62,40 L50,46" fill={skin}/><rect x="58" y="32" width="8" height="10" rx="2" fill={dark}/><rect x="59.5" y="34" width="5" height="6" rx="1" fill={ac}/><circle cx="62" cy="37" r="1.2" fill="#fff"/><circle cx="105" cy="52" r="30" fill={dark}/><circle cx="105" cy="52" r="25" fill="#fff"/><circle cx="105" cy="52" r="22" fill="#eef4ee"/><path d="M105,42 C101,42 99,46 99,48 C99,52 105,58 105,58 C105,58 111,52 111,48 C111,46 109,42 105,42Z" fill={ac}/><circle cx="105" cy="47" r="3" fill="#fff"/><path d="M90,65 L94,65 L96,60 L98,68 L100,63 L102,65 L106,65" stroke={ac} strokeWidth="1" fill="none"/><text x="110" y="66" fill={ac} fontSize="5" fontFamily="sans-serif" fontWeight="bold">72</text><rect x="132" y="48" width="5" height="8" rx="1.5" fill="#444"/><line x1="10" y1="45" x2="18" y2="45" stroke={ac} strokeWidth="1" opacity="0.3"/><line x1="8" y1="52" x2="16" y2="52" stroke={ac} strokeWidth="1" opacity="0.2"/></svg>);
  return null;
}

var FEATURES = [
  {t:'Real-time location',type:'realtime'},{t:'Location history',type:'history'},
  {t:'Place alerts',type:'alerts'},{t:'AR search',type:'ar'},
  {t:'SOS button',type:'sos'},{t:'Fall detection',type:'fall'},
  {t:'Crash & speed control',type:'crash'},{t:'Pair with wearables',type:'wearable'}
];

// ─── Main App ────────────────────────────────────────────────
function App() {
  var cs = useState(window.COUNTRIES[0]), country = cs[0], setCountry = cs[1];
  var ps = useState(''), phone = ps[0], setPhone = ps[1];
  var ss = useState(false), sheetOpen = ss[0], setSheetOpen = ss[1];
  var ms = useState(window.innerWidth < 768), isMobile = ms[0], setIsMobile = ms[1];
  var os = useState(false), searchOverlay = os[0], setSearchOverlay = os[1];
  var rs = useState(false), resultModal = rs[0], setResultModal = rs[1];
  var rps = useState(false), reportPage = rps[0], setReportPage = rps[1];
  var ls = useState({ carrier: '...', city: '', loading: false }), lookup = ls[0], setLookup = ls[1];
  var mts = useState(null), mapTarget = mts[0], setMapTarget = mts[1];
  var ns = useState(new Date()), now = ns[0], setNow = ns[1];

  useEffect(function(){var h=function(){setIsMobile(window.innerWidth<768);};window.addEventListener('resize',h);return function(){window.removeEventListener('resize',h);};}, []);
  useEffect(function(){fetch('/api/geo/detect').then(function(r){return r.json();}).then(function(d){if(d.success&&d.countryCode){var f=window.COUNTRIES.find(function(c){return c.code===d.countryCode;});if(f)setCountry(f);}}).catch(function(){});}, []);
  useEffect(function(){var i=setInterval(function(){setNow(new Date());},1000);return function(){clearInterval(i);};}, []);

  var localTime = useMemo(function(){try{return new Intl.DateTimeFormat('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone:country.tz}).format(now);}catch(e){return '--:--:--';}}, [now, country.tz]);

  var pushStep = function(h){history.pushState({step:h},'','/start#'+h);};
  var clearToHome = function(){setSearchOverlay(false);setResultModal(false);setReportPage(false);};
  useEffect(function(){var onPop=function(){var h=location.hash.replace('#','');if(h==='searching'){setResultModal(false);setReportPage(false);setSearchOverlay(true);}else if(h==='located'){setSearchOverlay(false);setReportPage(false);setResultModal(true);}else if(h==='report'){setSearchOverlay(false);setResultModal(false);setReportPage(true);}else clearToHome();};window.addEventListener('popstate',onPop);if(location.hash)history.replaceState(null,'','/start');return function(){window.removeEventListener('popstate',onPop);};}, []);

  var formatPhone = function(raw){var d=raw.replace(/\D/g,'').slice(0,12);return d.replace(/(.{3})/g,'$1 ').trim();};
  var digits = phone.replace(/\D/g,'');
  var range = PHONE_LENGTHS[country.code]||[7,15];
  var valid = digits.length >= range[0] && digits.length <= range[1];

  var handleLocate = function(){
    if(!valid) return;
    var fallback = resolveCarrierAndCity(country, digits);
    setLookup({carrier:fallback.carrier,city:fallback.city,loading:true});
    setMapTarget(null); setSearchOverlay(true); pushStep('searching');
    var full = country.dial.replace('+','') + digits;
    fetch('/api/lookup/phone?number='+encodeURIComponent(full)).then(function(r){return r.json();}).then(function(d){
      var city = fallback.city;
      if(d.success&&d.valid) setLookup({carrier:d.carrier||fallback.carrier,city:city,loading:false});
      else setLookup({carrier:fallback.carrier,city:city,loading:false});
      var co=CITY_COORDS[city];if(co)setMapTarget({center:[co[0],co[1]],zoom:co[2]});
    }).catch(function(){setLookup({carrier:fallback.carrier,city:fallback.city,loading:false});var co=CITY_COORDS[fallback.city];if(co)setMapTarget({center:[co[0],co[1]],zoom:co[2]});});
  };

  var handleSearchComplete = function(){setSearchOverlay(false);setResultModal(true);history.replaceState({step:'located'},'','/start#located');};
  var handleContinueToReport = function(){setResultModal(false);setReportPage(true);pushStep('report');};

  var PhoneInput = function(){
    return (
      <div style={{width:460,maxWidth:'100%',margin:'0 auto'}}>
        <div style={{position:'relative',width:'100%',height:51,marginTop:16}}>
          <input type="tel" value={phone} maxLength={(PHONE_LENGTHS[country.code]||[7,15])[1]+3}
            onChange={function(e){setPhone(formatPhone(e.target.value));}}
            onKeyDown={function(e){if(e.key==='Enter')handleLocate();}}
            placeholder="Enter phone number"
            style={{width:'100%',height:51,background:C.inputBg,border:'1px solid '+C.inputBorder,borderRadius:12,padding:'14px 16px 14px 90px',fontSize:16,color:C.dark,fontFamily:'Nunito Sans,Avenir,sans-serif',outline:'none'}} />
          <button onClick={function(){setSheetOpen(true);}} style={{position:'absolute',left:12,top:13,height:26,padding:'0 8px',background:C.accentLight,border:'none',borderRadius:4,display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}>
            <span style={{fontSize:18}}>{country.flag}</span>
            <svg width="10" height="7" viewBox="0 0 10 7"><path d="M1 1l4 4 4-4" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <span style={{position:'absolute',left:70,top:16,fontSize:16,color:C.dark,fontWeight:400,pointerEvents:'none'}}>{country.dial}</span>
        </div>
        {phone.length > 0 && !valid && (function(){
          var needed = range[0]===range[1] ? range[0]+' digits' : range[0]+'-'+range[1]+' digits';
          return <div style={{fontSize:12,color:'#dc2626',marginTop:6,textAlign:'center'}}>{needed} required for {country.name} ({digits.length} entered)</div>;
        })()}
        <button onClick={handleLocate} disabled={!valid} style={{width:'100%',height:56,borderRadius:12,border:'none',marginTop:16,background:valid?C.accent:C.accentSoft,color:'#FFFFFF',fontSize:16,fontWeight:600,cursor:valid?'pointer':'not-allowed',fontFamily:'Nunito Sans,Avenir,sans-serif',transition:'background 200ms'}}>Locate</button>
        <div style={{display:'flex',justifyContent:'space-between',gap:8,marginTop:16}}>
          <div style={{flex:1,background:C.accentLight,color:C.accent,fontSize:10,fontWeight:700,borderRadius:4,height:24,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
            <svg width="17" height="16" viewBox="0 0 17 16" fill={C.accent}><path d="M8.5 1L4 3v4c0 3.3 2.7 5.5 4.5 6.2C10.3 12.5 13 10.3 13 7V3L8.5 1z"/></svg>
            100% Confidential
          </div>
          <div style={{flex:1,background:C.accentLight,color:C.accent,fontSize:10,fontWeight:700,borderRadius:4,height:24,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" stroke={C.accent} strokeWidth="1.5"><rect x="3" y="7" width="11" height="7" rx="1.5"/><path d="M5 7V5a3.5 3.5 0 017 0v2"/></svg>
            SSL Secured
          </div>
        </div>
      </div>
    );
  };

  var LaurelBadge = function(){
    var laurel = <svg width="30" height="60" viewBox="0 0 30 60" fill="none"><path d="M15 55c-2-5-4-10-3-16 1-5 4-9 7-13" stroke="#7DD6A8" strokeWidth="1.5" fill="none"/><ellipse cx="10" cy="42" rx="5" ry="3" fill="#7DD6A8" opacity="0.6" transform="rotate(-20 10 42)"/><ellipse cx="8" cy="34" rx="5" ry="3" fill="#7DD6A8" opacity="0.7" transform="rotate(-30 8 34)"/><ellipse cx="9" cy="26" rx="4.5" ry="2.8" fill="#7DD6A8" opacity="0.8" transform="rotate(-40 9 26)"/><ellipse cx="12" cy="19" rx="4" ry="2.5" fill="#7DD6A8" opacity="0.9" transform="rotate(-50 12 19)"/><ellipse cx="16" cy="14" rx="3.5" ry="2.2" fill="#7DD6A8" transform="rotate(-60 16 14)"/></svg>;
    return (<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:60}}><div style={{transform:'scaleX(-1)'}}>{laurel}</div><div style={{textAlign:'center',padding:'0 4px'}}><div style={{color:C.accent,fontSize:24,fontWeight:700,lineHeight:'1.1'}}>25+ million users</div><div style={{color:C.gray,fontSize:18,fontWeight:600}}>have trusted us</div></div>{laurel}</div>);
  };

  var pills = [
    {l:'iOS',icon:<svg width="16" height="16" viewBox="0 0 16 16" fill={C.mid}><path d="M12.1 8.4c0-1.7 1.3-2.5 1.4-2.5-.8-1.1-2-1.3-2.4-1.3-1-.1-2 .6-2.5.6-.5 0-1.3-.6-2.2-.6-1.1 0-2.2.7-2.8 1.7-1.2 2-.3 5 .8 6.7.6.8 1.2 1.7 2.1 1.6.8 0 1.2-.5 2.2-.5s1.3.5 2.2.5c.9 0 1.5-.8 2-1.6.6-.9.9-1.8.9-1.9 0 0-1.7-.7-1.7-2.7zm-1.7-5c.5-.6.8-1.3.7-2.1-.7 0-1.5.5-2 1-.4.5-.8 1.2-.7 2 .8.1 1.5-.3 2-1z"/></svg>},
    {l:'Android',icon:<svg width="16" height="16" viewBox="0 0 16 16" fill={C.mid}><path d="M4 7.3v4.5h8v-4.5H4zM2.3 7.6c-.5 0-.9.4-.9.9v2.6c0 .5.4.9.9.9s.9-.4.9-.9V8.5c0-.5-.4-.9-.9-.9zm11.4 0c-.5 0-.9.4-.9.9v2.6c0 .5.4.9.9.9s.9-.4.9-.9V8.5c0-.5-.4-.9-.9-.9zM5.2 12.6v2.4c0 .5.4.9.9.9s.9-.4.9-.9v-2.4h2v2.4c0 .5.4.9.9.9s.9-.4.9-.9v-2.4H5.2z"/></svg>},
    {l:'All devices',icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={C.mid} strokeWidth="1.2"><rect x="1" y="3" width="8" height="6" rx="0.8"/><rect x="9.5" y="5" width="5" height="8" rx="0.8"/></svg>},
    {l:'Any network',icon:<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={C.mid} strokeWidth="1.2" strokeLinecap="round"><circle cx="8" cy="8" r="5.5"/><path d="M2.5 8h11M8 2.5c-2 2-2 9 0 11M8 2.5c2 2 2 9 0 11"/></svg>}
  ];

  return (
    <div style={{minHeight:'100vh',background:'#FFFFFF',fontFamily:'Nunito Sans,Avenir,sans-serif',color:C.dark}}>

      {/* NAV */}
      <nav style={{display:'flex',alignItems:'center',justifyContent:'center',height:46,padding:'11px 0'}}>
        <TracifyLogo size={20} accent={C.accent} />
      </nav>

      {/* HERO */}
      <div style={{maxWidth:960,margin:'0 auto',padding:isMobile?'20px 16px':'20px 0',position:'relative',minHeight:isMobile?'auto':408}}>
        <div style={{width:isMobile?'100%':460,textAlign:'center'}}>
          <LaurelBadge />
          <h1 style={{fontSize:36,fontWeight:700,lineHeight:'48px',color:C.dark,margin:'8px 0 0'}}>Locate Any Phone Anywhere</h1>
          <p style={{fontSize:16,fontWeight:400,lineHeight:'24px',color:C.dark,margin:'8px 0 0'}}>Enter the number you want to track</p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'nowrap',marginTop:16}}>
            {pills.map(function(p){return <div key={p.l} style={{display:'flex',alignItems:'center',gap:2,borderRadius:1000,padding:'2px 6px',height:25,boxShadow:'inset 0 0 0 1px '+C.muted,fontSize:16,fontWeight:400,color:C.mid}}>{p.icon} {p.l}</div>;})}
          </div>
          <PhoneInput />
        </div>
        {!isMobile && <div style={{position:'absolute',left:500,top:0,width:460,height:408}}><HeroImage /></div>}
        {isMobile && <div style={{marginTop:24}}><HeroImage /></div>}
      </div>

      {/* WHAT YOU GET — with real SVG illustrations */}
      <div style={{maxWidth:960,margin:'80px auto 0',padding:isMobile?'0 16px':'0'}}>
        <h2 style={{fontSize:36,fontWeight:700,lineHeight:'48px',color:C.dark,textAlign:'center'}}>What you get</h2>
        <div style={{display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center',marginTop:16}}>
          {FEATURES.map(function(f){
            return (
              <div key={f.t} style={{width:isMobile?'calc(50% - 6px)':230,height:180,borderRadius:16,background:C.accentLight,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',padding:'0 5px 8px',overflow:'hidden'}}>
                <div style={{flex:1,width:'100%',padding:'8px 4px 0',display:'flex',alignItems:'center',justifyContent:'center'}}><FeatureIcon type={f.type} /></div>
                <div style={{fontSize:16,fontWeight:700,color:C.dark,textAlign:'center',lineHeight:'16px'}}>{f.t}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OUR TECHNOLOGIES */}
      <div style={{maxWidth:960,margin:'80px auto 0',padding:isMobile?'0 16px':'0'}}>
        <h2 style={{fontSize:36,fontWeight:700,lineHeight:'48px',color:C.dark,textAlign:'center'}}>Our technologies</h2>
        <div style={{display:'flex',flexDirection:isMobile?'column':'row',gap:12,marginTop:16}}>
          {[
            {t:'Precise GPS tracking',icon:<svg width="120" height="120" viewBox="0 0 120 120"><rect x="10" y="10" width="100" height="100" rx="16" fill="#fff" stroke={C.accent} strokeWidth="2"/><circle cx="60" cy="55" r="8" fill={C.accent}/><path d="M60 47c-4.5 0-8 3.5-8 8 0 5 8 12 8 12s8-7 8-12c0-4.5-3.5-8-8-8z" fill={C.accent}/><circle cx="60" cy="55" r="3" fill="#fff"/><path d="M35 85l15-20M85 85l-15-20M40 35l10 15M80 35l-10 15" stroke={C.accent} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/><circle cx="35" cy="85" r="4" fill={C.accent} opacity="0.4"/><circle cx="85" cy="85" r="4" fill={C.accent} opacity="0.4"/><circle cx="40" cy="35" r="4" fill={C.accent} opacity="0.4"/><circle cx="80" cy="35" r="4" fill={C.accent} opacity="0.4"/></svg>},
            {t:'Modern ML algorithms',icon:<svg width="120" height="120" viewBox="0 0 120 120"><rect x="10" y="10" width="100" height="100" rx="16" fill="#fff" stroke={C.accent} strokeWidth="2"/><ellipse cx="60" cy="60" rx="22" ry="18" fill={C.accent} opacity="0.15"/><rect x="50" y="52" width="20" height="16" rx="3" fill={C.accent} opacity="0.2"/><text x="60" y="64" textAnchor="middle" fill={C.accent} fontSize="13" fontWeight="700" fontFamily="Nunito Sans">AI</text><circle cx="30" cy="40" r="4" fill={C.accent} opacity="0.3"/><circle cx="90" cy="40" r="4" fill={C.accent} opacity="0.3"/><circle cx="30" cy="80" r="4" fill={C.accent} opacity="0.3"/><circle cx="90" cy="80" r="4" fill={C.accent} opacity="0.3"/><line x1="34" y1="42" x2="46" y2="52" stroke={C.accent} strokeWidth="1" opacity="0.3"/><line x1="86" y1="42" x2="74" y2="52" stroke={C.accent} strokeWidth="1" opacity="0.3"/><line x1="34" y1="78" x2="46" y2="68" stroke={C.accent} strokeWidth="1" opacity="0.3"/><line x1="86" y1="78" x2="74" y2="68" stroke={C.accent} strokeWidth="1" opacity="0.3"/></svg>},
            {t:'Wide range of IoT devices',icon:<svg width="120" height="120" viewBox="0 0 120 120"><rect x="10" y="10" width="100" height="100" rx="16" fill="#fff" stroke={C.accent} strokeWidth="2"/><circle cx="60" cy="60" r="10" fill={C.accent}/><path d="M56 52a6 6 0 018 0M53 48a10 10 0 0114 0" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><circle cx="60" cy="30" r="6" stroke={C.accent} strokeWidth="2" fill="none"/><circle cx="60" cy="90" r="6" stroke={C.accent} strokeWidth="2" fill="none"/><circle cx="30" cy="60" r="6" stroke={C.accent} strokeWidth="2" fill="none"/><circle cx="90" cy="60" r="6" stroke={C.accent} strokeWidth="2" fill="none"/><line x1="60" y1="36" x2="60" y2="50" stroke={C.accent} strokeWidth="1.5"/><line x1="60" y1="70" x2="60" y2="84" stroke={C.accent} strokeWidth="1.5"/><line x1="36" y1="60" x2="50" y2="60" stroke={C.accent} strokeWidth="1.5"/><line x1="70" y1="60" x2="84" y2="60" stroke={C.accent} strokeWidth="1.5"/></svg>}
          ].map(function(t){
            return (<div key={t.t} style={{flex:isMobile?'none':'1',height:238,borderRadius:8,background:C.accentLight,padding:24,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>{t.icon}<div style={{fontSize:18,fontWeight:600,color:C.dark,textAlign:'center',marginTop:8}}>{t.t}</div></div>);
          })}
        </div>
        <div style={{textAlign:'center',marginTop:24}}><button onClick={function(){window.scrollTo({top:0,behavior:'smooth'});}} style={{width:isMobile?'100%':400,height:56,borderRadius:12,border:'none',background:C.accent,color:'#fff',fontSize:16,fontWeight:600,cursor:'pointer'}}>Try Tracify Now</button></div>
      </div>

      {/* WHAT OTHERS WRITE */}
      <div style={{background:C.pressBg,padding:'48px 16px',marginTop:80}}>
        <div style={{maxWidth:960,margin:'0 auto',textAlign:'center'}}>
          <h2 style={{fontSize:36,fontWeight:700,color:C.dark}}>What others write about us</h2>
          <div style={{background:'#fff',borderRadius:12,padding:16,width:isMobile?'100%':400,margin:'24px auto 0',boxShadow:'0 0 20px rgba(0,0,0,0.12)',textAlign:'center'}}>
            <div style={{fontSize:32,color:C.accent,lineHeight:1,marginBottom:8}}>{"\u201C"}</div>
            <p style={{fontSize:14,fontWeight:750,color:C.dark,textAlign:'center',lineHeight:'22px',margin:0}}>The Verge reports that Tracify will help you keep your loved ones safe by knowing where they are and coming to their aid if necessary.</p>
            <div style={{marginTop:12}}><svg width="93" height="28" viewBox="0 0 93 50"><polygon points="46.5,2 26,32 67,32" fill="#FF3B30"/><polygon points="30,32 20,32 36,8" fill="#007AFF"/><polygon points="63,32 73,32 57,8" fill="#FF9500"/><text x="46.5" y="45" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="9" fontWeight="bold" fill="#FF9500" letterSpacing="3">THE VERGE</text></svg></div>
          </div>
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:isMobile?24:48,marginTop:24,flexWrap:'wrap'}}>
            <svg width="72" height="30" viewBox="0 0 72 30"><circle cx="15" cy="15" r="14" fill="#E00707"/><text x="15" y="20" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="11" fontWeight="bold" fill="#FFF">c|net</text></svg>
            <svg width="180" height="24" viewBox="0 0 200 30"><text x="100" y="22" textAnchor="middle" fontFamily="'Times New Roman',Georgia,serif" fontSize="16" fontWeight="bold" fill="#000">The New York Times</text></svg>
            <svg width="93" height="28" viewBox="0 0 93 50"><polygon points="46.5,2 26,32 67,32" fill="#FF3B30"/><polygon points="30,32 20,32 36,8" fill="#007AFF"/><polygon points="63,32 73,32 57,8" fill="#FF9500"/><text x="46.5" y="45" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="9" fontWeight="bold" fill="#FF9500" letterSpacing="3">THE VERGE</text></svg>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{maxWidth:960,margin:'80px auto 0',padding:isMobile?'0 16px':'0'}}>
        <h2 style={{fontSize:36,fontWeight:700,color:C.dark,textAlign:'center'}}>How it works</h2>
        <div style={{display:'flex',flexDirection:isMobile?'column':'row',gap:isMobile?20:0,padding:'24px 0 0',justifyContent:'space-between'}}>
          {[{n:'1',t:'Verify the number',d:'Enter the phone number you want to verify. This information is private and unavailable for third parties.'},{n:'2',t:'Send a location request',d:'The recipient receives an sms to give consent to share their location. Location sharing is on, keeping you connected with your loved ones.'},{n:'3',t:'Receive the location',d:'You will be notified and able to view the exact location on the map. Available in real time to keep in touch with your loved ones.'}].map(function(s){
            return (<div key={s.n} style={{display:'flex',gap:16,width:isMobile?'100%':254,padding:'0 0 24px'}}><div style={{width:48,height:48,borderRadius:8,background:C.accentLight,border:'1px solid '+C.accentBorder,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:600,color:C.accent,flexShrink:0}}>{s.n}</div><div><div style={{fontSize:18,fontWeight:600,color:C.dark}}>{s.t}</div><div style={{fontSize:12,fontWeight:400,color:C.muted,marginTop:4,lineHeight:'18px'}}>{s.d}</div></div></div>);
          })}
        </div>
        <div style={{textAlign:'center',marginTop:24}}><button onClick={function(){window.scrollTo({top:0,behavior:'smooth'});}} style={{width:isMobile?'100%':400,height:56,borderRadius:12,border:'none',background:C.accent,color:'#fff',fontSize:16,fontWeight:600,cursor:'pointer'}}>Try Tracify Now</button></div>
      </div>

      {/* REVIEWS — with face avatars and proper store logos */}
      <div style={{maxWidth:960,margin:'80px auto 0',padding:isMobile?'0 16px':'0'}}>
        <LaurelBadge />
        <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:16,flexWrap:'wrap'}}>
          {[{store:'App Store',rating:'4.6',count:'36.9K Ratings',logo:<svg width="90" height="20" viewBox="0 0 90 20"><path d="M7.5 3.5c.5-.6.8-1.3.7-2.1C7.5 1.4 6.7 2 6.2 2.5c-.4.5-.8 1.2-.7 2 .7.1 1.5-.3 2-1zM9.5 5c-1.2 0-2.2.7-2.8.7-.6 0-1.5-.7-2.5-.7C2.8 5 1.5 5.8.9 7.1c-1.2 2.4-.3 6 .9 8 .6.9 1.3 1.8 2.2 1.8.9 0 1.2-.6 2.3-.6 1.1 0 1.3.6 2.3.6.9 0 1.6-.9 2.2-1.8.7-1 1-2 1-2 0 0-1.9-.8-1.9-3 0-2 1.5-2.9 1.6-3C10.4 5.7 9 5 9.5 5z" fill="#000" transform="translate(0,1)"/><text x="20" y="14" fontFamily="Arial,sans-serif" fontSize="10" fill="#000" fontWeight="500">App Store</text></svg>},
          {store:'Google Play',rating:'4.5',count:'412K Ratings',logo:<svg width="90" height="20" viewBox="0 0 90 20"><path d="M2 1L10 10 2 19Z" fill="#34A853"/><path d="M2 1L10 10 14 7.5 6 1Z" fill="#4285F4"/><path d="M2 19L10 10 14 12.5 6 19Z" fill="#EA4335"/><path d="M14 7.5L10 10 14 12.5 16 11C17 10.3 17 9.7 16 9Z" fill="#FBBC05"/><text x="22" y="14" fontFamily="Arial,sans-serif" fontSize="10" fill="#000" fontWeight="500">Google Play</text></svg>}
          ].map(function(s){
            return (<div key={s.store} style={{display:'flex',alignItems:'center',gap:10,background:C.ratingBg,border:'1px solid '+C.ratingBorder,borderRadius:12,padding:'0 16px',height:46,width:isMobile?'100%':474}}>{s.logo}<span style={{fontSize:14,fontWeight:400,color:C.mid,marginLeft:4}}>{s.rating}</span><div style={{display:'flex',gap:1}}>{[0,1,2,3,4].map(function(i){return <svg key={i} width="14" height="14" viewBox="0 0 20 20"><path d="M10 1l2.5 6 6.5.6-5 4.5 1.5 6.5L10 15l-5.5 3.6L6 12.1 1 7.6 7.5 7z" fill="#FFB800"/></svg>;})}</div><span style={{fontSize:14,fontWeight:600,color:C.mid,marginLeft:'auto'}}>{s.count}</span></div>);
          })}
        </div>
        <div style={{display:'flex',flexDirection:isMobile?'column':'row',justifyContent:'space-between',gap:12,marginTop:16}}>
          {[
            {n:'Kevin Peters',platform:'iOS',t:'Great app',q:'Great app for keeping up with teens that are always on the move between sports, school and friends. I\'ve been using the app for 3 weeks; it works flawlessly.',avatar:<svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="15" fill="#E8F5EE"/><circle cx="15" cy="13" r="9" fill="#F5D0A9"/><rect x="6" y="4" width="18" height="6" rx="2" fill="#6B4226"/><path d="M6 7L6 10" stroke="#6B4226" strokeWidth="1.5"/><path d="M24 7L24 10" stroke="#6B4226" strokeWidth="1.5"/><rect x="9" y="11" width="5" height="3" rx="1.5" fill="none" stroke="#555" strokeWidth="0.7"/><rect x="16" y="11" width="5" height="3" rx="1.5" fill="none" stroke="#555" strokeWidth="0.7"/><line x1="14" y1="12.5" x2="16" y2="12.5" stroke="#555" strokeWidth="0.7"/><circle cx="11.5" cy="12.5" r="1" fill="#4A3728"/><circle cx="18.5" cy="12.5" r="1" fill="#4A3728"/><path d="M12 19 Q15 21 18 19" fill="none" stroke="#C47A5A" strokeWidth="0.8" strokeLinecap="round"/><path d="M5 24 C5 20 10 18 15 18 C20 18 25 20 25 24L25 30 5 30Z" fill="#3B82F6"/></svg>},
            {n:'John Lee',platform:'Play',t:'Perfect for Android & iPhone',q:'I have dementia in the early stages :( This will help my family in the future.',avatar:<svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="15" fill="#E8F5EE"/><circle cx="15" cy="13" r="9" fill="#F0D5A8"/><rect x="6" y="3" width="18" height="6" rx="2" fill="#1A1A1A"/><path d="M6 6L6 9" stroke="#1A1A1A" strokeWidth="1.5"/><path d="M24 6L24 9" stroke="#1A1A1A" strokeWidth="1.5"/><ellipse cx="11" cy="12" rx="1.8" ry="1.2" fill="#FFF"/><ellipse cx="19" cy="12" rx="1.8" ry="1.2" fill="#FFF"/><circle cx="11.2" cy="12" r="1" fill="#2C1810"/><circle cx="19.2" cy="12" r="1" fill="#2C1810"/><path d="M12.5 18 Q15 20.5 17.5 18" fill="none" stroke="#C47A5A" strokeWidth="0.8" strokeLinecap="round"/><path d="M5 24 C5 20 10 18 15 18 C20 18 25 20 25 24L25 30 5 30Z" fill="#10B981"/></svg>},
            {n:'Megan Smith',platform:'Play',t:'Super useful!',q:'Useful for parents to keep tabs on minors and elderly family members... Displaying physical addresses at each tracking location along a route is impressive...',avatar:<svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="15" fill="#E8F5EE"/><circle cx="15" cy="13" r="9" fill="#D4A574"/><ellipse cx="15" cy="5" rx="11" ry="6" fill="#2C1810"/><circle cx="8" cy="6" r="2.5" fill="#2C1810"/><circle cx="22" cy="6" r="2.5" fill="#2C1810"/><circle cx="7" cy="10" r="2" fill="#2C1810"/><circle cx="23" cy="10" r="2" fill="#2C1810"/><ellipse cx="11" cy="12" rx="1.8" ry="1.5" fill="#FFF"/><ellipse cx="19" cy="12" rx="1.8" ry="1.5" fill="#FFF"/><circle cx="11.2" cy="12.2" r="1" fill="#3D2514"/><circle cx="19.2" cy="12.2" r="1" fill="#3D2514"/><path d="M12 18 Q15 21 18 18" fill="#C0504D" stroke="#A0403A" strokeWidth="0.4"/><path d="M5 24 C5 20 10 18 15 18 C20 18 25 20 25 24L25 30 5 30Z" fill="#EC4899"/></svg>}
          ].map(function(r){
            return (<div key={r.n} style={{background:C.cardBg,border:'1px solid '+C.cardBorder,borderRadius:12,padding:'12px 16px',width:isMobile?'100%':312,minHeight:181}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>{r.avatar}<span style={{fontSize:14,fontWeight:500,color:C.mid}}>{r.n}</span><span style={{background:'#E9E9E9',color:C.muted,fontSize:8,fontWeight:600,borderRadius:2,padding:'2px 4px',marginLeft:'auto'}}>{r.platform}</span></div><div style={{fontSize:14,fontWeight:700,color:C.mid,marginBottom:4}}>{r.t}</div><p style={{fontSize:14,fontWeight:400,color:C.mid,lineHeight:'20px',margin:0}}>{r.q}</p></div>);
          })}
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div style={{maxWidth:960,margin:'60px auto',padding:isMobile?'0 16px':'0'}}>
        <div style={{background:C.ctaBg,border:'1px solid '+C.accent,borderRadius:12,padding:'32px 0',textAlign:'center'}}>
          <h2 style={{fontSize:36,fontWeight:700,lineHeight:'48px',color:C.dark}}>Find Location<br/>by Phone Number</h2>
          <p style={{fontSize:16,fontWeight:400,color:C.dark,margin:'8px 0 0'}}>Enter the number you want to track</p>
          <PhoneInput />
        </div>
      </div>

      {/* FOOTER with social icons */}
      <div style={{background:C.pressBg,padding:'24px 16px',textAlign:'center'}}>
        <div style={{display:'flex',justifyContent:'center',gap:24,marginBottom:16}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" fill="#848484"/></svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 4l6.5 8L4 20h2l5.5-6.8L16 20h4l-6.8-8.5L19.5 4h-2l-5 6.2L8 4H4zm3 1.5h2l8 13h-2l-8-13z" fill="#848484"/></svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="#848484" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="#848484" strokeWidth="2" fill="none"/><circle cx="18" cy="6" r="1.5" fill="#848484"/></svg>
        </div>
        <div style={{marginBottom:8}}><TracifyLogo size={16} accent={C.accent} /></div>
        <div style={{fontSize:12,color:C.gray,marginBottom:8}}>Copyright © 2026 Tracify. All rights reserved.</div>
        <div style={{display:'flex',justifyContent:'center',gap:12}}>
          <a href="/privacy" style={{fontSize:12,color:C.gray,textDecoration:'underline'}}>Privacy</a>
          <a href="/terms" style={{fontSize:12,color:C.gray,textDecoration:'underline'}}>Terms</a>
          <a href="/contact" style={{fontSize:12,color:C.gray,textDecoration:'underline'}}>Contact</a>
        </div>
      </div>

      {/* OVERLAYS */}
      {sheetOpen && <CountrySheet countries={window.COUNTRIES} selectedCode={country.code} onSelect={setCountry} onClose={function(){setSheetOpen(false);}} />}
      {searchOverlay && <SearchingOverlay country={country} phone={phone} carrier={lookup.carrier} mapTarget={mapTarget} onComplete={handleSearchComplete} onClose={function(){history.back();}} />}
      <LocatedModal open={resultModal} onClose={function(){history.back();}} onContinue={handleContinueToReport} country={country} phoneDisplay={phone||'--- --- ----'} carrier={lookup.carrier} city={lookup.city} localTime={localTime} tzSign={country.tzOffset>=0?'+':''} />
      {reportPage && <ReportPage onBack={function(){history.back();}} country={country} phone={phone} carrier={lookup.carrier} city={lookup.city} />}
    </div>
  );
}

// ─── Hero Image with detailed city scene ─────────────────────
function HeroImage() {
  var m = window.innerWidth < 768;
  return (
    <div style={{width:'100%',height:m?300:408,borderRadius:12,overflow:'hidden',position:'relative',background:'#0f0f1e'}}>
      <svg viewBox="0 0 460 408" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d0d1e"/><stop offset="100%" stopColor="#1a1a2e"/></linearGradient>
          <linearGradient id="pinG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F39C12"/><stop offset="100%" stopColor="#D35400"/></linearGradient>
          <radialGradient id="pulseG" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#E67E22" stopOpacity="0.5"/><stop offset="100%" stopColor="#E67E22" stopOpacity="0"/></radialGradient>
          <clipPath id="faceClip"><circle cx="253" cy="78" r="20"/></clipPath>
        </defs>
        <rect width="460" height="408" fill="url(#skyG)"/>
        {/* Stars */}
        <circle cx="45" cy="25" r="1" fill="#fff" opacity="0.6"/><circle cx="120" cy="15" r="0.8" fill="#fff" opacity="0.4"/><circle cx="200" cy="40" r="1.2" fill="#fff" opacity="0.5"/><circle cx="310" cy="20" r="0.7" fill="#fff" opacity="0.7"/><circle cx="380" cy="35" r="1" fill="#fff" opacity="0.3"/><circle cx="430" cy="18" r="0.9" fill="#fff" opacity="0.5"/>
        {/* Buildings */}
        <rect x="10" y="100" width="52" height="240" fill="#222238" opacity="0.9"/>
        <rect x="68" y="155" width="45" height="185" fill="#1e1e32" opacity="0.85"/>
        <rect x="120" y="80" width="55" height="260" fill="#202040" opacity="0.9"/>
        <rect x="182" y="200" width="40" height="140" fill="#222238" opacity="0.8"/>
        <rect x="228" y="140" width="48" height="200" fill="#1e1e32" opacity="0.85"/>
        <rect x="283" y="105" width="50" height="235" fill="#202040" opacity="0.9"/>
        <rect x="340" y="170" width="42" height="170" fill="#222238" opacity="0.8"/>
        <rect x="388" y="190" width="38" height="150" fill="#1e1e32" opacity="0.85"/>
        <rect x="430" y="120" width="30" height="220" fill="#202040" opacity="0.9"/>
        {/* Window lights — scattered across buildings */}
        {[16,26,36,46,74,83,92,101,126,135,144,153,162,234,243,252,261,289,298,307,316,346,355,394,403,435,443].map(function(x,i){
          return [0,1,2,3,4,5,6,7].map(function(j){
            var y = 110 + j*18 + (i%5)*7;
            if(y > 330) return null;
            var colors = ['#FFD700','#FFD700','#FFD700','#87CEEB'];
            return <rect key={x+'-'+j} x={x} y={y} width="5" height="7" rx="0.5" fill={colors[j%4]} opacity={0.2+((x*j)%7)*0.1}/>;
          });
        })}
        {/* Antenna */}
        <line x1="147" y1="60" x2="147" y2="80" stroke="#3a3a60" strokeWidth="1.5"/>
        <circle cx="147" cy="58" r="2" fill="#ff3333" opacity="0.8"/>
        {/* Road */}
        <rect x="0" y="335" width="460" height="5" fill="#2a2a45" opacity="0.8"/>
        <rect x="0" y="340" width="460" height="68" fill="#12122a"/>
        {[30,80,130,180,230,280,330,380,430].map(function(x){return <rect key={x} x={x} y="368" width="25" height="2" fill="#555570" opacity="0.5" rx="1"/>;})}
        {/* Cars with lights */}
        <rect x="60" y="348" width="32" height="12" fill="#1a1a30" rx="3"/>
        <rect x="90" y="350" width="4" height="3" fill="#FFFFCC" opacity="0.9" rx="1"/><rect x="58" y="350" width="3" height="2" fill="#ff3333" opacity="0.8" rx="0.5"/>
        <rect x="160" y="376" width="36" height="14" fill="#222240" rx="3"/>
        <rect x="156" y="378" width="5" height="3" fill="#FFFFDD" opacity="0.9" rx="1"/><rect x="194" y="379" width="3" height="2" fill="#ff3333" opacity="0.9" rx="0.5"/>
        <rect x="320" y="378" width="26" height="10" fill="#18183a" rx="3"/>
        <rect x="316" y="380" width="4" height="2.5" fill="#FFFFF0" opacity="0.8" rx="1"/><rect x="344" y="380" width="3" height="2" fill="#ff3333" opacity="0.8" rx="0.5"/>
        <rect x="370" y="346" width="38" height="14" fill="#252548" rx="3"/>
        <rect x="406" y="349" width="5" height="3" fill="#FFFFCC" opacity="0.9" rx="1"/><rect x="368" y="349" width="3" height="2" fill="#ff3333" opacity="0.9" rx="0.5"/>
        {/* Pulse rings under pin */}
        <ellipse cx="253" cy="135" rx="45" ry="12" fill="url(#pulseG)" opacity="0.3"/>
        <ellipse cx="253" cy="135" rx="35" ry="9" fill="none" stroke="#E67E22" strokeWidth="1.2" opacity="0.2"/>
        <ellipse cx="253" cy="135" rx="25" ry="7" fill="none" stroke="#E67E22" strokeWidth="1.5" opacity="0.3"/>
        <ellipse cx="253" cy="135" rx="15" ry="5" fill="none" stroke="#E67E22" strokeWidth="2" opacity="0.45"/>
        {/* Orange pin with face */}
        <path d="M253,128 C253,128 225,95 225,78 C225,62.5 237.5,50 253,50 C268.5,50 281,62.5 281,78 C281,95 253,128 253,128Z" fill="url(#pinG)" stroke="#D35400" strokeWidth="1.5"/>
        <circle cx="253" cy="78" r="20" fill="none" stroke="#F39C12" strokeWidth="2"/>
        <g clipPath="url(#faceClip)">
          <circle cx="253" cy="80" r="18" fill="#DEB887"/>
          <ellipse cx="253" cy="66" rx="18" ry="11" fill="#1a1a1a"/>
          <rect x="236" y="62" width="34" height="10" fill="#1a1a1a" rx="4"/>
          <rect x="233" y="66" width="5" height="12" fill="#1a1a1a" rx="2"/>
          <rect x="268" y="66" width="5" height="12" fill="#1a1a1a" rx="2"/>
          <ellipse cx="253" cy="74" rx="13" ry="5" fill="#DEB887"/>
          <path d="M244,78 Q247,76 250,78" stroke="#1a1a1a" strokeWidth="1.2" fill="none"/>
          <path d="M256,78 Q259,76 262,78" stroke="#1a1a1a" strokeWidth="1.2" fill="none"/>
          <ellipse cx="247" cy="82" rx="3.5" ry="2.5" fill="white"/><circle cx="247.5" cy="82" r="1.8" fill="#2C1810"/><circle cx="248" cy="81.5" r="0.7" fill="white"/>
          <ellipse cx="259" cy="82" rx="3.5" ry="2.5" fill="white"/><circle cx="259.5" cy="82" r="1.8" fill="#2C1810"/><circle cx="260" cy="81.5" r="0.7" fill="white"/>
          <path d="M248,92 Q253,96 258,92" stroke="#8B4513" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <ellipse cx="234" cy="82" rx="3" ry="4.5" fill="#D2A679"/>
          <ellipse cx="272" cy="82" rx="3" ry="4.5" fill="#D2A679"/>
        </g>
      </svg>
      {/* Camera corners */}
      <div style={{position:'absolute',top:16,left:16,width:36,height:36,borderTop:'3px solid rgba(255,255,255,0.75)',borderLeft:'3px solid rgba(255,255,255,0.75)'}}/>
      <div style={{position:'absolute',top:16,right:16,width:36,height:36,borderTop:'3px solid rgba(255,255,255,0.75)',borderRight:'3px solid rgba(255,255,255,0.75)'}}/>
      <div style={{position:'absolute',bottom:16,left:16,width:36,height:36,borderBottom:'3px solid rgba(255,255,255,0.75)',borderLeft:'3px solid rgba(255,255,255,0.75)'}}/>
      <div style={{position:'absolute',bottom:16,right:16,width:36,height:36,borderBottom:'3px solid rgba(255,255,255,0.75)',borderRight:'3px solid rgba(255,255,255,0.75)'}}/>
      {/* REC indicator */}
      <div style={{position:'absolute',bottom:24,left:24,display:'flex',alignItems:'center',gap:8,background:'rgba(0,0,0,0.6)',padding:'4px 12px 4px 8px',borderRadius:12}}>
        <div style={{width:14,height:14,borderRadius:'50%',background:'#ff3333',animation:'tracify-pulse 1.5s infinite'}}/>
        <span style={{color:'#fff',fontSize:14,fontWeight:700,letterSpacing:2,fontFamily:'monospace'}}>REC</span>
      </div>
    </div>
  );
}

// ─── SearchingOverlay ────────────────────────────────────────
function SearchingOverlay(props) {
  var country=props.country,phone=props.phone,carrier=props.carrier,mapTarget=props.mapTarget,onComplete=props.onComplete,onClose=props.onClose;
  var STEPS=['Connecting to cellular network','Triangulating phone signal','Acquiring GPS coordinates'];
  var DUR=1400,TOTAL=DUR*STEPS.length;
  var ps2=useState(0),progress=ps2[0],setProgress=ps2[1];
  var as2=useState(0),activeStep=as2[0],setActiveStep=as2[1];
  var m=window.innerWidth<768;
  useEffect(function(){document.body.style.overflow='hidden';return function(){document.body.style.overflow='';};}, []);
  useEffect(function(){var start=performance.now(),raf;var tick=function(now){var el=now-start;setProgress(Math.min(100,(el/TOTAL)*100));setActiveStep(Math.min(STEPS.length-1,Math.floor(el/DUR)));if(el<TOTAL)raf=requestAnimationFrame(tick);else setTimeout(onComplete,350);};raf=requestAnimationFrame(tick);return function(){cancelAnimationFrame(raf);};}, []);
  return (
    <div style={{position:'fixed',inset:0,zIndex:900,background:'#f0f0f0',animation:'tracify-fadein 240ms',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{position:'absolute',inset:0}}><RealMap country={mapTarget?Object.assign({},country,{center:mapTarget.center,zoom:mapTarget.zoom}):country} playing={true} accent={C.accent}/><div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at center,rgba(255,255,255,0) 0%,rgba(255,255,255,0.4) 100%)',pointerEvents:'none'}}/></div>
      <button onClick={onClose} style={{position:'absolute',top:20,right:20,zIndex:1000,width:40,height:40,borderRadius:'50%',border:'1px solid #ddd',background:'#fff',cursor:'pointer',fontSize:20,color:'#666',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
      <div style={{position:'relative',zIndex:1000,width:'92%',maxWidth:m?340:440,background:'#fff',borderRadius:20,padding:m?20:28,boxShadow:'0 20px 60px rgba(0,0,0,0.15)',animation:'tracify-popin 380ms cubic-bezier(0.3,1.2,0.4,1)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
          <div style={{width:44,height:44,borderRadius:12,background:C.accentLight,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:22,height:22,borderRadius:'50%',border:'2.5px solid '+C.accent,borderTopColor:'transparent',animation:'tracify-spin 0.9s linear infinite'}}/></div>
          <div><div style={{fontSize:m?18:22,fontWeight:700,color:C.dark}}>Searching...</div><div style={{fontSize:13,color:C.gray}}>{country.flag} {country.dial} {phone||'--- --- ----'}</div></div>
        </div>
        <div style={{height:6,borderRadius:999,background:'#f0f0f0',overflow:'hidden',marginBottom:20}}><div style={{height:'100%',width:progress+'%',background:C.accent,borderRadius:999,transition:'width 120ms linear'}}/></div>
        {STEPS.map(function(label,i){var done=i<activeStep,active=i===activeStep;return (<div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'6px 0',opacity:done||active?1:0.4}}><div style={{width:22,height:22,borderRadius:'50%',flexShrink:0,background:done?C.accent:active?'#fff':'#f5f5f5',border:done?'none':'2px solid '+(active?C.accent:'#ddd'),display:'flex',alignItems:'center',justifyContent:'center'}}>{done?<svg width="11" height="11" viewBox="0 0 12 12"><path d="M10 3L4.5 8.5 2 6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>:active?<span style={{width:8,height:8,borderRadius:'50%',background:C.accent,animation:'tracify-pulse 1.2s infinite'}}/>:null}</div><span style={{fontSize:14,color:done||active?C.dark:'#aaa',fontWeight:active?600:500}}>{label}{active&&<span style={{color:C.accent}}>...</span>}</span></div>);})}
      </div>
    </div>
  );
}

// ─── LocatedModal ────────────────────────────────────────────
function LocatedModal(props) {
  var open=props.open,onClose=props.onClose,onContinue=props.onContinue,country=props.country,phoneDisplay=props.phoneDisplay,carrier=props.carrier,city=props.city,localTime=props.localTime,tzSign=props.tzSign;
  useEffect(function(){if(!open)return;var onKey=function(e){if(e.key==='Escape')onClose();};window.addEventListener('keydown',onKey);document.body.style.overflow='hidden';return function(){window.removeEventListener('keydown',onKey);document.body.style.overflow='';};}, [open,onClose]);
  if(!open)return null;
  var MR=function(p){
    var icons={carrier:<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round"><path d="M3 11a6 6 0 0110 0"/><path d="M5.5 9a3 3 0 015 0"/><circle cx="8" cy="11.5" r="1" fill={C.accent}/></svg>,phone:<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={C.accent} strokeWidth="1.5"><rect x="4.5" y="2" width="7" height="12" rx="1.3"/><path d="M7 12h2"/></svg>,flag:<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={C.accent} strokeWidth="1.5"><path d="M4 14V3"/><path d="M4 3h7l-1.5 2.5L11 8H4"/></svg>,clock:<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/></svg>,pin:<svg width="16" height="16" viewBox="0 0 16 16" fill={C.accent}><path d="M8 1.5c-2.8 0-5 2.2-5 5 0 3.5 5 8 5 8s5-4.5 5-8c0-2.8-2.2-5-5-5z"/><circle cx="8" cy="6.5" r="2" fill="#fff"/></svg>};
    return (<div style={{display:'flex',alignItems:'center',gap:12,padding:'11px 0',borderBottom:p.last?'none':'1px solid #f0f0f0'}}><div style={{width:34,height:34,borderRadius:10,background:'#f5f5f5',display:'flex',alignItems:'center',justifyContent:'center'}}>{icons[p.glyph]}</div><div style={{flex:1}}><div style={{fontSize:11,color:'#aaa',fontWeight:600,letterSpacing:0.4,textTransform:'uppercase',display:'flex',alignItems:'center',gap:6}}>{p.label}{p.live&&<span style={{width:6,height:6,borderRadius:'50%',background:'#4ade80',animation:'tracify-pulse 1.4s infinite'}}/>}{p.blurred&&<svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke={C.accent} strokeWidth="1.4"><rect x="2" y="5" width="7" height="5" rx="1"/><path d="M3.5 5V3.5a2 2 0 014 0V5"/></svg>}</div><div style={{fontSize:14,color:p.blurred?'#ccc':C.dark,fontWeight:500,marginTop:2,fontFamily:p.mono?'ui-monospace,monospace':'inherit',filter:p.blurred?'blur(4px)':'none',userSelect:p.blurred?'none':'auto'}}>{p.value}</div></div></div>);
  };
  return (
    <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',animation:'tracify-fadein 220ms',padding:20}} onClick={onClose}>
      <div style={{width:'100%',maxWidth:420,background:'#fff',borderRadius:20,overflow:'hidden',boxShadow:'0 30px 60px rgba(0,0,0,0.2)',animation:'tracify-popin 360ms cubic-bezier(0.3,1.2,0.4,1)'}} onClick={function(e){e.stopPropagation();}}>
        <div style={{padding:'20px 24px 16px',borderBottom:'1px solid #f0f0f0',position:'relative'}}>
          <button onClick={onClose} style={{position:'absolute',top:14,right:14,width:30,height:30,borderRadius:'50%',border:'none',background:'#f5f5f5',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:18,color:'#888'}}>×</button>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:11,fontWeight:700,color:C.accent,background:C.accentLight,padding:'4px 10px',borderRadius:999,textTransform:'uppercase'}}><span style={{width:6,height:6,borderRadius:'50%',background:C.accent,animation:'tracify-pulse 1.4s infinite'}}/>Located</div>
          <h3 style={{fontWeight:700,fontSize:26,color:C.dark,margin:'10px 0 4px'}}>Signal found</h3>
          <div style={{fontSize:13,color:C.gray}}>Last seen about 2 minutes ago</div>
        </div>
        <div style={{padding:'8px 24px'}}><MR label="SIM carrier" value={carrier} glyph="carrier"/><MR label="Number" value={country.dial+' '+phoneDisplay} glyph="phone" mono={true}/><MR label="Country" value={country.flag+'  '+country.name} glyph="flag"/><MR label="Local time" value={localTime+'  ·  UTC'+tzSign+country.tzOffset} glyph="clock" mono={true} live={true}/><MR label="City" value={"\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588"} glyph="pin" mono={true} blurred={true}/><MR label="Exact address" value={"\u2588\u2588 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588 \u2588\u2588\u2588, \u2588\u2588\u2588\u2588\u2588\u2588"} glyph="pin" mono={true} blurred={true} last={true}/></div>
        <div style={{margin:'8px 24px 0',padding:'10px 12px',borderRadius:10,background:'#f9f9f9',fontSize:12,color:C.gray}}>Exact street, recent trail and WiFi are hidden. Unlock the full report to reveal.</div>
        <div style={{padding:'16px 24px 22px'}}><button onClick={onContinue} style={{width:'100%',height:52,border:'none',background:C.accent,color:'#fff',borderRadius:12,fontSize:16,fontWeight:600,cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8}}>Continue <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7h10m-4-4l4 4-4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></button></div>
      </div>
    </div>
  );
}

// ─── ReportPage ──────────────────────────────────────────────
function ReportPage(props) {
  var onBack=props.onBack,country=props.country,phone=props.phone,carrier=props.carrier,city=props.city;
  var es2=useState(''),email=es2[0],setEmail=es2[1];
  var ld=useState(false),loading=ld[0],setLoading=ld[1];
  var er=useState(''),error=er[0],setError=er[1];
  var m=window.innerWidth<768;
  var validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  useEffect(function(){document.body.style.overflow='hidden';return function(){document.body.style.overflow='';};}, []);
  var handleSubmit=function(){
    if(!validEmail||loading)return;setLoading(true);setError('');
    fetch('/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,phoneToTrack:phone.replace(/\D/g,''),countryCode:country.dial,source:'start',plan:'start'})})
    .then(function(r){return r.json().then(function(d){return{ok:r.ok,data:d};});})
    .then(function(r){if(!r.ok){if(r.data.error&&r.data.error.indexOf('already exists')>=0){setError('Account exists. Redirecting...');setTimeout(function(){window.location.href='/payment';},1500);return;}throw new Error(r.data.error||'Signup failed');}if(r.data.checkoutUrl)window.location.href=r.data.checkoutUrl;else window.location.href=r.data.redirectTo||'/payment';}).catch(function(e){setError(e.message);setLoading(false);});
  };
  var RR=function(p){
    var icons={carrier:<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round"><path d="M3 11a6 6 0 0110 0"/><path d="M5.5 9a3 3 0 015 0"/><circle cx="8" cy="11.5" r="1" fill={C.accent}/></svg>,phone:<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke={C.accent} strokeWidth="1.5"><rect x="4.5" y="2" width="7" height="12" rx="1.3"/><path d="M7 12h2"/></svg>,flag:<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke={C.accent} strokeWidth="1.5"><path d="M4 14V3"/><path d="M4 3h7l-1.5 2.5L11 8H4"/></svg>,clock:<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/></svg>,pin:<svg width="18" height="18" viewBox="0 0 16 16" fill={C.accent}><path d="M8 1.5c-2.8 0-5 2.2-5 5 0 3.5 5 8 5 8s5-4.5 5-8c0-2.8-2.2-5-5-5z"/><circle cx="8" cy="6.5" r="2" fill="#fff"/></svg>};
    return (<div style={{display:'flex',alignItems:'center',gap:14,padding:'14px 22px',borderTop:'1px solid #f0f0f0'}}><div style={{width:38,height:38,borderRadius:11,background:'#f5f5f5',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{icons[p.glyph]}</div><div><div style={{fontSize:11,color:'#aaa',fontWeight:600,textTransform:'uppercase',letterSpacing:0.4}}>{p.label}</div><div style={{fontSize:15,color:C.dark,marginTop:3,fontWeight:500,fontFamily:p.mono?'ui-monospace,monospace':'inherit'}}>{p.value}</div></div></div>);
  };
  return (
    <div style={{position:'fixed',inset:0,zIndex:1100,background:'#fff',overflowY:'auto',animation:'tracify-fadein 240ms',fontFamily:'Nunito Sans,Avenir,sans-serif'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 28px',borderBottom:'1px solid #f0f0f0'}}><TracifyLogo size={20} accent={C.accent}/><button onClick={onBack} style={{fontSize:13,color:C.gray,background:'none',border:'none',display:'inline-flex',alignItems:'center',gap:6,cursor:'pointer'}}><svg width="12" height="12" viewBox="0 0 12 12"><path d="M10 6H2m4-3L2 6l4 3" stroke={C.gray} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>Back</button></div>
      <div style={{maxWidth:960,margin:'0 auto',padding:m?'32px 16px 80px':'48px 24px 80px'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,fontSize:11,fontWeight:700,color:C.accent,background:C.accentLight,padding:'6px 12px',borderRadius:999,textTransform:'uppercase'}}><span style={{width:7,height:7,borderRadius:'50%',background:C.accent,animation:'tracify-pulse 1.4s infinite'}}/>Report ready</div>
        <h1 style={{fontWeight:700,fontSize:m?32:48,lineHeight:1.1,margin:'18px 0 14px'}}>Your report is<br/>ready to unlock.</h1>
        <p style={{fontSize:16,color:C.muted,maxWidth:560,lineHeight:1.6,margin:'0 0 40px'}}>We found a match for your number. Enter your email to reveal the exact street, recent trail, and WiFi network.</p>
        <div style={{display:'grid',gridTemplateColumns:m?'1fr':'1.3fr 1fr',gap:28,alignItems:'start'}}>
          <div style={{background:'#f9f9f9',border:'1px solid #eee',borderRadius:20,overflow:'hidden'}}>
            <div style={{padding:'18px 22px 8px',fontSize:13,color:'#aaa',fontWeight:700,textTransform:'uppercase',letterSpacing:0.4}}>What we found</div>
            <RR label="SIM carrier" value={carrier} glyph="carrier"/><RR label="Number" value={country.dial+' '+(phone||'---')} glyph="phone" mono={true}/><RR label="Country" value={country.flag+'  '+country.name} glyph="flag"/><RR label="City" value={"\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588"} glyph="pin" mono={true}/><RR label="Accuracy" value={"\u00B147 m"} glyph="clock"/>
            <div style={{padding:'18px 22px',borderTop:'1px solid #eee'}}>
              <div style={{fontSize:12,color:'#aaa',fontWeight:700,textTransform:'uppercase',marginBottom:12}}>{"\uD83D\uDD12"} Locked — unlock below</div>
              {['Exact street address','Last 7 days trail','Current WiFi network','Top visited places'].map(function(l,i){return (<div key={i} style={{padding:'10px 0',borderTop:i?'1px dashed #e0e0e0':'none'}}><div style={{fontSize:11,color:'#aaa',fontWeight:600,textTransform:'uppercase'}}>{l}</div><div style={{fontFamily:'monospace',color:'#ccc',filter:'blur(5px)',userSelect:'none',fontSize:14,marginTop:3}}>{"\u2588\u2588\u2588 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588 \u2588\u2588\u2588\u2588\u2588\u2588"}</div></div>);})}
            </div>
          </div>
          <div style={{background:'#fff',border:'1px solid #eee',borderRadius:20,padding:24,position:m?'static':'sticky',top:24}}>
            <h3 style={{fontWeight:700,fontSize:24,margin:'0 0 6px'}}>Unlock full report</h3>
            <p style={{fontSize:13,color:C.gray,margin:'0 0 20px',lineHeight:1.5}}>Enter your email to get started.</p>
            <input type="email" value={email} onChange={function(e){setEmail(e.target.value);}} onKeyDown={function(e){if(e.key==='Enter')handleSubmit();}} placeholder="you@example.com" autoFocus style={{width:'100%',border:'1.5px solid #ddd',borderRadius:12,padding:'14px 16px',fontSize:15,outline:'none',boxSizing:'border-box',background:'#f9f9f9'}} onFocus={function(e){e.target.style.borderColor=C.accent;}} onBlur={function(e){e.target.style.borderColor='#ddd';}}/>
            {error&&<div style={{marginTop:8,fontSize:13,color:'#dc2626',fontWeight:500}}>{error}</div>}
            <button onClick={handleSubmit} disabled={!validEmail||loading} style={{marginTop:16,width:'100%',height:54,border:'none',background:validEmail&&!loading?C.accent:'#ccc',color:'#fff',borderRadius:12,fontSize:16,fontWeight:600,cursor:validEmail&&!loading?'pointer':'not-allowed'}}>{loading?'Creating account...':'Start for $1.47'}</button>
            <div style={{textAlign:'center',marginTop:14,fontSize:12,color:'#aaa'}}>$1.47 for 24h trial, then $19.98/mo. Cancel anytime.</div>
            <div style={{textAlign:'center',marginTop:6,fontSize:11,color:'#bbb'}}>By continuing, you agree to our <a href="/terms" style={{color:C.accent,textDecoration:'none'}}>Terms</a> and <a href="/privacy" style={{color:C.accent,textDecoration:'none'}}>Privacy Policy</a>.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CountrySheet ────────────────────────────────────────────
function CountrySheet(props) {
  var countries=props.countries,selectedCode=props.selectedCode,onSelect=props.onSelect,onClose=props.onClose;
  var qs=useState(''),q=qs[0],setQ=qs[1];
  var m=window.innerWidth<768;
  var filtered=countries.filter(function(c){return c.name.toLowerCase().indexOf(q.toLowerCase())>=0||c.dial.indexOf(q)>=0;});
  return (
    <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:m?'flex-end':'center',justifyContent:'center',background:'rgba(0,0,0,0.3)',backdropFilter:'blur(4px)'}} onClick={onClose}>
      <div onClick={function(e){e.stopPropagation();}} style={{width:m?'100%':420,maxHeight:m?'80vh':'70vh',background:'#fff',borderRadius:m?'20px 20px 0 0':16,boxShadow:'0 20px 60px rgba(0,0,0,0.2)',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'18px 20px 12px',borderBottom:'1px solid #f0f0f0'}}><div style={{fontSize:17,fontWeight:700,color:C.dark,marginBottom:12}}>Select country</div><input value={q} onChange={function(e){setQ(e.target.value);}} placeholder="Search" style={{width:'100%',border:'1.5px solid #ddd',borderRadius:10,padding:'10px 12px',fontSize:14,outline:'none',boxSizing:'border-box'}}/></div>
        <div style={{overflowY:'auto',padding:6}}>{filtered.map(function(c){return (<button key={c.code} onClick={function(){onSelect(c);onClose();}} style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:selectedCode===c.code?'#f5f5f5':'transparent',border:'none',borderRadius:10,cursor:'pointer',textAlign:'left'}}><span style={{fontSize:20}}>{c.flag}</span><span style={{flex:1,fontSize:14,color:C.dark,fontWeight:500}}>{c.name}</span><span style={{fontSize:13,color:'#aaa'}}>{c.dial}</span></button>);})}</div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
