/**
 * Tracify Currency Conversion System
 *
 * Features:
 * - Real mathematical conversion (not just symbol changes)
 * - 45+ currencies supported
 * - Auto-detection based on user's country
 * - Base currency: PKR (Pakistani Rupee)
 * - All conversions from base currency
 * - No page reload needed
 * - Persistent currency selection
 */

(function() {
    'use strict';

    // Base currency (all prices in HTML are in PKR)
    const BASE_CURRENCY = 'PKR';

    // Exchange rates (relative to PKR = 1)
    // Updated rates as of 2025
    const EXCHANGE_RATES = {
        PKR: { rate: 1, symbol: 'Rs', name: 'Pakistani Rupee', decimals: 0 },
        USD: { rate: 0.0036, symbol: '$', name: 'US Dollar', decimals: 2 },
        EUR: { rate: 0.0033, symbol: '€', name: 'Euro', decimals: 2 },
        GBP: { rate: 0.0028, symbol: '£', name: 'British Pound', decimals: 2 },
        AED: { rate: 0.013, symbol: 'د.إ', name: 'UAE Dirham', decimals: 2 },
        SAR: { rate: 0.014, symbol: 'ر.س', name: 'Saudi Riyal', decimals: 2 },
        INR: { rate: 0.30, symbol: '₹', name: 'Indian Rupee', decimals: 0 },
        CNY: { rate: 0.026, symbol: '¥', name: 'Chinese Yuan', decimals: 2 },
        JPY: { rate: 0.54, symbol: '¥', name: 'Japanese Yen', decimals: 0 },
        KRW: { rate: 4.80, symbol: '₩', name: 'South Korean Won', decimals: 0 },
        AUD: { rate: 0.0056, symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
        CAD: { rate: 0.0050, symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
        CHF: { rate: 0.0032, symbol: 'Fr', name: 'Swiss Franc', decimals: 2 },
        SEK: { rate: 0.038, symbol: 'kr', name: 'Swedish Krona', decimals: 2 },
        NOK: { rate: 0.039, symbol: 'kr', name: 'Norwegian Krone', decimals: 2 },
        DKK: { rate: 0.025, symbol: 'kr', name: 'Danish Krone', decimals: 2 },
        SGD: { rate: 0.0048, symbol: 'S$', name: 'Singapore Dollar', decimals: 2 },
        HKD: { rate: 0.028, symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2 },
        NZD: { rate: 0.0061, symbol: 'NZ$', name: 'New Zealand Dollar', decimals: 2 },
        MXN: { rate: 0.073, symbol: 'MX$', name: 'Mexican Peso', decimals: 2 },
        BRL: { rate: 0.022, symbol: 'R$', name: 'Brazilian Real', decimals: 2 },
        ZAR: { rate: 0.068, symbol: 'R', name: 'South African Rand', decimals: 2 },
        RUB: { rate: 0.36, symbol: '₽', name: 'Russian Ruble', decimals: 2 },
        TRY: { rate: 0.12, symbol: '₺', name: 'Turkish Lira', decimals: 2 },
        PLN: { rate: 0.015, symbol: 'zł', name: 'Polish Zloty', decimals: 2 },
        THB: { rate: 0.13, symbol: '฿', name: 'Thai Baht', decimals: 2 },
        IDR: { rate: 57, symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0 },
        MYR: { rate: 0.017, symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2 },
        PHP: { rate: 0.21, symbol: '₱', name: 'Philippine Peso', decimals: 2 },
        CZK: { rate: 0.085, symbol: 'Kč', name: 'Czech Koruna', decimals: 2 },
        HUF: { rate: 1.35, symbol: 'Ft', name: 'Hungarian Forint', decimals: 0 },
        RON: { rate: 0.017, symbol: 'lei', name: 'Romanian Leu', decimals: 2 },
        BGN: { rate: 0.0065, symbol: 'лв', name: 'Bulgarian Lev', decimals: 2 },
        HRK: { rate: 0.025, symbol: 'kn', name: 'Croatian Kuna', decimals: 2 },
        ILS: { rate: 0.013, symbol: '₪', name: 'Israeli Shekel', decimals: 2 },
        VND: { rate: 91, symbol: '₫', name: 'Vietnamese Dong', decimals: 0 },
        UAH: { rate: 0.15, symbol: '₴', name: 'Ukrainian Hryvnia', decimals: 2 },
        EGP: { rate: 0.18, symbol: 'E£', name: 'Egyptian Pound', decimals: 2 },
        NGN: { rate: 5.6, symbol: '₦', name: 'Nigerian Naira', decimals: 2 },
        KWD: { rate: 0.0011, symbol: 'د.ك', name: 'Kuwaiti Dinar', decimals: 3 },
        QAR: { rate: 0.013, symbol: 'ر.ق', name: 'Qatari Riyal', decimals: 2 },
        OMR: { rate: 0.0014, symbol: 'ر.ع', name: 'Omani Rial', decimals: 3 },
        BHD: { rate: 0.0014, symbol: 'د.ب', name: 'Bahraini Dinar', decimals: 3 },
        JOD: { rate: 0.0026, symbol: 'د.ا', name: 'Jordanian Dinar', decimals: 3 },
        LKR: { rate: 1.2, symbol: 'Rs', name: 'Sri Lankan Rupee', decimals: 2 },
        BDT: { rate: 0.40, symbol: '৳', name: 'Bangladeshi Taka', decimals: 2 },
        KES: { rate: 0.47, symbol: 'KSh', name: 'Kenyan Shilling', decimals: 2 }
    };

    // Country to currency mapping
    const COUNTRY_CURRENCY_MAP = {
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

    // Timezone to country mapping
    const TIMEZONE_COUNTRY_MAP = {
        'Asia/Karachi': 'PK',
        'America/New_York': 'US', 'America/Chicago': 'US', 'America/Los_Angeles': 'US',
        'Europe/London': 'GB',
        'Asia/Dubai': 'AE',
        'Asia/Riyadh': 'SA',
        'Asia/Kolkata': 'IN',
        'Asia/Shanghai': 'CN', 'Asia/Hong_Kong': 'HK',
        'Europe/Paris': 'FR', 'Europe/Berlin': 'DE', 'Europe/Madrid': 'ES',
        'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL', 'Europe/Lisbon': 'PT',
        'America/Sao_Paulo': 'BR',
        'Europe/Moscow': 'RU',
        'Europe/Istanbul': 'TR',
        'Europe/Warsaw': 'PL',
        'Europe/Prague': 'CZ',
        'Europe/Athens': 'GR',
        'Europe/Budapest': 'HU',
        'Europe/Helsinki': 'FI',
        'Europe/Stockholm': 'SE',
        'Europe/Oslo': 'NO',
        'Europe/Copenhagen': 'DK',
        'Asia/Tokyo': 'JP',
        'Asia/Seoul': 'KR',
        'Asia/Bangkok': 'TH',
        'Asia/Jakarta': 'ID',
        'America/Toronto': 'CA',
        'Australia/Sydney': 'AU'
    };

    // Current state
    let currentCurrency = 'PKR';

    /**
     * Detect user's country from timezone
     */
    function detectCountry() {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            return TIMEZONE_COUNTRY_MAP[timezone] || 'PK';
        } catch (e) {
            console.warn('Failed to detect timezone, defaulting to PK');
            return 'PK';
        }
    }

    /**
     * Get currency for country
     */
    function getCurrencyForCountry(countryCode) {
        return COUNTRY_CURRENCY_MAP[countryCode] || 'PKR';
    }

    /**
     * Get current currency from localStorage or auto-detect
     */
    function getCurrentCurrency() {
        const savedCurrency = localStorage.getItem('tracify_currency');
        if (savedCurrency && EXCHANGE_RATES[savedCurrency]) {
            return savedCurrency;
        }

        // Auto-detect from country
        const country = detectCountry();
        return getCurrencyForCountry(country);
    }

    /**
     * Save currency preference
     */
    function saveCurrency(currencyCode) {
        localStorage.setItem('tracify_currency', currencyCode);
    }

    /**
     * Convert amount from PKR to target currency
     *
     * @param {number} amountInPKR - Amount in Pakistani Rupees
     * @param {string} targetCurrency - Target currency code (e.g., 'USD')
     * @returns {number} - Converted amount
     */
    function convert(amountInPKR, targetCurrency) {
        if (!EXCHANGE_RATES[targetCurrency]) {
            console.error(`Currency ${targetCurrency} not supported`);
            return amountInPKR;
        }

        const rate = EXCHANGE_RATES[targetCurrency].rate;
        const decimals = EXCHANGE_RATES[targetCurrency].decimals;

        // Mathematical conversion: PKR * rate = target currency
        const converted = amountInPKR * rate;

        // Round to appropriate decimal places
        return Number(converted.toFixed(decimals));
    }

    /**
     * Format amount with currency symbol
     *
     * @param {number} amount - The amount to format
     * @param {string} currencyCode - Currency code
     * @returns {string} - Formatted string (e.g., "$10.50")
     */
    function format(amount, currencyCode) {
        if (!EXCHANGE_RATES[currencyCode]) {
            return `${amount}`;
        }

        const { symbol, decimals } = EXCHANGE_RATES[currencyCode];
        const formattedAmount = amount.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });

        return `${symbol}${formattedAmount}`;
    }

    /**
     * Update all prices on the page
     * Elements must have data-price-pkr attribute with base PKR price
     */
    function updateAllPrices() {
        console.log(`💱 Converting all prices to ${currentCurrency}...`);

        let updatedCount = 0;

        // Find all elements with data-price-pkr attribute
        document.querySelectorAll('[data-price-pkr]').forEach(element => {
            const pkrPrice = parseFloat(element.getAttribute('data-price-pkr'));

            if (isNaN(pkrPrice)) {
                console.warn('Invalid PKR price:', element);
                return;
            }

            // Convert to current currency
            const convertedAmount = convert(pkrPrice, currentCurrency);
            const formattedPrice = format(convertedAmount, currentCurrency);

            // Update element content
            element.textContent = formattedPrice;

            updatedCount++;
        });

        console.log(`✅ Updated ${updatedCount} prices to ${currentCurrency}`);
    }

    /**
     * Change currency (NO PAGE RELOAD)
     */
    function changeCurrency(currencyCode) {
        if (!EXCHANGE_RATES[currencyCode]) {
            console.error(`Currency ${currencyCode} not supported`);
            return;
        }

        console.log(`💱 Changing currency to ${EXCHANGE_RATES[currencyCode].name}...`);

        currentCurrency = currencyCode;
        saveCurrency(currencyCode);

        updateAllPrices();

        console.log(`✅ Currency changed to ${currencyCode}`);
    }

    /**
     * Initialize currency system
     */
    function init() {
        console.log('💱 Initializing Tracify currency system...');

        currentCurrency = getCurrentCurrency();
        console.log(`💰 Current currency: ${EXCHANGE_RATES[currentCurrency].name} (${currentCurrency})`);

        updateAllPrices();

        console.log('✅ Currency system initialized successfully');
    }

    // Public API
    window.TracifyCurrency = {
        init,
        convert,
        format,
        changeCurrency,
        updateAllPrices,
        getCurrentCurrency: () => currentCurrency,
        getExchangeRates: () => EXCHANGE_RATES,
        getCurrencyInfo: (code) => EXCHANGE_RATES[code]
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
