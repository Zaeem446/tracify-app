/**
 * Tracify Geo Detection
 * Uses freeipapi.com for IP-based country and language detection
 */

(function(window) {
    'use strict';

    // Use our own server-side proxy to avoid CORS issues
    const API_URL = '/api/geo/detect';
    const CACHE_KEY = 'tracify_geo_cache';
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    // Country code to language mapping (46 supported languages)
    const COUNTRY_TO_LANGUAGE = {
        // English
        'US': 'en', 'GB': 'en', 'AU': 'en', 'CA': 'en', 'NZ': 'en', 'IE': 'en', 'SG': 'en', 'PK': 'en',
        // German
        'DE': 'de', 'AT': 'de', 'CH': 'de', 'LI': 'de',
        // French
        'FR': 'fr', 'BE': 'fr', 'LU': 'fr', 'MC': 'fr',
        // Spanish
        'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'VE': 'es', 'CL': 'es', 'EC': 'es', 'GT': 'es', 'CU': 'es', 'BO': 'es', 'DO': 'es', 'HN': 'es', 'PY': 'es', 'SV': 'es', 'NI': 'es', 'CR': 'es', 'PA': 'es', 'UY': 'es',
        // Italian
        'IT': 'it', 'SM': 'it', 'VA': 'it',
        // Portuguese
        'PT': 'pt',
        // Portuguese Brazil
        'BR': 'pt_BR',
        // Japanese
        'JP': 'ja',
        // Korean
        'KR': 'ko',
        // Chinese
        'CN': 'zh',
        // Chinese Taiwan
        'TW': 'zh-TW',
        // Cantonese (Hong Kong)
        'HK': 'zh_HK',
        // Russian
        'RU': 'ru', 'BY': 'ru', 'KZ': 'ru', 'KG': 'ru',
        // Polish
        'PL': 'pl',
        // Dutch
        'NL': 'nl',
        // Turkish
        'TR': 'tr',
        // Arabic
        'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'IQ': 'ar', 'JO': 'ar', 'KW': 'ar', 'LB': 'ar', 'LY': 'ar', 'MA': 'ar', 'OM': 'ar', 'QA': 'ar', 'SY': 'ar', 'TN': 'ar', 'YE': 'ar', 'BH': 'ar', 'DZ': 'ar',
        // Hebrew
        'IL': 'he',
        // Hindi
        'IN': 'hi',
        // Thai
        'TH': 'th',
        // Vietnamese
        'VN': 'vi',
        // Indonesian
        'ID': 'id',
        // Malay
        'MY': 'ms', 'BN': 'ms',
        // Filipino
        'PH': 'fil',
        // Bengali
        'BD': 'bn',
        // Swedish
        'SE': 'sv',
        // Norwegian
        'NO': 'no',
        // Danish
        'DK': 'da',
        // Finnish
        'FI': 'fi',
        // Greek
        'GR': 'el', 'CY': 'el',
        // Czech
        'CZ': 'cs',
        // Hungarian
        'HU': 'hu',
        // Romanian
        'RO': 'ro', 'MD': 'ro',
        // Bulgarian
        'BG': 'bg',
        // Ukrainian
        'UA': 'uk',
        // Slovak
        'SK': 'sk',
        // Slovenian
        'SI': 'sl',
        // Croatian
        'HR': 'hr',
        // Serbian
        'RS': 'sr', 'ME': 'sr',
        // Bosnian
        'BA': 'bs',
        // Estonian
        'EE': 'et',
        // Latvian
        'LV': 'lv',
        // Lithuanian
        'LT': 'lt',
        // Zulu (South Africa)
        'ZA': 'zu',
        // Turkmen
        'TM': 'tk'
    };

    // Complete country calling codes mapping
    const COUNTRY_TO_PHONE = {
        'AF': '+93', 'AL': '+355', 'DZ': '+213', 'AS': '+1684', 'AD': '+376', 'AO': '+244', 'AI': '+1264',
        'AG': '+1268', 'AR': '+54', 'AM': '+374', 'AW': '+297', 'AU': '+61', 'AT': '+43', 'AZ': '+994',
        'BS': '+1242', 'BH': '+973', 'BD': '+880', 'BB': '+1246', 'BY': '+375', 'BE': '+32', 'BZ': '+501',
        'BJ': '+229', 'BM': '+1441', 'BT': '+975', 'BO': '+591', 'BA': '+387', 'BW': '+267', 'BR': '+55',
        'BN': '+673', 'BG': '+359', 'BF': '+226', 'BI': '+257', 'KH': '+855', 'CM': '+237', 'CA': '+1',
        'CV': '+238', 'KY': '+1345', 'CF': '+236', 'TD': '+235', 'CL': '+56', 'CN': '+86', 'CO': '+57',
        'KM': '+269', 'CG': '+242', 'CD': '+243', 'CR': '+506', 'CI': '+225', 'HR': '+385', 'CU': '+53',
        'CY': '+357', 'CZ': '+420', 'DK': '+45', 'DJ': '+253', 'DM': '+1767', 'DO': '+1809', 'EC': '+593',
        'EG': '+20', 'SV': '+503', 'GQ': '+240', 'ER': '+291', 'EE': '+372', 'ET': '+251', 'FJ': '+679',
        'FI': '+358', 'FR': '+33', 'GA': '+241', 'GM': '+220', 'GE': '+995', 'DE': '+49', 'GH': '+233',
        'GR': '+30', 'GD': '+1473', 'GT': '+502', 'GN': '+224', 'GW': '+245', 'GY': '+592', 'HT': '+509',
        'HN': '+504', 'HK': '+852', 'HU': '+36', 'IS': '+354', 'IN': '+91', 'ID': '+62', 'IR': '+98',
        'IQ': '+964', 'IE': '+353', 'IL': '+972', 'IT': '+39', 'JM': '+1876', 'JP': '+81', 'JO': '+962',
        'KZ': '+7', 'KE': '+254', 'KI': '+686', 'KP': '+850', 'KR': '+82', 'KW': '+965', 'KG': '+996',
        'LA': '+856', 'LV': '+371', 'LB': '+961', 'LS': '+266', 'LR': '+231', 'LY': '+218', 'LI': '+423',
        'LT': '+370', 'LU': '+352', 'MO': '+853', 'MK': '+389', 'MG': '+261', 'MW': '+265', 'MY': '+60',
        'MV': '+960', 'ML': '+223', 'MT': '+356', 'MH': '+692', 'MR': '+222', 'MU': '+230', 'MX': '+52',
        'FM': '+691', 'MD': '+373', 'MC': '+377', 'MN': '+976', 'ME': '+382', 'MA': '+212', 'MZ': '+258',
        'MM': '+95', 'NA': '+264', 'NR': '+674', 'NP': '+977', 'NL': '+31', 'NZ': '+64', 'NI': '+505',
        'NE': '+227', 'NG': '+234', 'NO': '+47', 'OM': '+968', 'PK': '+92', 'PW': '+680', 'PA': '+507',
        'PG': '+675', 'PY': '+595', 'PE': '+51', 'PH': '+63', 'PL': '+48', 'PT': '+351', 'PR': '+1787',
        'QA': '+974', 'RO': '+40', 'RU': '+7', 'RW': '+250', 'KN': '+1869', 'LC': '+1758', 'VC': '+1784',
        'WS': '+685', 'SM': '+378', 'ST': '+239', 'SA': '+966', 'SN': '+221', 'RS': '+381', 'SC': '+248',
        'SL': '+232', 'SG': '+65', 'SK': '+421', 'SI': '+386', 'SB': '+677', 'SO': '+252', 'ZA': '+27',
        'ES': '+34', 'LK': '+94', 'SD': '+249', 'SR': '+597', 'SZ': '+268', 'SE': '+46', 'CH': '+41',
        'SY': '+963', 'TW': '+886', 'TJ': '+992', 'TZ': '+255', 'TH': '+66', 'TL': '+670', 'TG': '+228',
        'TO': '+676', 'TT': '+1868', 'TN': '+216', 'TR': '+90', 'TM': '+993', 'UG': '+256', 'UA': '+380',
        'AE': '+971', 'GB': '+44', 'US': '+1', 'UY': '+598', 'UZ': '+998', 'VU': '+678', 'VA': '+379',
        'VE': '+58', 'VN': '+84', 'YE': '+967', 'ZM': '+260', 'ZW': '+263'
    };

    let cachedData = null;
    let detectPromise = null;

    /**
     * Get cached geo data if valid
     */
    function getCachedData() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const data = JSON.parse(cached);
                if (Date.now() - data.timestamp < CACHE_DURATION) {
                    return data;
                }
            }
        } catch (e) {
            console.warn('Error reading geo cache:', e);
        }
        return null;
    }

    /**
     * Save geo data to cache
     */
    function setCachedData(data) {
        try {
            data.timestamp = Date.now();
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Error saving geo cache:', e);
        }
    }

    /**
     * Call our server-side geo API proxy
     */
    async function fetchGeoData() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.warn('Geo API error:', error);
            return null;
        }
    }

    /**
     * Get language from country code
     */
    function getLanguageFromCountry(countryCode) {
        return COUNTRY_TO_LANGUAGE[countryCode] || 'en';
    }

    /**
     * Get phone code from country code
     */
    function getPhoneFromCountry(countryCode) {
        return COUNTRY_TO_PHONE[countryCode] || '+1';
    }

    /**
     * Detect user's geo information
     */
    async function detect() {
        // Return existing promise if detection is in progress
        if (detectPromise) {
            return detectPromise;
        }

        // Check cache first
        const cached = getCachedData();
        if (cached) {
            cachedData = cached;
            return cached;
        }

        // Fetch from API (our server-side proxy)
        detectPromise = (async () => {
            const apiData = await fetchGeoData();

            let result;
            if (apiData && apiData.success && apiData.countryCode) {
                // Server already processed the data
                result = {
                    countryCode: apiData.countryCode,
                    countryName: apiData.countryName || '',
                    phoneCode: apiData.phoneCode || getPhoneFromCountry(apiData.countryCode),
                    language: apiData.language || getLanguageFromCountry(apiData.countryCode),
                    timezone: apiData.timezone || '',
                    city: apiData.city || '',
                    source: apiData.source || 'api'
                };
            } else {
                // Fallback to timezone detection
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                result = {
                    countryCode: 'US',
                    countryName: 'United States',
                    phoneCode: '+1',
                    language: 'en',
                    timezone: timezone,
                    city: '',
                    source: 'fallback'
                };
            }

            setCachedData(result);
            cachedData = result;
            detectPromise = null;
            return result;
        })();

        return detectPromise;
    }

    /**
     * Get detected country calling code
     */
    async function getDetectedPhoneCode() {
        // Check user preference first
        const saved = localStorage.getItem('tracify_country_code');
        if (saved) {
            return saved;
        }

        const data = await detect();
        return data.phoneCode;
    }

    /**
     * Get detected language
     */
    async function getDetectedLanguage() {
        // Check user preference first
        const saved = localStorage.getItem('tracify_lang');
        if (saved) {
            return saved;
        }

        const data = await detect();
        return data.language;
    }

    /**
     * Save user's phone code preference
     */
    function savePhoneCode(code) {
        localStorage.setItem('tracify_country_code', code);
    }

    /**
     * Get all country phone codes (for dropdown)
     */
    function getAllPhoneCodes() {
        return COUNTRY_TO_PHONE;
    }

    /**
     * Clear cache (for testing)
     */
    function clearCache() {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem('tracify_country_code');
        localStorage.removeItem('tracify_lang');
        cachedData = null;
        detectPromise = null;
    }

    // Public API
    window.TracifyGeo = {
        detect,
        getDetectedPhoneCode,
        getDetectedLanguage,
        savePhoneCode,
        getAllPhoneCodes,
        clearCache,
        getLanguageFromCountry,
        getPhoneFromCountry
    };

})(window);
