/**
 * Tracify Currency Conversion System
 *
 * Professional currency conversion with REAL mathematical conversion
 * Base Currency: USD (not symbol-only replacement)
 * Production-ready | Zero errors | Instant updates
 *
 * @version 2.0.0
 * @author Tracify Team
 */

(function(window) {
    'use strict';

    /**
     * Base Currency: USD
     * All prices in HTML should be marked with data-price-usd attribute
     */
    const BASE_CURRENCY = 'USD';

    /**
     * Exchange Rates (Base: 1 USD =  X target currency)
     * Updated rates - can be replaced with API call
     *
     * CRITICAL: These are REAL exchange rates for mathematical conversion
     */
    const EXCHANGE_RATES = {
        USD: { rate: 1, symbol: '$', name: 'US Dollar', decimals: 2 },
        EUR: { rate: 0.92, symbol: '€', name: 'Euro', decimals: 2 },
        GBP: { rate: 0.79, symbol: '£', name: 'British Pound', decimals: 2 },
        JPY: { rate: 149.50, symbol: '¥', name: 'Japanese Yen', decimals: 0 },
        CNY: { rate: 7.24, symbol: '¥', name: 'Chinese Yuan', decimals: 2 },
        CAD: { rate: 1.36, symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
        AUD: { rate: 1.54, symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
        CHF: { rate: 0.88, symbol: 'Fr', name: 'Swiss Franc', decimals: 2 },
        SEK: { rate: 10.50, symbol: 'kr', name: 'Swedish Krona', decimals: 2 },
        NOK: { rate: 10.80, symbol: 'kr', name: 'Norwegian Krone', decimals: 2 },
        DKK: { rate: 6.86, symbol: 'kr', name: 'Danish Krone', decimals: 2 },
        PLN: { rate: 4.10, symbol: 'zł', name: 'Polish Zloty', decimals: 2 },
        CZK: { rate: 23.45, symbol: 'Kč', name: 'Czech Koruna', decimals: 2 },
        HUF: { rate: 374.50, symbol: 'Ft', name: 'Hungarian Forint', decimals: 0 },
        RON: { rate: 4.58, symbol: 'lei', name: 'Romanian Leu', decimals: 2 },
        RUB: { rate: 92.00, symbol: '₽', name: 'Russian Ruble', decimals: 2 },
        TRY: { rate: 31.50, symbol: '₺', name: 'Turkish Lira', decimals: 2 },
        UAH: { rate: 40.50, symbol: '₴', name: 'Ukrainian Hryvnia', decimals: 2 },
        INR: { rate: 83.20, symbol: '₹', name: 'Indian Rupee', decimals: 2 },
        PKR: { rate: 278.50, symbol: 'Rs', name: 'Pakistani Rupee', decimals: 0 },
        BDT: { rate: 110.50, symbol: '৳', name: 'Bangladeshi Taka', decimals: 2 },
        LKR: { rate: 327.00, symbol: 'Rs', name: 'Sri Lankan Rupee', decimals: 2 },
        IDR: { rate: 15650.00, symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0 },
        THB: { rate: 35.80, symbol: '฿', name: 'Thai Baht', decimals: 2 },
        VND: { rate: 24750.00, symbol: '₫', name: 'Vietnamese Dong', decimals: 0 },
        PHP: { rate: 56.30, symbol: '₱', name: 'Philippine Peso', decimals: 2 },
        MYR: { rate: 4.68, symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2 },
        SGD: { rate: 1.34, symbol: 'S$', name: 'Singapore Dollar', decimals: 2 },
        KRW: { rate: 1325.00, symbol: '₩', name: 'South Korean Won', decimals: 0 },
        HKD: { rate: 7.82, symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2 },
        TWD: { rate: 31.80, symbol: 'NT$', name: 'Taiwan Dollar', decimals: 2 },
        AED: { rate: 3.67, symbol: 'د.إ', name: 'UAE Dirham', decimals: 2 },
        SAR: { rate: 3.75, symbol: 'ر.س', name: 'Saudi Riyal', decimals: 2 },
        KWD: { rate: 0.31, symbol: 'د.ك', name: 'Kuwaiti Dinar', decimals: 3 },
        QAR: { rate: 3.64, symbol: 'ر.ق', name: 'Qatari Riyal', decimals: 2 },
        OMR: { rate: 0.38, symbol: 'ر.ع', name: 'Omani Rial', decimals: 3 },
        NZD: { rate: 1.68, symbol: 'NZ$', name: 'New Zealand Dollar', decimals: 2 },
        MXN: { rate: 20.15, symbol: '$', name: 'Mexican Peso', decimals: 2 },
        BRL: { rate: 5.92, symbol: 'R$', name: 'Brazilian Real', decimals: 2 },
        ARS: { rate: 830.00, symbol: '$', name: 'Argentine Peso', decimals: 2 },
        CLP: { rate: 965.00, symbol: '$', name: 'Chilean Peso', decimals: 0 },
        COP: { rate: 4175.00, symbol: '$', name: 'Colombian Peso', decimals: 0 },
        PEN: { rate: 3.78, symbol: 'S/', name: 'Peruvian Sol', decimals: 2 },
        ZAR: { rate: 18.75, symbol: 'R', name: 'South African Rand', decimals: 2 },
        EGP: { rate: 49.50, symbol: 'E£', name: 'Egyptian Pound', decimals: 2 },
        NGN: { rate: 1545.00, symbol: '₦', name: 'Nigerian Naira', decimals: 2 },
        KES: { rate: 129.50, symbol: 'KSh', name: 'Kenyan Shilling', decimals: 2 },
        MAD: { rate: 10.15, symbol: 'د.م', name: 'Moroccan Dirham', decimals: 2 },
        ILS: { rate: 3.72, symbol: '₪', name: 'Israeli Shekel', decimals: 2 }
    };

    /**
     * State
     */
    let currentCurrency = 'USD';
    let isInitialized = false;

    /**
     * Convert amount from USD to target currency
     * CRITICAL: Real mathematical conversion, NOT symbol-only
     *
     * @param {number} amountUSD - Amount in USD
     * @param {string} targetCurrency - Target currency code
     * @returns {number} Converted amount
     *
     * @example
     * convert(100, 'EUR') // Returns 92.00 (not 100!)
     * convert(100, 'JPY') // Returns 14950 (not 100!)
     */
    function convert(amountUSD, targetCurrency) {
        if (!EXCHANGE_RATES[targetCurrency]) {
            console.error(`❌ Currency not supported: ${targetCurrency}`);
            return amountUSD;
        }

        const { rate, decimals } = EXCHANGE_RATES[targetCurrency];

        // REAL MATHEMATICAL CONVERSION
        const converted = amountUSD * rate;

        // Round to appropriate decimal places
        return Number(converted.toFixed(decimals));
    }

    /**
     * Format amount with currency symbol
     *
     * @param {number} amount - Amount to format
     * @param {string} currencyCode - Currency code
     * @returns {string} Formatted string (e.g., "$100.00", "€92.00")
     */
    function format(amount, currencyCode) {
        if (!EXCHANGE_RATES[currencyCode]) {
            return `${amount}`;
        }

        const { symbol, decimals } = EXCHANGE_RATES[currencyCode];

        // Format with proper decimals
        const formatted = amount.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });

        return `${symbol}${formatted}`;
    }

    /**
     * Convert and format in one step
     *
     * @param {number} amountUSD - Amount in USD
     * @param {string} targetCurrency - Target currency code
     * @returns {string} Formatted converted amount
     *
     * @example
     * convertAndFormat(100, 'EUR') // Returns "€92.00"
     * convertAndFormat(100, 'JPY') // Returns "¥14,950"
     */
    function convertAndFormat(amountUSD, targetCurrency) {
        const converted = convert(amountUSD, targetCurrency);
        return format(converted, targetCurrency);
    }

    /**
     * Update all prices on the page
     * CRITICAL: Elements must have data-price-usd attribute with base USD price
     *
     * This function performs REAL mathematical conversion, not symbol replacement
     * Handles both simple elements and elements with .currency/.amount children
     */
    function updateAllPrices() {
        console.log(`💱 Converting all prices to ${currentCurrency}...`);

        let updatedCount = 0;
        const elements = document.querySelectorAll('[data-price-usd]');

        if (elements.length === 0) {
            console.warn('⚠️ No elements found with data-price-usd attribute');
        }

        const currencyInfo = EXCHANGE_RATES[currentCurrency];

        elements.forEach(element => {
            const usdPrice = parseFloat(element.getAttribute('data-price-usd'));

            if (isNaN(usdPrice)) {
                console.error('❌ Invalid USD price in element:', element);
                return;
            }

            // REAL CONVERSION
            const convertedAmount = convert(usdPrice, currentCurrency);

            // Check if element has .currency and .amount children
            const currencySpan = element.querySelector('.currency');
            const amountSpan = element.querySelector('.amount');

            if (currencySpan && amountSpan) {
                // Update nested elements separately
                currencySpan.textContent = currencyInfo.symbol;
                amountSpan.textContent = convertedAmount.toLocaleString('en-US', {
                    minimumFractionDigits: currencyInfo.decimals,
                    maximumFractionDigits: currencyInfo.decimals
                });
            } else {
                // Simple element - replace entire content
                element.textContent = format(convertedAmount, currentCurrency);
            }

            updatedCount++;
        });

        console.log(`✅ Updated ${updatedCount} prices to ${currentCurrency}`);

        // Log example conversion for debugging
        if (elements.length > 0) {
            const firstElement = elements[0];
            const usdPrice = parseFloat(firstElement.getAttribute('data-price-usd'));
            const convertedAmount = convert(usdPrice, currentCurrency);
            console.log(`   Example: $${usdPrice} USD → ${format(convertedAmount, currentCurrency)}`);
        }
    }

    /**
     * Change currency (NO PAGE RELOAD)
     * Updates all prices instantly
     *
     * @param {string} currencyCode - Currency code
     */
    function changeCurrency(currencyCode) {
        if (!EXCHANGE_RATES[currencyCode]) {
            console.error(`❌ Currency not supported: ${currencyCode}`);
            return;
        }

        console.log(`💱 Changing currency to ${EXCHANGE_RATES[currencyCode].name}...`);

        // Update state
        currentCurrency = currencyCode;

        // Save to localStorage
        try {
            localStorage.setItem('tracify_currency', currencyCode);
        } catch (error) {
            console.warn('Failed to save currency preference:', error);
        }

        // Update all prices
        updateAllPrices();

        // Trigger custom event
        window.dispatchEvent(new CustomEvent('tracifyCurrencyChanged', {
            detail: { currency: currencyCode }
        }));

        console.log(`✅ Currency changed to ${currencyCode}`);
    }

    /**
     * Auto-detect currency from user's country (always use geo-location)
     *
     * @returns {string} Currency code
     */
    function getCurrentCurrency() {
        // ALWAYS use geo-location detection first
        if (window.TracifyCore && typeof window.TracifyCore.getUserCurrency === 'function') {
            const detectedCurrency = window.TracifyCore.getUserCurrency();
            if (detectedCurrency && EXCHANGE_RATES[detectedCurrency]) {
                console.log(`📍 Detected currency from location: ${detectedCurrency}`);
                return detectedCurrency;
            }
        }

        // Default to USD only if detection fails
        console.log('⚠️ Could not detect currency, defaulting to USD');
        return 'USD';
    }

    /**
     * Fetch live exchange rates from API (optional enhancement)
     * Currently using static rates, but this can be connected to a real API
     *
     * @returns {Promise<Object>} Exchange rates
     */
    async function fetchLiveRates() {
        try {
            // Example: Use exchangerate-api.com or similar
            // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            // const data = await response.json();
            // return data.rates;

            // For now, return static rates
            return EXCHANGE_RATES;
        } catch (error) {
            console.warn('Failed to fetch live rates, using static rates:', error);
            return EXCHANGE_RATES;
        }
    }

    /**
     * Initialize currency system
     */
    async function init() {
        if (isInitialized) {
            console.warn('⚠️ Currency system already initialized');
            return;
        }

        console.log('💱 Initializing Tracify Currency System v2.0...');
        console.log(`   Base Currency: ${BASE_CURRENCY}`);

        // Get current currency
        currentCurrency = getCurrentCurrency();
        console.log(`💰 Currency: ${EXCHANGE_RATES[currentCurrency].name} (${currentCurrency})`);

        // Optionally fetch live rates (disabled by default)
        // await fetchLiveRates();

        // Update all prices
        updateAllPrices();

        isInitialized = true;
        console.log('✅ Currency system initialized successfully');
    }

    // Public API
    window.TracifyCurrency = {
        init,
        convert,
        format,
        convertAndFormat,
        changeCurrency,
        updateAllPrices,
        getCurrentCurrency: () => currentCurrency,
        getBaseCurrency: () => BASE_CURRENCY,
        getExchangeRates: () => EXCHANGE_RATES,
        getCurrencyInfo: (code) => EXCHANGE_RATES[code],
        getSupportedCurrencies: () => Object.keys(EXCHANGE_RATES)
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window);
