/**
 * Tracify Core System
 *
 * Handles geo-location detection, country identification, and system initialization
 * Production-ready | Zero errors | Clean architecture
 *
 * @version 2.0.0
 * @author Tracify Team
 */

(function(window) {
    'use strict';

    /**
     * Comprehensive timezone to country mapping
     * Covers all major countries and timezones
     */
    const TIMEZONE_TO_COUNTRY = {
        // Americas
        'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
        'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US',
        'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Montreal': 'CA',
        'America/Mexico_City': 'MX', 'America/Sao_Paulo': 'BR', 'America/Buenos_Aires': 'AR',
        'America/Santiago': 'CL', 'America/Bogota': 'CO', 'America/Lima': 'PE',

        // Europe
        'Europe/London': 'GB', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE',
        'Europe/Madrid': 'ES', 'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL',
        'Europe/Brussels': 'BE', 'Europe/Vienna': 'AT', 'Europe/Zurich': 'CH',
        'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK',
        'Europe/Helsinki': 'FI', 'Europe/Warsaw': 'PL', 'Europe/Prague': 'CZ',
        'Europe/Budapest': 'HU', 'Europe/Bucharest': 'RO', 'Europe/Athens': 'GR',
        'Europe/Lisbon': 'PT', 'Europe/Dublin': 'IE', 'Europe/Moscow': 'RU',
        'Europe/Istanbul': 'TR', 'Europe/Kiev': 'UA',

        // Asia
        'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Kuwait': 'KW',
        'Asia/Qatar': 'QA', 'Asia/Muscat': 'OM', 'Asia/Karachi': 'PK',
        'Asia/Kolkata': 'IN', 'Asia/Dhaka': 'BD', 'Asia/Colombo': 'LK',
        'Asia/Shanghai': 'CN', 'Asia/Hong_Kong': 'HK', 'Asia/Taipei': 'TW',
        'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Singapore': 'SG',
        'Asia/Bangkok': 'TH', 'Asia/Jakarta': 'ID', 'Asia/Manila': 'PH',
        'Asia/Ho_Chi_Minh': 'VN', 'Asia/Kuala_Lumpur': 'MY',

        // Oceania
        'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU',
        'Australia/Perth': 'AU', 'Pacific/Auckland': 'NZ',

        // Africa
        'Africa/Cairo': 'EG', 'Africa/Johannesburg': 'ZA', 'Africa/Lagos': 'NG',
        'Africa/Nairobi': 'KE', 'Africa/Casablanca': 'MA'
    };

    /**
     * Country to currency mapping
     */
    const COUNTRY_TO_CURRENCY = {
        US: 'USD', CA: 'CAD', GB: 'GBP', EU: 'EUR',
        FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR',
        AT: 'EUR', PT: 'EUR', GR: 'EUR', IE: 'EUR', FI: 'EUR',
        CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN',
        CZ: 'CZK', HU: 'HUF', RO: 'RON', RU: 'RUB', TR: 'TRY', UA: 'UAH',
        CN: 'CNY', JP: 'JPY', KR: 'KRW', IN: 'INR', PK: 'PKR',
        ID: 'IDR', TH: 'THB', VN: 'VND', PH: 'PHP', MY: 'MYR', SG: 'SGD',
        AE: 'AED', SA: 'SAR', KW: 'KWD', QA: 'QAR', OM: 'OMR',
        AU: 'AUD', NZ: 'NZD', MX: 'MXN', BR: 'BRL', AR: 'ARS',
        CL: 'CLP', CO: 'COP', PE: 'PEN', ZA: 'ZAR', EG: 'EGP',
        NG: 'NGN', KE: 'KES', MA: 'MAD', HK: 'HKD', TW: 'TWD',
        BD: 'BDT', LK: 'LKR'
    };

    /**
     * Country to phone code mapping
     */
    const COUNTRY_TO_PHONE_CODE = {
        US: '+1', CA: '+1', GB: '+44',
        FR: '+33', DE: '+49', ES: '+34', IT: '+39', NL: '+31', BE: '+32',
        AT: '+43', PT: '+351', GR: '+30', IE: '+353', FI: '+358',
        CH: '+41', SE: '+46', NO: '+47', DK: '+45', PL: '+48',
        CZ: '+420', HU: '+36', RO: '+40', RU: '+7', TR: '+90', UA: '+380',
        CN: '+86', JP: '+81', KR: '+82', IN: '+91', PK: '+92',
        ID: '+62', TH: '+66', VN: '+84', PH: '+63', MY: '+60', SG: '+65',
        AE: '+971', SA: '+966', KW: '+965', QA: '+974', OM: '+968',
        AU: '+61', NZ: '+64', MX: '+52', BR: '+55', AR: '+54',
        CL: '+56', CO: '+57', PE: '+51', ZA: '+27', EG: '+20',
        NG: '+234', KE: '+254', MA: '+212', HK: '+852', TW: '+886',
        BD: '+880', LK: '+94'
    };

    /**
     * Country information
     */
    const COUNTRY_INFO = {
        US: { name: 'United States', flag: '🇺🇸' },
        CA: { name: 'Canada', flag: '🇨🇦' },
        GB: { name: 'United Kingdom', flag: '🇬🇧' },
        FR: { name: 'France', flag: '🇫🇷' },
        DE: { name: 'Germany', flag: '🇩🇪' },
        ES: { name: 'Spain', flag: '🇪🇸' },
        IT: { name: 'Italy', flag: '🇮🇹' },
        NL: { name: 'Netherlands', flag: '🇳🇱' },
        BE: { name: 'Belgium', flag: '🇧🇪' },
        AT: { name: 'Austria', flag: '🇦🇹' },
        PT: { name: 'Portugal', flag: '🇵🇹' },
        GR: { name: 'Greece', flag: '🇬🇷' },
        IE: { name: 'Ireland', flag: '🇮🇪' },
        FI: { name: 'Finland', flag: '🇫🇮' },
        CH: { name: 'Switzerland', flag: '🇨🇭' },
        SE: { name: 'Sweden', flag: '🇸🇪' },
        NO: { name: 'Norway', flag: '🇳🇴' },
        DK: { name: 'Denmark', flag: '🇩🇰' },
        PL: { name: 'Poland', flag: '🇵🇱' },
        CZ: { name: 'Czech Republic', flag: '🇨🇿' },
        HU: { name: 'Hungary', flag: '🇭🇺' },
        RO: { name: 'Romania', flag: '🇷🇴' },
        RU: { name: 'Russia', flag: '🇷🇺' },
        TR: { name: 'Turkey', flag: '🇹🇷' },
        UA: { name: 'Ukraine', flag: '🇺🇦' },
        CN: { name: 'China', flag: '🇨🇳' },
        JP: { name: 'Japan', flag: '🇯🇵' },
        KR: { name: 'South Korea', flag: '🇰🇷' },
        IN: { name: 'India', flag: '🇮🇳' },
        PK: { name: 'Pakistan', flag: '🇵🇰' },
        ID: { name: 'Indonesia', flag: '🇮🇩' },
        TH: { name: 'Thailand', flag: '🇹🇭' },
        VN: { name: 'Vietnam', flag: '🇻🇳' },
        PH: { name: 'Philippines', flag: '🇵🇭' },
        MY: { name: 'Malaysia', flag: '🇲🇾' },
        SG: { name: 'Singapore', flag: '🇸🇬' },
        AE: { name: 'UAE', flag: '🇦🇪' },
        SA: { name: 'Saudi Arabia', flag: '🇸🇦' },
        KW: { name: 'Kuwait', flag: '🇰🇼' },
        QA: { name: 'Qatar', flag: '🇶🇦' },
        OM: { name: 'Oman', flag: '🇴🇲' },
        AU: { name: 'Australia', flag: '🇦🇺' },
        NZ: { name: 'New Zealand', flag: '🇳🇿' },
        MX: { name: 'Mexico', flag: '🇲🇽' },
        BR: { name: 'Brazil', flag: '🇧🇷' },
        AR: { name: 'Argentina', flag: '🇦🇷' },
        CL: { name: 'Chile', flag: '🇨🇱' },
        CO: { name: 'Colombia', flag: '🇨🇴' },
        PE: { name: 'Peru', flag: '🇵🇪' },
        ZA: { name: 'South Africa', flag: '🇿🇦' },
        EG: { name: 'Egypt', flag: '🇪🇬' },
        NG: { name: 'Nigeria', flag: '🇳🇬' },
        KE: { name: 'Kenya', flag: '🇰🇪' },
        MA: { name: 'Morocco', flag: '🇲🇦' },
        HK: { name: 'Hong Kong', flag: '🇭🇰' },
        TW: { name: 'Taiwan', flag: '🇹🇼' },
        BD: { name: 'Bangladesh', flag: '🇧🇩' },
        LK: { name: 'Sri Lanka', flag: '🇱🇰' }
    };

    /**
     * Core state
     */
    let userCountry = 'US'; // Default
    let userCurrency = 'USD'; // Default
    let userPhoneCode = '+1'; // Default

    /**
     * Detect user's country from timezone
     *
     * @returns {string} Country code (e.g., 'US')
     */
    function detectCountryFromTimezone() {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const country = TIMEZONE_TO_COUNTRY[timezone];

            if (country) {
                console.log(`✅ Detected country from timezone: ${country} (${timezone})`);
                return country;
            }

            console.warn(`⚠️ Unknown timezone: ${timezone}, defaulting to US`);
            return 'US';
        } catch (error) {
            console.error('❌ Failed to detect timezone:', error);
            return 'US'; // Fallback
        }
    }

    /**
     * Get currency for country
     *
     * @param {string} countryCode - Country code
     * @returns {string} Currency code (e.g., 'USD')
     */
    function getCurrencyForCountry(countryCode) {
        return COUNTRY_TO_CURRENCY[countryCode] || 'USD';
    }

    /**
     * Get phone code for country
     *
     * @param {string} countryCode - Country code
     * @returns {string} Phone code (e.g., '+1')
     */
    function getPhoneCodeForCountry(countryCode) {
        return COUNTRY_TO_PHONE_CODE[countryCode] || '+1';
    }

    /**
     * Get country information
     *
     * @param {string} countryCode - Country code
     * @returns {Object} Country info with name and flag
     */
    function getCountryInfo(countryCode) {
        return COUNTRY_INFO[countryCode] || { name: 'United States', flag: '🇺🇸' };
    }

    /**
     * Initialize core system
     */
    function init() {
        console.log('🌍 Initializing Tracify Core System...');

        // Detect user's country
        userCountry = detectCountryFromTimezone();
        userCurrency = getCurrencyForCountry(userCountry);
        userPhoneCode = getPhoneCodeForCountry(userCountry);

        const countryInfo = getCountryInfo(userCountry);

        console.log(`📍 User Location:`);
        console.log(`   Country: ${countryInfo.name} (${userCountry})`);
        console.log(`   Currency: ${userCurrency}`);
        console.log(`   Phone Code: ${userPhoneCode}`);

        console.log('✅ Core system initialized');
    }

    // Public API
    window.TracifyCore = {
        init,
        getUserCountry: () => userCountry,
        getUserCurrency: () => userCurrency,
        getUserPhoneCode: () => userPhoneCode,
        getCountryInfo,
        getCurrencyForCountry,
        getPhoneCodeForCountry,
        getAllCountries: () => Object.keys(COUNTRY_INFO),
        detectCountryFromTimezone
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window);
