const express = require('express');
const router = express.Router();

const API_KEY = process.env.FREEIPAPI_KEY || 'c95abfa3eb06040eac72e3e02f6332e4eef824c4e0348dbca996d0f265ead47a';
const API_URL = 'https://us.freeipapi.com/api/json';

// Country code to language mapping (46 supported languages)
const COUNTRY_TO_LANGUAGE = {
    'US': 'en', 'GB': 'en', 'AU': 'en', 'CA': 'en', 'NZ': 'en', 'IE': 'en', 'SG': 'en', 'PK': 'en',
    'DE': 'de', 'AT': 'de', 'CH': 'de', 'LI': 'de',
    'FR': 'fr', 'BE': 'fr', 'LU': 'fr', 'MC': 'fr',
    'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'VE': 'es', 'CL': 'es', 'EC': 'es', 'GT': 'es', 'CU': 'es', 'BO': 'es', 'DO': 'es', 'HN': 'es', 'PY': 'es', 'SV': 'es', 'NI': 'es', 'CR': 'es', 'PA': 'es', 'UY': 'es',
    'IT': 'it', 'SM': 'it', 'VA': 'it',
    'PT': 'pt', 'BR': 'pt_BR',
    'JP': 'ja', 'KR': 'ko', 'CN': 'zh', 'TW': 'zh-TW', 'HK': 'zh_HK',
    'RU': 'ru', 'BY': 'ru', 'KZ': 'ru', 'KG': 'ru',
    'PL': 'pl', 'NL': 'nl', 'TR': 'tr',
    'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'IQ': 'ar', 'JO': 'ar', 'KW': 'ar', 'LB': 'ar', 'LY': 'ar', 'MA': 'ar', 'OM': 'ar', 'QA': 'ar', 'SY': 'ar', 'TN': 'ar', 'YE': 'ar', 'BH': 'ar', 'DZ': 'ar',
    'IL': 'he', 'IN': 'hi', 'TH': 'th', 'VN': 'vi', 'ID': 'id',
    'MY': 'ms', 'BN': 'ms', 'PH': 'fil', 'BD': 'bn',
    'SE': 'sv', 'NO': 'no', 'DK': 'da', 'FI': 'fi',
    'GR': 'el', 'CY': 'el', 'CZ': 'cs', 'HU': 'hu',
    'RO': 'ro', 'MD': 'ro', 'BG': 'bg', 'UA': 'uk',
    'SK': 'sk', 'SI': 'sl', 'HR': 'hr', 'RS': 'sr', 'ME': 'sr',
    'BA': 'bs', 'EE': 'et', 'LV': 'lv', 'LT': 'lt',
    'ZA': 'zu', 'TM': 'tk'
};

// Country calling codes
const COUNTRY_TO_PHONE = {
    'AF': '+93', 'AL': '+355', 'DZ': '+213', 'AD': '+376', 'AO': '+244',
    'AR': '+54', 'AM': '+374', 'AU': '+61', 'AT': '+43', 'AZ': '+994',
    'BH': '+973', 'BD': '+880', 'BY': '+375', 'BE': '+32', 'BZ': '+501',
    'BJ': '+229', 'BT': '+975', 'BO': '+591', 'BA': '+387', 'BW': '+267', 'BR': '+55',
    'BN': '+673', 'BG': '+359', 'BF': '+226', 'BI': '+257', 'KH': '+855', 'CM': '+237', 'CA': '+1',
    'CV': '+238', 'CF': '+236', 'TD': '+235', 'CL': '+56', 'CN': '+86', 'CO': '+57',
    'KM': '+269', 'CG': '+242', 'CD': '+243', 'CR': '+506', 'CI': '+225', 'HR': '+385', 'CU': '+53',
    'CY': '+357', 'CZ': '+420', 'DK': '+45', 'DJ': '+253', 'DO': '+1809', 'EC': '+593',
    'EG': '+20', 'SV': '+503', 'GQ': '+240', 'ER': '+291', 'EE': '+372', 'ET': '+251', 'FJ': '+679',
    'FI': '+358', 'FR': '+33', 'GA': '+241', 'GM': '+220', 'GE': '+995', 'DE': '+49', 'GH': '+233',
    'GR': '+30', 'GT': '+502', 'GN': '+224', 'GW': '+245', 'GY': '+592', 'HT': '+509',
    'HN': '+504', 'HK': '+852', 'HU': '+36', 'IS': '+354', 'IN': '+91', 'ID': '+62', 'IR': '+98',
    'IQ': '+964', 'IE': '+353', 'IL': '+972', 'IT': '+39', 'JM': '+1876', 'JP': '+81', 'JO': '+962',
    'KZ': '+7', 'KE': '+254', 'KR': '+82', 'KW': '+965', 'KG': '+996',
    'LA': '+856', 'LV': '+371', 'LB': '+961', 'LS': '+266', 'LR': '+231', 'LY': '+218', 'LI': '+423',
    'LT': '+370', 'LU': '+352', 'MO': '+853', 'MK': '+389', 'MG': '+261', 'MW': '+265', 'MY': '+60',
    'MV': '+960', 'ML': '+223', 'MT': '+356', 'MR': '+222', 'MU': '+230', 'MX': '+52',
    'MD': '+373', 'MC': '+377', 'MN': '+976', 'ME': '+382', 'MA': '+212', 'MZ': '+258',
    'MM': '+95', 'NA': '+264', 'NP': '+977', 'NL': '+31', 'NZ': '+64', 'NI': '+505',
    'NE': '+227', 'NG': '+234', 'NO': '+47', 'OM': '+968', 'PK': '+92', 'PA': '+507',
    'PG': '+675', 'PY': '+595', 'PE': '+51', 'PH': '+63', 'PL': '+48', 'PT': '+351',
    'QA': '+974', 'RO': '+40', 'RU': '+7', 'RW': '+250',
    'SA': '+966', 'SN': '+221', 'RS': '+381', 'SC': '+248',
    'SL': '+232', 'SG': '+65', 'SK': '+421', 'SI': '+386', 'SO': '+252', 'ZA': '+27',
    'ES': '+34', 'LK': '+94', 'SD': '+249', 'SR': '+597', 'SZ': '+268', 'SE': '+46', 'CH': '+41',
    'SY': '+963', 'TW': '+886', 'TJ': '+992', 'TZ': '+255', 'TH': '+66', 'TG': '+228',
    'TO': '+676', 'TN': '+216', 'TR': '+90', 'TM': '+993', 'UG': '+256', 'UA': '+380',
    'AE': '+971', 'GB': '+44', 'US': '+1', 'UY': '+598', 'UZ': '+998',
    'VE': '+58', 'VN': '+84', 'YE': '+967', 'ZM': '+260', 'ZW': '+263'
};

function getLanguageFromCountry(countryCode) {
    return COUNTRY_TO_LANGUAGE[countryCode] || 'en';
}

function getPhoneFromCountry(countryCode) {
    return COUNTRY_TO_PHONE[countryCode] || '+1';
}

// Get client IP from request
function getClientIP(req) {
    // Check various headers for the real IP (behind proxies/load balancers)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        // x-forwarded-for can contain multiple IPs, take the first one
        return forwarded.split(',')[0].trim();
    }

    const realIP = req.headers['x-real-ip'];
    if (realIP) {
        return realIP;
    }

    // Vercel-specific header
    const vercelIP = req.headers['x-vercel-forwarded-for'];
    if (vercelIP) {
        return vercelIP.split(',')[0].trim();
    }

    return req.ip || req.connection?.remoteAddress || '';
}

// Geo detection endpoint
router.get('/detect', async (req, res) => {
    try {
        const clientIP = getClientIP(req);
        console.log('Geo detect for IP:', clientIP);

        // Call freeipapi.com with client's IP
        const apiUrl = clientIP ? `${API_URL}/${clientIP}` : API_URL;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('FreeIPAPI error:', response.status, errorText);
            throw new Error(`API request failed: ${response.status}`);
        }

        const apiData = await response.json();
        console.log('FreeIPAPI response:', JSON.stringify(apiData));

        if (apiData && apiData.countryCode) {
            // phoneCodes is an array like [61], extract first element
            let phoneCode = getPhoneFromCountry(apiData.countryCode);
            if (apiData.phoneCodes && apiData.phoneCodes.length > 0) {
                phoneCode = '+' + apiData.phoneCodes[0];
            }

            res.json({
                success: true,
                countryCode: apiData.countryCode,
                countryName: apiData.countryName || '',
                phoneCode: phoneCode,
                language: getLanguageFromCountry(apiData.countryCode),
                timezone: apiData.timeZones ? apiData.timeZones[0] : '',
                city: apiData.cityName || '',
                clientIP: clientIP,
                source: 'api'
            });
        } else {
            // API returned but no country code
            res.json({
                success: true,
                countryCode: 'US',
                countryName: 'United States',
                phoneCode: '+1',
                language: 'en',
                timezone: '',
                city: '',
                clientIP: clientIP,
                source: 'fallback'
            });
        }
    } catch (error) {
        console.error('Geo detection error:', error);
        // Return fallback data on error
        res.json({
            success: true,
            countryCode: 'US',
            countryName: 'United States',
            phoneCode: '+1',
            language: 'en',
            timezone: '',
            city: '',
            source: 'error-fallback',
            error: error.message
        });
    }
});

module.exports = router;
