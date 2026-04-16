/**
 * One-off generator: expands /public/translations/<lang>.json for all 44 non-English languages
 * with the new `howItWorksPage`, `faqPage` namespaces and additional `footer` nav keys.
 *
 * Source of truth: /public/translations/en.json (already contains the canonical English copy).
 *
 * Strategy:
 *   1. Read each lang JSON.
 *   2. Deep-merge the pre-authored TRANSLATIONS[lang] object into it (adds / overwrites matching keys only).
 *   3. Write back with 2-space indent + trailing newline (matches existing format).
 *
 * If a language is missing from TRANSLATIONS, we fall back to English so render never breaks.
 *
 * Run: node scripts/expand-content-translations.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const TRANSLATIONS_DIR = path.join(__dirname, '..', 'public', 'translations');

// English canonical source — kept here as a fallback and a reference for translators.
const EN = require(path.join(TRANSLATIONS_DIR, 'en.json'));

const EN_SNAPSHOT = {
    howItWorksPage: EN.howItWorksPage,
    faqPage: EN.faqPage,
    footerAdditions: {
        navHome: EN.footer.navHome,
        navHowItWorks: EN.footer.navHowItWorks,
        navFaq: EN.footer.navFaq,
        navBlog: EN.footer.navBlog,
        navContact: EN.footer.navContact,
        navPrivacy: EN.footer.navPrivacy,
        navTerms: EN.footer.navTerms,
        operatedBy: EN.footer.operatedBy
    }
};

// Languages supported (must match utils/seo.js SUPPORTED_LANGUAGES excluding 'en').
const LANGS = [
    'ar', 'bg', 'bn', 'bs', 'cs', 'da', 'de', 'el', 'es', 'et',
    'fi', 'fil', 'fr', 'he', 'hi', 'hr', 'hu', 'id', 'it', 'ja',
    'ko', 'lt', 'lv', 'ms', 'nl', 'no', 'pl', 'pt', 'pt_BR', 'ro',
    'ru', 'sk', 'sl', 'sr', 'sv', 'th', 'tk', 'tr', 'uk', 'vi',
    'zh', 'zh-TW', 'zh_HK', 'zu'
];

// --------------------------------------------------------------------------
// TRANSLATIONS — professional translations per language.
// Structure per lang: { howItWorksPage: {...}, faqPage: {...}, footerAdditions: {...} }
// Missing keys/langs fall back to English automatically.
// --------------------------------------------------------------------------
const TRANSLATIONS = {
    // Populated by scripts/translation-buckets/*.js (one file per language family)
    // Loaded below.
};

// Load per-language bucket files (each exports { <lang>: { howItWorksPage, faqPage, footerAdditions } }).
const BUCKET_DIR = path.join(__dirname, 'translation-buckets');
if (fs.existsSync(BUCKET_DIR)) {
    for (const file of fs.readdirSync(BUCKET_DIR)) {
        if (!file.endsWith('.js')) continue;
        const bucket = require(path.join(BUCKET_DIR, file));
        Object.assign(TRANSLATIONS, bucket);
    }
}

function applyTranslations(langData, langCode) {
    const t = TRANSLATIONS[langCode];
    const hip = (t && t.howItWorksPage) ? t.howItWorksPage : EN_SNAPSHOT.howItWorksPage;
    const fqp = (t && t.faqPage) ? t.faqPage : EN_SNAPSHOT.faqPage;
    const fa  = (t && t.footerAdditions) ? t.footerAdditions : EN_SNAPSHOT.footerAdditions;

    // Merge each new namespace; for howItWorksPage / faqPage we create or overwrite wholesale
    // (no collision with existing howItWorks / faq keys — different namespaces).
    langData.howItWorksPage = Object.assign({}, EN_SNAPSHOT.howItWorksPage, hip);
    langData.faqPage        = Object.assign({}, EN_SNAPSHOT.faqPage, fqp);

    // Footer: merge additions without wiping pre-existing keys.
    langData.footer = Object.assign({}, langData.footer || {}, {
        navHome:        fa.navHome        || EN_SNAPSHOT.footerAdditions.navHome,
        navHowItWorks:  fa.navHowItWorks  || EN_SNAPSHOT.footerAdditions.navHowItWorks,
        navFaq:         fa.navFaq         || EN_SNAPSHOT.footerAdditions.navFaq,
        navBlog:        fa.navBlog        || EN_SNAPSHOT.footerAdditions.navBlog,
        navContact:     fa.navContact     || EN_SNAPSHOT.footerAdditions.navContact,
        navPrivacy:     fa.navPrivacy     || EN_SNAPSHOT.footerAdditions.navPrivacy,
        navTerms:       fa.navTerms       || EN_SNAPSHOT.footerAdditions.navTerms,
        operatedBy:     fa.operatedBy     || EN_SNAPSHOT.footerAdditions.operatedBy
    });

    return langData;
}

function main() {
    let written = 0;
    let fellBack = 0;

    for (const lang of LANGS) {
        const file = path.join(TRANSLATIONS_DIR, `${lang}.json`);
        if (!fs.existsSync(file)) {
            console.warn(`[SKIP] missing: ${lang}.json`);
            continue;
        }

        const raw = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(raw);
        const hasTranslations = !!TRANSLATIONS[lang];

        applyTranslations(data, lang);

        fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
        written++;
        if (!hasTranslations) {
            fellBack++;
            console.log(`[EN-FALLBACK] ${lang} — no translations bucket found, using English`);
        } else {
            console.log(`[OK] ${lang}`);
        }
    }

    console.log(`\nDone: ${written} files updated, ${fellBack} fell back to English.`);
}

main();
