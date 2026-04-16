/**
 * Tracify Internationalization (i18n) System
 * 
 * Features:
 * - 45 languages support
 * - Auto-detection from URL path, browser language, or timezone
 * - URL-based routing (/en, /tr, /de, etc.)
 * - Fallback to English for unsupported languages
 */

(function(window) {
    'use strict';

    // Supported languages with their codes and names
    const SUPPORTED_LANGUAGES = {
        cs: { name: 'Čeština', native: 'Čeština' },
        de: { name: 'German', native: 'Deutsch' },
        en: { name: 'English', native: 'English' },
        es: { name: 'Spanish', native: 'Español' },
        el: { name: 'Greek', native: 'Ελληνικά' },
        fr: { name: 'French', native: 'Français' },
        hu: { name: 'Hungarian', native: 'Magyar' },
        fi: { name: 'Finnish', native: 'Suomalainen' },
        et: { name: 'Estonian', native: 'Eesti keel' },
        hi: { name: 'Hindi', native: 'हिंदी' },
        zh_HK: { name: 'Cantonese', native: '粵語' },
        'zh-TW': { name: 'Chinese (Taiwan)', native: '繁體中文' },
        th: { name: 'Thai', native: 'แบบไทย' },
        bn: { name: 'Bengali', native: 'বাংলা' },
        ms: { name: 'Malay', native: 'Melayu' },
        ko: { name: 'Korean', native: '한국인' },
        hr: { name: 'Croatian', native: 'Hrvatski' },
        id: { name: 'Indonesian', native: 'Bahasa Indonesia' },
        ja: { name: 'Japanese', native: '日本語' },
        sv: { name: 'Swedish', native: 'Svenska' },
        it: { name: 'Italian', native: 'Italiano' },
        bg: { name: 'Bulgarian', native: 'Български' },
        sr: { name: 'Serbian', native: 'Српски' },
        uk: { name: 'Ukrainian', native: 'Yкраїнська' },
        he: { name: 'Hebrew', native: 'עִברִית' },
        sk: { name: 'Slovak', native: 'Slovenský' },
        da: { name: 'Danish', native: 'Dansk' },
        ar: { name: 'Arabic', native: 'عربي' },
        nl: { name: 'Dutch', native: 'Nederlands' },
        no: { name: 'Norwegian', native: 'Norsk' },
        pl: { name: 'Polish', native: 'Polski' },
        zh: { name: 'Chinese', native: '普通话' },
        pt: { name: 'Portuguese', native: 'Português' },
        ro: { name: 'Romanian', native: 'Română' },
        sl: { name: 'Slovenian', native: 'Slovenščina' },
        tr: { name: 'Turkish', native: 'Türk' },
        pt_BR: { name: 'Portuguese (Brazil)', native: 'Português(BR)' },
        vi: { name: 'Vietnamese', native: 'Tiếng Việt' },
        bs: { name: 'Bosnian', native: 'Bosanski' },
        tk: { name: 'Turkmen', native: 'Türkmençe' },
        zu: { name: 'Zulu', native: 'isiZulu' },
        ru: { name: 'Russian', native: 'Русский' },
        lv: { name: 'Latvian', native: 'Latviešu' },
        lt: { name: 'Lithuanian', native: 'Lietuvių' },
        fil: { name: 'Filipino', native: 'Filipino' }
    };

    // RTL languages
    const RTL_LANGUAGES = ['ar', 'he'];

    // Timezone to language mapping
    const TIMEZONE_LANG_MAP = {
        'Europe/Prague': 'cs',
        'Europe/Berlin': 'de',
        'Europe/Vienna': 'de',
        'Europe/Zurich': 'de',
        'America/New_York': 'en',
        'America/Chicago': 'en',
        'America/Los_Angeles': 'en',
        'America/Denver': 'en',
        'Europe/London': 'en',
        'Europe/Madrid': 'es',
        'America/Mexico_City': 'es',
        'America/Argentina/Buenos_Aires': 'es',
        'Europe/Athens': 'el',
        'Europe/Paris': 'fr',
        'Europe/Budapest': 'hu',
        'Europe/Helsinki': 'fi',
        'Europe/Tallinn': 'et',
        'Asia/Kolkata': 'hi',
        'Asia/Hong_Kong': 'zh_HK',
        'Asia/Bangkok': 'th',
        'Asia/Dhaka': 'bn',
        'Asia/Kuala_Lumpur': 'ms',
        'Asia/Seoul': 'ko',
        'Europe/Zagreb': 'hr',
        'Asia/Jakarta': 'id',
        'Asia/Tokyo': 'ja',
        'Europe/Stockholm': 'sv',
        'Europe/Rome': 'it',
        'Europe/Sofia': 'bg',
        'Europe/Belgrade': 'sr',
        'Europe/Kiev': 'uk',
        'Asia/Jerusalem': 'he',
        'Europe/Bratislava': 'sk',
        'Europe/Copenhagen': 'da',
        'Asia/Riyadh': 'ar',
        'Asia/Dubai': 'ar',
        'Europe/Amsterdam': 'nl',
        'Europe/Oslo': 'no',
        'Europe/Warsaw': 'pl',
        'Asia/Shanghai': 'zh',
        'Asia/Chongqing': 'zh',
        'Asia/Taipei': 'zh-TW',
        'Europe/Lisbon': 'pt',
        'Europe/Bucharest': 'ro',
        'Europe/Ljubljana': 'sl',
        'Europe/Istanbul': 'tr',
        'America/Sao_Paulo': 'pt_BR',
        'Asia/Ho_Chi_Minh': 'vi',
        'Europe/Sarajevo': 'bs',
        'Asia/Ashgabat': 'tk',
        'Africa/Johannesburg': 'zu',
        'Europe/Moscow': 'ru',
        'Europe/Riga': 'lv',
        'Europe/Vilnius': 'lt',
        'Asia/Manila': 'fil',
        'Asia/Karachi': 'en',
        'Australia/Sydney': 'en',
        'Pacific/Auckland': 'en'
    };

    // Timezone to country calling code mapping
    const TIMEZONE_COUNTRY_CODE = {
        // North America
        'America/New_York': '+1',
        'America/Chicago': '+1',
        'America/Los_Angeles': '+1',
        'America/Denver': '+1',
        'America/Toronto': '+1',
        'America/Vancouver': '+1',
        // UK & Ireland
        'Europe/London': '+44',
        'Europe/Dublin': '+353',
        // Western Europe
        'Europe/Paris': '+33',
        'Europe/Berlin': '+49',
        'Europe/Vienna': '+43',
        'Europe/Zurich': '+41',
        'Europe/Amsterdam': '+31',
        'Europe/Brussels': '+32',
        'Europe/Luxembourg': '+352',
        // Southern Europe
        'Europe/Madrid': '+34',
        'Europe/Rome': '+39',
        'Europe/Lisbon': '+351',
        'Europe/Athens': '+30',
        // Northern Europe
        'Europe/Stockholm': '+46',
        'Europe/Oslo': '+47',
        'Europe/Copenhagen': '+45',
        'Europe/Helsinki': '+358',
        // Eastern Europe
        'Europe/Warsaw': '+48',
        'Europe/Prague': '+420',
        'Europe/Budapest': '+36',
        'Europe/Bucharest': '+40',
        'Europe/Sofia': '+359',
        'Europe/Kiev': '+380',
        'Europe/Moscow': '+7',
        'Europe/Tallinn': '+372',
        'Europe/Riga': '+371',
        'Europe/Vilnius': '+370',
        'Europe/Bratislava': '+421',
        'Europe/Ljubljana': '+386',
        'Europe/Zagreb': '+385',
        'Europe/Belgrade': '+381',
        'Europe/Sarajevo': '+387',
        // Turkey
        'Europe/Istanbul': '+90',
        // Middle East
        'Asia/Dubai': '+971',
        'Asia/Riyadh': '+966',
        'Asia/Jerusalem': '+972',
        'Asia/Kuwait': '+965',
        'Asia/Qatar': '+974',
        'Asia/Bahrain': '+973',
        'Asia/Muscat': '+968',
        // South Asia
        'Asia/Karachi': '+92',
        'Asia/Kolkata': '+91',
        'Asia/Dhaka': '+880',
        'Asia/Colombo': '+94',
        'Asia/Kathmandu': '+977',
        // Southeast Asia
        'Asia/Bangkok': '+66',
        'Asia/Ho_Chi_Minh': '+84',
        'Asia/Jakarta': '+62',
        'Asia/Kuala_Lumpur': '+60',
        'Asia/Singapore': '+65',
        'Asia/Manila': '+63',
        'Asia/Yangon': '+95',
        'Asia/Phnom_Penh': '+855',
        // East Asia
        'Asia/Tokyo': '+81',
        'Asia/Seoul': '+82',
        'Asia/Shanghai': '+86',
        'Asia/Chongqing': '+86',
        'Asia/Hong_Kong': '+852',
        'Asia/Taipei': '+886',
        // Central Asia
        'Asia/Ashgabat': '+993',
        'Asia/Tashkent': '+998',
        'Asia/Almaty': '+7',
        // Oceania
        'Australia/Sydney': '+61',
        'Australia/Melbourne': '+61',
        'Australia/Perth': '+61',
        'Pacific/Auckland': '+64',
        // Africa
        'Africa/Johannesburg': '+27',
        'Africa/Cairo': '+20',
        'Africa/Lagos': '+234',
        'Africa/Nairobi': '+254',
        'Africa/Casablanca': '+212',
        'Africa/Algiers': '+213',
        'Africa/Tunis': '+216',
        // Latin America
        'America/Mexico_City': '+52',
        'America/Sao_Paulo': '+55',
        'America/Argentina/Buenos_Aires': '+54',
        'America/Santiago': '+56',
        'America/Bogota': '+57',
        'America/Lima': '+51',
        'America/Caracas': '+58'
    };

    let currentLang = 'en';
    let translations = {};

    /**
     * Get language from URL path (e.g., /en, /tr, /de, /pt_BR)
     */
    function getLangFromURL() {
        const path = window.location.pathname;
        // Match language codes like /en, /tr, /pt_BR, /zh_HK
        const match = path.match(/^\/([a-z]{2,3}(?:_[A-Z]{2})?)(\/|$)/);
        if (match && SUPPORTED_LANGUAGES[match[1]]) {
            return match[1];
        }
        return null;
    }

    /**
     * Get language from browser settings
     */
    function getLangFromBrowser() {
        const browserLang = navigator.language || navigator.userLanguage;
        if (!browserLang) return null;

        // Try exact match first (e.g., pt-BR -> pt_BR)
        const exactMatch = browserLang.replace('-', '_');
        if (SUPPORTED_LANGUAGES[exactMatch]) {
            return exactMatch;
        }

        // Try base language (e.g., pt-BR -> pt)
        const baseLang = browserLang.split('-')[0].toLowerCase();
        if (SUPPORTED_LANGUAGES[baseLang]) {
            return baseLang;
        }

        return null;
    }

    /**
     * Get language from timezone
     */
    function getLangFromTimezone() {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            return TIMEZONE_LANG_MAP[timezone] || null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Get country calling code from timezone
     */
    function getCountryCodeFromTimezone() {
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            return TIMEZONE_COUNTRY_CODE[timezone] || '+1'; // Default to US
        } catch (e) {
            return '+1';
        }
    }

    /**
     * Get detected country code (checks localStorage first, then timezone)
     */
    function getDetectedCountryCode() {
        // Check if user has saved preference
        const saved = localStorage.getItem('tracify_country_code');
        if (saved) {
            return saved;
        }
        // Auto-detect from timezone
        return getCountryCodeFromTimezone();
    }

    /**
     * Save country code preference
     */
    function saveCountryCode(code) {
        localStorage.setItem('tracify_country_code', code);
    }

    /**
     * Detect the best language for the user
     */
    function detectLanguage() {
        // Priority: URL > Saved preference > Browser > Timezone > English
        const urlLang = getLangFromURL();
        if (urlLang) return urlLang;

        const savedLang = localStorage.getItem('tracify_lang');
        if (savedLang && SUPPORTED_LANGUAGES[savedLang]) return savedLang;

        return getLangFromBrowser() || getLangFromTimezone() || 'en';
    }

    /**
     * Detect language using IP geolocation (async)
     */
    async function detectLanguageAsync() {
        // Priority: URL > Saved preference > IP Geo > Browser > Timezone > English
        const urlLang = getLangFromURL();
        if (urlLang) return urlLang;

        const savedLang = localStorage.getItem('tracify_lang');
        if (savedLang && SUPPORTED_LANGUAGES[savedLang]) return savedLang;

        // Try IP geolocation if available
        if (window.TracifyGeo) {
            try {
                const geoLang = await window.TracifyGeo.getDetectedLanguage();
                if (geoLang && SUPPORTED_LANGUAGES[geoLang]) {
                    return geoLang;
                }
            } catch (e) {
                console.warn('Geo language detection failed:', e);
            }
        }

        return getLangFromBrowser() || getLangFromTimezone() || 'en';
    }

    /**
     * Load translation file
     */
    async function loadTranslations(lang) {
        try {
            const response = await fetch(`/translations/${lang}.json`);
            if (!response.ok) throw new Error('Translation not found');
            translations = await response.json();
            return true;
        } catch (error) {
            console.warn(`Failed to load ${lang} translations, falling back to English`);
            if (lang !== 'en') {
                try {
                    const response = await fetch('/translations/en.json');
                    translations = await response.json();
                    return true;
                } catch (e) {
                    console.error('Failed to load fallback translations');
                    return false;
                }
            }
            return false;
        }
    }

    // Cache for SEO translations (per lang) to avoid refetching
    const seoCache = {};

    /**
     * Derive the SEO page key from the current URL path.
     * Mirrors the server-side mapping in utils/seo.js.
     */
    function getSeoPageKeyFromPath() {
        let path = window.location.pathname || '/';
        // Strip language prefix (e.g. /en, /pt_BR, /zh-TW)
        path = path.replace(/^\/([a-z]{2}(?:[_-][A-Za-z]{2})?)(?=\/|$)/, '') || '/';
        if (path === '' || path === '/') return 'home';
        if (path === '/how-it-works') return 'howItWorks';
        if (path === '/faq') return 'faq';
        if (path === '/contact') return 'contact';
        if (path === '/privacy') return 'privacy';
        if (path === '/terms') return 'terms';
        if (path === '/blog' || path === '/blog/') return 'blog';
        if (path === '/blog/how-to-track-a-phone-number') return 'blogPost_howToTrack';
        if (path === '/blog/phone-tracker-apps-comparison') return 'blogPost_comparison';
        if (path === '/blog/is-tracking-a-phone-number-legal') return 'blogPost_legality';
        if (path === '/blog/find-lost-phone-by-number') return 'blogPost_findLost';
        return null;
    }

    /**
     * Fetch SEO meta JSON for a language (with in-memory cache + English fallback).
     */
    async function loadSeoMeta(lang) {
        if (seoCache[lang]) return seoCache[lang];
        try {
            const response = await fetch(`/translations/seo/${lang}.json`);
            if (!response.ok) throw new Error('SEO meta not found');
            const data = await response.json();
            seoCache[lang] = data;
            return data;
        } catch (e) {
            if (lang !== 'en') {
                try {
                    const response = await fetch('/translations/seo/en.json');
                    const data = await response.json();
                    seoCache[lang] = data;
                    return data;
                } catch (_) {
                    return null;
                }
            }
            return null;
        }
    }

    /**
     * Update <title> and <meta description> for the current page/lang.
     * Non-fatal — if anything fails, leaves server-rendered values untouched.
     */
    async function applySeoMetaForLang(lang) {
        try {
            const pageKey = getSeoPageKeyFromPath();
            if (!pageKey) return;
            const seo = await loadSeoMeta(lang);
            if (!seo || !seo.pages) return;
            const page = seo.pages[pageKey] || (seoCache.en && seoCache.en.pages && seoCache.en.pages[pageKey]);
            if (!page) return;
            if (page.title) document.title = page.title;
            if (page.description) {
                let metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) metaDesc.setAttribute('content', page.description);
            }
        } catch (e) {
            console.warn('Failed to apply SEO meta for lang', lang, e);
        }
    }

    /**
     * Get translation for a key (supports nested keys like "nav.login")
     */
    function t(key) {
        const keys = key.split('.');
        let value = translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }

        return value || key;
    }

    /**
     * Apply translations to all elements with data-i18n attribute
     */
    function translatePage() {
        // Translate text content
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = t(key);

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                }
            } else {
                // Check if it's HTML content
                if (translation.includes('<')) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = t(key);
        });
    }

    /**
     * Set text direction (LTR or RTL)
     */
    function setTextDirection() {
        if (RTL_LANGUAGES.includes(currentLang)) {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.style.direction = 'rtl';
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.style.direction = 'ltr';
        }
    }

    /**
     * Update URL to include language code
     */
    function updateURL(lang) {
        const currentPath = window.location.pathname;
        const match = currentPath.match(/^\/([a-z]{2}(?:_[A-Z]{2})?)(\/.*)?$/);
        
        let newPath;
        if (match) {
            // Replace existing language code
            newPath = `/${lang}${match[2] || ''}`;
        } else if (currentPath === '/') {
            newPath = `/${lang}`;
        } else {
            newPath = `/${lang}${currentPath}`;
        }

        if (newPath !== currentPath) {
            window.history.replaceState({}, '', newPath);
        }
    }

    /**
     * Change language
     */
    async function changeLanguage(lang) {
        if (!SUPPORTED_LANGUAGES[lang]) {
            console.error(`Language ${lang} not supported`);
            return;
        }

        currentLang = lang;
        localStorage.setItem('tracify_lang', lang);

        await loadTranslations(lang);
        translatePage();
        setTextDirection();
        updateURL(lang);
        // Keep <title> + meta description in sync with the selected language
        applySeoMetaForLang(lang);

        // Update language selector if exists
        const langSelector = document.getElementById('langSelector');
        if (langSelector) {
            langSelector.value = lang;
        }

        // Dispatch event
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    /**
     * Create language selector dropdown
     */
    function createLanguageSelector() {
        const navRight = document.querySelector('.nav-right');
        if (!navRight || document.getElementById('tracifyLangButton')) return;

        // Language flag emojis
        const FLAGS = {
            ar: '🇸🇦', bg: '🇧🇬', bn: '🇧🇩', bs: '🇧🇦', cs: '🇨🇿', da: '🇩🇰',
            de: '🇩🇪', el: '🇬🇷', en: '🇬🇧', es: '🇪🇸', et: '🇪🇪', fi: '🇫🇮',
            fil: '🇵🇭', fr: '🇫🇷', he: '🇮🇱', hi: '🇮🇳', hr: '🇭🇷', hu: '🇭🇺',
            id: '🇮🇩', it: '🇮🇹', ja: '🇯🇵', ko: '🇰🇷', lt: '🇱🇹', lv: '🇱🇻',
            ms: '🇲🇾', nl: '🇳🇱', no: '🇳🇴', pl: '🇵🇱', pt: '🇵🇹', pt_BR: '🇧🇷',
            ro: '🇷🇴', ru: '🇷🇺', sk: '🇸🇰', sl: '🇸🇮', sr: '🇷🇸', sv: '🇸🇪',
            th: '🇹🇭', tk: '🇹🇲', tr: '🇹🇷', uk: '🇺🇦', vi: '🇻🇳', zh: '🇨🇳',
            zh_HK: '🇭🇰', 'zh-TW': '🇹🇼', zu: '🇿🇦'
        };

        const wrapper = document.createElement('div');
        wrapper.className = 'tracify-lang-wrapper';
        wrapper.innerHTML = `
            <button id="tracifyLangButton" class="tracify-lang-button" aria-label="Select Language">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span id="currentLangText">${FLAGS[currentLang] || '🌐'} ${SUPPORTED_LANGUAGES[currentLang].native}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 8L1 3h10z"/>
                </svg>
            </button>
            <div id="tracifyLangDropdown" class="tracify-lang-dropdown">
                <div class="tracify-lang-search">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input type="text" id="langSearchInput" placeholder="Search languages..." />
                </div>
                <div class="tracify-lang-list">
                    ${Object.entries(SUPPORTED_LANGUAGES)
                        .sort((a, b) => a[1].native.localeCompare(b[1].native))
                        .map(([code, info]) => `
                            <div class="tracify-lang-item${code === currentLang ? ' active' : ''}" data-lang="${code}" data-search="${info.native.toLowerCase()} ${info.name.toLowerCase()}">
                                <span class="lang-flag">${FLAGS[code] || '🌐'}</span>
                                <div class="lang-info">
                                    <span class="lang-native">${info.native}</span>
                                    <span class="lang-name">${info.name}</span>
                                </div>
                                ${code === currentLang ? '<svg class="lang-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                            </div>
                        `).join('')}
                </div>
            </div>
        `;

        // Add CSS
        const style = document.createElement('style');
        style.textContent = `
            .tracify-lang-wrapper {
                position: relative;
                margin-right: 15px;
            }

            .tracify-lang-button {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                color: #333;
                font-size: 0.95rem;
                font-weight: 500;
                font-family: 'Inter', sans-serif;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
            }

            .tracify-lang-button:hover {
                border-color: #4CAF50;
                background: #f8faf8;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
            }

            .tracify-lang-button svg:first-child {
                color: #4CAF50;
            }

            .tracify-lang-button svg:last-child {
                color: #999;
                transition: transform 0.3s ease;
            }

            .tracify-lang-button.active svg:last-child {
                transform: rotate(180deg);
            }

            .tracify-lang-dropdown {
                display: none;
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                width: 380px;
                max-height: 500px;
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                overflow: hidden;
                animation: slideDown 0.3s ease;
            }

            .tracify-lang-dropdown.show {
                display: flex;
                flex-direction: column;
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .tracify-lang-search {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 16px;
                border-bottom: 1px solid #e0e0e0;
                background: #f8faf8;
            }

            .tracify-lang-search svg {
                color: #999;
                flex-shrink: 0;
            }

            .tracify-lang-search input {
                flex: 1;
                border: none;
                background: transparent;
                outline: none;
                font-size: 0.9rem;
                font-family: 'Inter', sans-serif;
                color: #333;
            }

            .tracify-lang-search input::placeholder {
                color: #999;
            }

            .tracify-lang-list {
                overflow-y: auto;
                max-height: 420px;
            }

            .tracify-lang-list::-webkit-scrollbar {
                width: 8px;
            }

            .tracify-lang-list::-webkit-scrollbar-track {
                background: #f1f1f1;
            }

            .tracify-lang-list::-webkit-scrollbar-thumb {
                background: #4CAF50;
                border-radius: 4px;
            }

            .tracify-lang-list::-webkit-scrollbar-thumb:hover {
                background: #388E3C;
            }

            .tracify-lang-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-left: 3px solid transparent;
            }

            .tracify-lang-item:hover {
                background: #f8faf8;
                border-left-color: #4CAF50;
            }

            .tracify-lang-item.active {
                background: #e8f5e9;
                border-left-color: #4CAF50;
            }

            .tracify-lang-item.hidden {
                display: none;
            }

            .lang-flag {
                font-size: 1.5rem;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .lang-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .lang-native {
                font-size: 0.95rem;
                font-weight: 600;
                color: #333;
            }

            .lang-name {
                font-size: 0.8rem;
                color: #999;
            }

            .lang-check {
                flex-shrink: 0;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .tracify-lang-wrapper {
                    margin-right: 10px;
                }

                .tracify-lang-button {
                    padding: 8px 12px;
                    font-size: 0.85rem;
                }

                .tracify-lang-button span {
                    max-width: 100px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .tracify-lang-dropdown {
                    width: 320px;
                    right: -10px;
                }
            }

            @media (max-width: 480px) {
                .tracify-lang-dropdown {
                    width: calc(100vw - 40px);
                    right: -20px;
                }
            }
        `;
        document.head.appendChild(style);

        navRight.insertBefore(wrapper, navRight.firstChild);

        // Add event listeners
        const button = document.getElementById('tracifyLangButton');
        const dropdown = document.getElementById('tracifyLangDropdown');
        const searchInput = document.getElementById('langSearchInput');

        // Toggle dropdown
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('show');
            dropdown.classList.toggle('show');
            button.classList.toggle('active');
            if (!isOpen) {
                searchInput.focus();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                dropdown.classList.remove('show');
                button.classList.remove('active');
            }
        });

        // Search functionality
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.tracify-lang-item').forEach(item => {
                const searchText = item.getAttribute('data-search');
                if (searchText.includes(query)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });

        // Language selection
        document.querySelectorAll('.tracify-lang-item').forEach(item => {
            item.addEventListener('click', async () => {
                const lang = item.getAttribute('data-lang');

                // Update active state
                document.querySelectorAll('.tracify-lang-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Close dropdown
                dropdown.classList.remove('show');
                button.classList.remove('active');

                // Change language
                await changeLanguage(lang);

                // Update button text
                const FLAGS = {
                    ar: '🇸🇦', bg: '🇧🇬', bn: '🇧🇩', bs: '🇧🇦', cs: '🇨🇿', da: '🇩🇰',
                    de: '🇩🇪', el: '🇬🇷', en: '🇬🇧', es: '🇪🇸', et: '🇪🇪', fi: '🇫🇮',
                    fil: '🇵🇭', fr: '🇫🇷', he: '🇮🇱', hi: '🇮🇳', hr: '🇭🇷', hu: '🇭🇺',
                    id: '🇮🇩', it: '🇮🇹', ja: '🇯🇵', ko: '🇰🇷', lt: '🇱🇹', lv: '🇱🇻',
                    ms: '🇲🇾', nl: '🇳🇱', no: '🇳🇴', pl: '🇵🇱', pt: '🇵🇹', pt_BR: '🇧🇷',
                    ro: '🇷🇴', ru: '🇷🇺', sk: '🇸🇰', sl: '🇸🇮', sr: '🇷🇸', sv: '🇸🇪',
                    th: '🇹🇭', tk: '🇹🇲', tr: '🇹🇷', uk: '🇺🇦', vi: '🇻🇳', zh: '🇨🇳',
                    zh_HK: '🇭🇰', 'zh-TW': '🇹🇼', zu: '🇿🇦'
                };
                document.getElementById('currentLangText').textContent = `${FLAGS[lang] || '🌐'} ${SUPPORTED_LANGUAGES[lang].native}`;
            });
        });
    }

    /**
     * Update internal links to include current language prefix
     */
    function updateInternalLinks() {
        document.querySelectorAll('a[href^="/"]').forEach(link => {
            const href = link.getAttribute('href');
            // Skip if already has language prefix or is an API/asset link
            if (href.startsWith('/api/') || href.startsWith('/translations/') ||
                href.startsWith('/js/') || href.startsWith('/css/') ||
                href.match(/^\/[a-z]{2,3}(?:_[A-Z]{2})?\//)) {
                return;
            }
            // Skip hash links
            if (href === '/' || href.startsWith('/#')) {
                const newHref = href === '/' ? `/${currentLang}` : `/${currentLang}${href.substring(1)}`;
                link.setAttribute('href', newHref);
            } else if (!href.match(/^\/[a-z]{2,3}(?:_[A-Z]{2})?$/)) {
                // Add language prefix
                link.setAttribute('href', `/${currentLang}${href}`);
            }
        });
    }

    /**
     * Initialize i18n system
     */
    async function init() {
        // First check URL and saved preference (sync)
        let detectedLang = detectLanguage();

        // Check if we need to redirect to language URL
        const urlLang = getLangFromURL();
        if (!urlLang && window.location.pathname === '/') {
            // Try async geo detection for better accuracy on first visit
            if (window.TracifyGeo && !localStorage.getItem('tracify_lang')) {
                try {
                    const geoLang = await detectLanguageAsync();
                    if (geoLang) detectedLang = geoLang;
                } catch (e) {
                    console.warn('Async language detection failed:', e);
                }
            }
            // Redirect to detected language URL
            window.location.replace(`/${detectedLang}`);
            return;
        }

        // For pages with URL lang, use async detection to potentially update
        if (!localStorage.getItem('tracify_lang') && window.TracifyGeo) {
            try {
                const geoLang = await detectLanguageAsync();
                if (geoLang && SUPPORTED_LANGUAGES[geoLang] && geoLang !== detectedLang) {
                    detectedLang = geoLang;
                }
            } catch (e) {
                // Ignore errors, use sync detection
            }
        }

        currentLang = detectedLang;

        // Load translations
        await loadTranslations(currentLang);

        // Apply translations
        translatePage();
        setTextDirection();

        // Update internal links to preserve language
        updateInternalLinks();

        // Create language selector
        createLanguageSelector();

        console.log(`i18n initialized: ${currentLang}`);
    }

    // Public API
    window.TracifyI18n = {
        init,
        t,
        changeLanguage,
        getCurrentLang: () => currentLang,
        getSupportedLanguages: () => SUPPORTED_LANGUAGES,
        translatePage,
        getDetectedCountryCode,
        saveCountryCode
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window);
