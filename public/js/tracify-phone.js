/**
 * Tracify Phone Number Localization System
 *
 * FEATURES:
 * - Auto-detects user's country via TracifyCore geo-location
 * - Populates existing select#countryCode with all countries
 * - Auto-selects detected country
 * - Works with existing script.js functionality
 *
 * @version 2.2.0
 * @author Tracify Team
 */

(function(window) {
    'use strict';

    /**
     * Phone codes with flags
     */
    const PHONE_CONFIG = {
        PK: { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
        US: { code: '+1', flag: '🇺🇸', name: 'United States' },
        GB: { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
        CA: { code: '+1', flag: '🇨🇦', name: 'Canada' },
        AU: { code: '+61', flag: '🇦🇺', name: 'Australia' },
        DE: { code: '+49', flag: '🇩🇪', name: 'Germany' },
        FR: { code: '+33', flag: '🇫🇷', name: 'France' },
        IT: { code: '+39', flag: '🇮🇹', name: 'Italy' },
        ES: { code: '+34', flag: '🇪🇸', name: 'Spain' },
        NL: { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
        BE: { code: '+32', flag: '🇧🇪', name: 'Belgium' },
        CH: { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
        SE: { code: '+46', flag: '🇸🇪', name: 'Sweden' },
        NO: { code: '+47', flag: '🇳🇴', name: 'Norway' },
        DK: { code: '+45', flag: '🇩🇰', name: 'Denmark' },
        PL: { code: '+48', flag: '🇵🇱', name: 'Poland' },
        RU: { code: '+7', flag: '🇷🇺', name: 'Russia' },
        TR: { code: '+90', flag: '🇹🇷', name: 'Turkey' },
        CN: { code: '+86', flag: '🇨🇳', name: 'China' },
        JP: { code: '+81', flag: '🇯🇵', name: 'Japan' },
        KR: { code: '+82', flag: '🇰🇷', name: 'South Korea' },
        IN: { code: '+91', flag: '🇮🇳', name: 'India' },
        ID: { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
        TH: { code: '+66', flag: '🇹🇭', name: 'Thailand' },
        VN: { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
        PH: { code: '+63', flag: '🇵🇭', name: 'Philippines' },
        MY: { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
        SG: { code: '+65', flag: '🇸🇬', name: 'Singapore' },
        AE: { code: '+971', flag: '🇦🇪', name: 'UAE' },
        SA: { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
        NZ: { code: '+64', flag: '🇳🇿', name: 'New Zealand' },
        MX: { code: '+52', flag: '🇲🇽', name: 'Mexico' },
        BR: { code: '+55', flag: '🇧🇷', name: 'Brazil' },
        AR: { code: '+54', flag: '🇦🇷', name: 'Argentina' },
        ZA: { code: '+27', flag: '🇿🇦', name: 'South Africa' },
        EG: { code: '+20', flag: '🇪🇬', name: 'Egypt' },
        GR: { code: '+30', flag: '🇬🇷', name: 'Greece' },
        PT: { code: '+351', flag: '🇵🇹', name: 'Portugal' }
    };

    let currentCountry = 'US';

    /**
     * Get current country from TracifyCore
     */
    function getCurrentCountry() {
        if (window.TracifyCore && typeof window.TracifyCore.getUserCountry === 'function') {
            return window.TracifyCore.getUserCountry();
        }
        return 'US';
    }

    /**
     * Populate existing country code select elements
     */
    function populateCountrySelects() {
        const selects = document.querySelectorAll('select#countryCode');

        if (selects.length === 0) {
            console.log('⚠️ No countryCode selects found');
            return;
        }

        // Get detected country
        currentCountry = getCurrentCountry();
        const detectedConfig = PHONE_CONFIG[currentCountry];

        console.log(`📞 Detected country: ${currentCountry} (${detectedConfig ? detectedConfig.code : 'unknown'})`);

        selects.forEach(select => {
            // Clear existing options
            select.innerHTML = '';

            // Sort: detected country first, then alphabetically
            const entries = Object.entries(PHONE_CONFIG);
            const detectedEntry = entries.find(([code]) => code === currentCountry);
            const otherEntries = entries
                .filter(([code]) => code !== currentCountry)
                .sort(([, a], [, b]) => a.name.localeCompare(b.name));

            const sortedEntries = detectedEntry
                ? [detectedEntry, ...otherEntries]
                : entries.sort(([, a], [, b]) => a.name.localeCompare(b.name));

            // Add options
            sortedEntries.forEach(([countryCode, info]) => {
                const option = document.createElement('option');
                option.value = info.code;
                option.textContent = `${info.flag} ${info.code}`;
                option.setAttribute('data-country', countryCode);

                // Select detected country
                if (countryCode === currentCountry) {
                    option.selected = true;
                }

                select.appendChild(option);
            });

            console.log(`✅ Populated country select with ${sortedEntries.length} options`);
        });
    }

    /**
     * Initialize
     */
    function init() {
        console.log('📞 Initializing Tracify Phone Localization...');
        populateCountrySelects();
        console.log('✅ Phone localization initialized');
    }

    // Public API
    window.TracifyPhone = {
        init,
        getCurrentCountry: () => currentCountry,
        getPhoneConfig: (country) => PHONE_CONFIG[country],
        getSupportedCountries: () => Object.keys(PHONE_CONFIG)
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }

})(window);
