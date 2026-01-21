// Localization and Currency Conversion Utility

// Supported languages (50+ languages)
const LANGUAGES = {
    en: 'English',
    cs: 'Čeština',
    de: 'Deutsch',
    es: 'Español',
    el: 'Ελληνικά',
    fr: 'Français',
    hu: 'Magyar',
    fi: 'Suomalainen',
    et: 'Eesti keel',
    hi: 'हिंदी',
    zh_HK: '粵語',
    th: 'แบบไทย',
    bn: 'বাংলা',
    ms: 'Melayu',
    ko: '한국인',
    hr: 'Hrvatski',
    id: 'Bahasa Indonesia',
    ja: '日本語',
    sv: 'Svenska',
    it: 'Italiano',
    bg: 'Български',
    sr: 'Српски',
    uk: 'Yкраїнська',
    he: 'עִברִית',
    sk: 'Slovenský',
    da: 'Dansk',
    ar: 'عربي',
    nl: 'Nederlands',
    no: 'Norsk',
    pl: 'Polski',
    zh: '普通话',
    pt: 'Português',
    ro: 'Română',
    sl: 'Slovenščina',
    tr: 'Türk',
    pt_BR: 'Português(BR)',
    vi: 'Tiếng Việt',
    bs: 'Bosanski',
    tk: 'Türkmençe',
    zu: 'isiZulu',
    ru: 'Русский',
    lv: 'Latviešu',
    lt: 'Lietuvių',
    fil: 'Filipino',
    ur: 'اردو'
};

// Comprehensive currency conversion rates (relative to PKR)
const CURRENCY_RATES = {
    PKR: { symbol: 'Rs', rate: 1, name: 'Pakistani Rupee' },
    USD: { symbol: '$', rate: 0.0036, name: 'US Dollar' },
    EUR: { symbol: '€', rate: 0.0033, name: 'Euro' },
    GBP: { symbol: '£', rate: 0.0028, name: 'British Pound' },
    AED: { symbol: 'د.إ', rate: 0.013, name: 'UAE Dirham' },
    SAR: { symbol: 'ر.س', rate: 0.014, name: 'Saudi Riyal' },
    INR: { symbol: '₹', rate: 0.30, name: 'Indian Rupee' },
    CNY: { symbol: '¥', rate: 0.026, name: 'Chinese Yuan' },
    JPY: { symbol: '¥', rate: 0.54, name: 'Japanese Yen' },
    KRW: { symbol: '₩', rate: 4.80, name: 'South Korean Won' },
    AUD: { symbol: 'A$', rate: 0.0056, name: 'Australian Dollar' },
    CAD: { symbol: 'C$', rate: 0.0050, name: 'Canadian Dollar' },
    CHF: { symbol: 'Fr', rate: 0.0032, name: 'Swiss Franc' },
    SEK: { symbol: 'kr', rate: 0.038, name: 'Swedish Krona' },
    NOK: { symbol: 'kr', rate: 0.039, name: 'Norwegian Krone' },
    DKK: { symbol: 'kr', rate: 0.025, name: 'Danish Krone' },
    SGD: { symbol: 'S$', rate: 0.0048, name: 'Singapore Dollar' },
    HKD: { symbol: 'HK$', rate: 0.028, name: 'Hong Kong Dollar' },
    NZD: { symbol: 'NZ$', rate: 0.0061, name: 'New Zealand Dollar' },
    MXN: { symbol: 'MX$', rate: 0.073, name: 'Mexican Peso' },
    BRL: { symbol: 'R$', rate: 0.022, name: 'Brazilian Real' },
    ZAR: { symbol: 'R', rate: 0.068, name: 'South African Rand' },
    RUB: { symbol: '₽', rate: 0.36, name: 'Russian Ruble' },
    TRY: { symbol: '₺', rate: 0.12, name: 'Turkish Lira' },
    PLN: { symbol: 'zł', rate: 0.015, name: 'Polish Zloty' },
    THB: { symbol: '฿', rate: 0.13, name: 'Thai Baht' },
    IDR: { symbol: 'Rp', rate: 57, name: 'Indonesian Rupiah' },
    MYR: { symbol: 'RM', rate: 0.017, name: 'Malaysian Ringgit' },
    PHP: { symbol: '₱', rate: 0.21, name: 'Philippine Peso' },
    CZK: { symbol: 'Kč', rate: 0.085, name: 'Czech Koruna' },
    HUF: { symbol: 'Ft', rate: 1.35, name: 'Hungarian Forint' },
    RON: { symbol: 'lei', rate: 0.017, name: 'Romanian Leu' },
    BGN: { symbol: 'лв', rate: 0.0065, name: 'Bulgarian Lev' },
    HRK: { symbol: 'kn', rate: 0.025, name: 'Croatian Kuna' },
    ILS: { symbol: '₪', rate: 0.013, name: 'Israeli Shekel' },
    VND: { symbol: '₫', rate: 91, name: 'Vietnamese Dong' },
    UAH: { symbol: '₴', rate: 0.15, name: 'Ukrainian Hryvnia' },
    EGP: { symbol: 'E£', rate: 0.18, name: 'Egyptian Pound' },
    NGN: { symbol: '₦', rate: 5.6, name: 'Nigerian Naira' },
    KWD: { symbol: 'د.ك', rate: 0.0011, name: 'Kuwaiti Dinar' },
    QAR: { symbol: 'ر.ق', rate: 0.013, name: 'Qatari Riyal' },
    OMR: { symbol: 'ر.ع', rate: 0.0014, name: 'Omani Rial' },
    BHD: { symbol: 'د.ب', rate: 0.0014, name: 'Bahraini Dinar' },
    JOD: { symbol: 'د.ا', rate: 0.0026, name: 'Jordanian Dinar' },
    LKR: { symbol: 'Rs', rate: 1.2, name: 'Sri Lankan Rupee' },
    BDT: { symbol: '৳', rate: 0.40, name: 'Bangladeshi Taka' },
    KES: { symbol: 'KSh', rate: 0.47, name: 'Kenyan Shilling' }
};

// Extended country to currency mapping
const COUNTRY_CURRENCY = {
    PK: 'PKR', US: 'USD', GB: 'GBP', AE: 'AED', SA: 'SAR',
    IN: 'INR', CN: 'CNY', FR: 'EUR', DE: 'EUR', ES: 'EUR',
    IT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', PT: 'EUR',
    GR: 'EUR', IE: 'EUR', FI: 'EUR', CA: 'CAD', AU: 'AUD',
    JP: 'JPY', KR: 'KRW', SG: 'SGD', HK: 'HKD', NZ: 'NZD',
    MX: 'MXN', BR: 'BRL', ZA: 'ZAR', RU: 'RUB', TR: 'TRY',
    PL: 'PLN', TH: 'THB', ID: 'IDR', MY: 'MYR', PH: 'PHP',
    CZ: 'CZK', HU: 'HUF', RO: 'RON', BG: 'BGN', HR: 'HRK',
    IL: 'ILS', VN: 'VND', UA: 'UAH', EG: 'EGP', NG: 'NGN',
    SE: 'SEK', NO: 'NOK', DK: 'DKK', CH: 'CHF', KW: 'KWD',
    QA: 'QAR', OM: 'OMR', BH: 'BHD', JO: 'JOD', LK: 'LKR',
    BD: 'BDT', KE: 'KES'
};

// Extended country to language mapping
const COUNTRY_LANGUAGE = {
    PK: 'ur', US: 'en', GB: 'en', AE: 'ar', SA: 'ar',
    IN: 'hi', CN: 'zh', FR: 'fr', DE: 'de', ES: 'es',
    IT: 'it', NL: 'nl', PT: 'pt', BR: 'pt_BR', RU: 'ru',
    TR: 'tr', PL: 'pl', CZ: 'cs', GR: 'el', HU: 'hu',
    FI: 'fi', SE: 'sv', NO: 'no', DK: 'da', BG: 'bg',
    HR: 'hr', RO: 'ro', SK: 'sk', SI: 'sl', EE: 'et',
    LV: 'lv', LT: 'lt', JP: 'ja', KR: 'ko', TH: 'th',
    VN: 'vi', ID: 'id', MY: 'ms', PH: 'fil', BD: 'bn',
    IL: 'he', UA: 'uk', RS: 'sr', BA: 'bs', ZA: 'zu'
};

// Get user's location based on timezone and browser language
function detectUserLocation() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const browserLang = navigator.language || navigator.userLanguage;

    // Map timezone to country
    const timezoneCountryMap = {
        'Asia/Karachi': 'PK',
        'America/New_York': 'US',
        'America/Los_Angeles': 'US',
        'Europe/London': 'GB',
        'Asia/Dubai': 'AE',
        'Asia/Riyadh': 'SA',
        'Asia/Kolkata': 'IN',
        'Asia/Shanghai': 'CN',
        'Europe/Paris': 'FR',
        'Europe/Berlin': 'DE'
    };

    let country = timezoneCountryMap[timezone] || 'PK';

    // Extract country from browser language if available
    if (browserLang.includes('-')) {
        const langCountry = browserLang.split('-')[1];
        if (COUNTRY_CURRENCY[langCountry]) {
            country = langCountry;
        }
    }

    return country;
}

// Get currency for country
function getCurrencyForCountry(country) {
    return COUNTRY_CURRENCY[country] || 'PKR';
}

// Get language for country
function getLanguageForCountry(country) {
    return COUNTRY_LANGUAGE[country] || 'en';
}

// Convert price from PKR to target currency
function convertPrice(amountInPKR, targetCurrency) {
    const rate = CURRENCY_RATES[targetCurrency]?.rate || 1;
    const converted = Math.ceil(amountInPKR * rate);
    return converted;
}

// Format price with currency symbol
function formatPrice(amount, currency) {
    const currencyInfo = CURRENCY_RATES[currency] || CURRENCY_RATES.PKR;
    return `${currencyInfo.symbol} ${amount.toLocaleString()}`;
}

// Get user preferences (stored in localStorage or auto-detected)
function getUserPreferences() {
    let country = localStorage.getItem('tracify_country');
    let language = localStorage.getItem('tracify_language');
    let currency = localStorage.getItem('tracify_currency');

    if (!country) {
        country = detectUserLocation();
        localStorage.setItem('tracify_country', country);
    }

    if (!language) {
        language = getLanguageForCountry(country);
        localStorage.setItem('tracify_language', language);
    }

    if (!currency) {
        currency = getCurrencyForCountry(country);
        localStorage.setItem('tracify_currency', currency);
    }

    return { country, language, currency };
}

// Set user preferences
function setUserPreferences(country, language, currency) {
    localStorage.setItem('tracify_country', country);
    localStorage.setItem('tracify_language', language);
    localStorage.setItem('tracify_currency', currency);
}

module.exports = {
    LANGUAGES,
    CURRENCY_RATES,
    detectUserLocation,
    getCurrencyForCountry,
    getLanguageForCountry,
    convertPrice,
    formatPrice,
    getUserPreferences,
    setUserPreferences
};
