/**
 * Tracify SEO — server-side meta injection, sitemap, robots.txt
 *
 * Architecture:
 *  - Cache HTML templates in-memory (read once per serverless instance)
 *  - Replace the single `<!--SEO_HEAD-->` marker with a localized <head> block
 *  - Fallback: if marker missing, send template unchanged and log warning
 *  - Noindex pages only get `<meta name="robots" content="noindex, nofollow">` injected before </head>
 *
 * Iron rule: never throw. On any error, send original template.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const schemas = require('./seo-schemas');

const SITE = 'https://tracify-geo.com';
const MARKER = '<!--SEO_HEAD-->';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SEO_DIR = path.join(PUBLIC_DIR, 'translations', 'seo');

// Canonical list of all supported languages (kept in sync with server.js + i18n.js)
const SUPPORTED_LANGUAGES = [
    'cs', 'de', 'en', 'es', 'el', 'fr', 'hu', 'fi', 'et', 'hi',
    'zh_HK', 'th', 'bn', 'ms', 'ko', 'hr', 'id', 'ja', 'sv', 'it',
    'bg', 'sr', 'uk', 'he', 'sk', 'da', 'ar', 'nl', 'no', 'pl',
    'zh', 'pt', 'ro', 'sl', 'tr', 'pt_BR', 'vi', 'bs', 'tk', 'zu',
    'ru', 'lv', 'lt', 'fil', 'zh-TW'
];

const RTL_LANGUAGES = ['ar', 'he'];

// BCP-47 hreflang codes mapped from our internal codes (underscore → dash)
const HREFLANG_MAP = {
    cs: 'cs', de: 'de', en: 'en', es: 'es', el: 'el', fr: 'fr',
    hu: 'hu', fi: 'fi', et: 'et', hi: 'hi',
    zh_HK: 'zh-HK', th: 'th', bn: 'bn', ms: 'ms', ko: 'ko',
    hr: 'hr', id: 'id', ja: 'ja', sv: 'sv', it: 'it',
    bg: 'bg', sr: 'sr', uk: 'uk', he: 'he', sk: 'sk', da: 'da',
    ar: 'ar', nl: 'nl', no: 'no', pl: 'pl',
    zh: 'zh-CN', pt: 'pt', ro: 'ro', sl: 'sl', tr: 'tr',
    pt_BR: 'pt-BR', vi: 'vi', bs: 'bs', tk: 'tk', zu: 'zu',
    ru: 'ru', lv: 'lv', lt: 'lt', fil: 'fil', 'zh-TW': 'zh-TW'
};

// Pages that should appear in sitemap + receive full SEO meta
const INDEXABLE_PAGES = [
    { key: 'home',         bare: '/',                 suffix: '',                 priority: 1.0, changefreq: 'weekly', perLang: true },
    { key: 'howItWorks',   bare: '/how-it-works',     suffix: '/how-it-works',    priority: 0.8, changefreq: 'monthly', perLang: true },
    { key: 'faq',          bare: '/faq',              suffix: '/faq',             priority: 0.8, changefreq: 'monthly', perLang: true },
    { key: 'contact',      bare: '/contact',          suffix: '/contact',         priority: 0.5, changefreq: 'yearly', perLang: true },
    { key: 'privacy',      bare: '/privacy',          suffix: '/privacy',         priority: 0.3, changefreq: 'yearly', perLang: true },
    { key: 'terms',        bare: '/terms',            suffix: '/terms',           priority: 0.3, changefreq: 'yearly', perLang: true },
    // Blog (English only at launch)
    { key: 'blog',         bare: '/blog',             suffix: '/blog',            priority: 0.7, changefreq: 'weekly', perLang: false },
    { key: 'blogPost_howToTrack',      bare: '/blog/how-to-track-a-phone-number',     priority: 0.6, changefreq: 'monthly', perLang: false },
    { key: 'blogPost_comparison',      bare: '/blog/phone-tracker-apps-comparison',   priority: 0.6, changefreq: 'monthly', perLang: false },
    { key: 'blogPost_legality',        bare: '/blog/is-tracking-a-phone-number-legal', priority: 0.6, changefreq: 'monthly', perLang: false },
    { key: 'blogPost_findLost',        bare: '/blog/find-lost-phone-by-number',       priority: 0.6, changefreq: 'monthly', perLang: false },
    { key: 'blogPost_withoutKnowing',  bare: '/blog/track-phone-number-without-them-knowing', priority: 0.6, changefreq: 'monthly', perLang: false },
    { key: 'blogPost_bestApps2026',    bare: '/blog/best-phone-tracker-apps-2026',    priority: 0.6, changefreq: 'monthly', perLang: false },
    { key: 'blogPost_trackOnline',     bare: '/blog/track-phone-location-by-number-online', priority: 0.6, changefreq: 'monthly', perLang: false },
    { key: 'blogPost_findSomeone',     bare: '/blog/find-someone-location-by-phone-number', priority: 0.6, changefreq: 'monthly', perLang: false },
    { key: 'blogPost_trackChild',      bare: '/blog/track-childs-phone',              priority: 0.6, changefreq: 'monthly', perLang: false },
    { key: 'blogPost_lostTurnedOff',   bare: '/blog/find-lost-phone-turned-off',      priority: 0.6, changefreq: 'monthly', perLang: false },
    { key: 'blogPost_stolenPhone',     bare: '/blog/track-stolen-phone',              priority: 0.6, changefreq: 'monthly', perLang: false },
    { key: 'blogPost_beingTracked',    bare: '/blog/how-to-know-if-someone-tracking-your-phone', priority: 0.6, changefreq: 'monthly', perLang: false },
    { key: 'blogPost_lawsByCountry',   bare: '/blog/phone-tracking-laws-by-country',  priority: 0.6, changefreq: 'monthly', perLang: false },
    { key: 'blogPost_howItWorkstech',  bare: '/blog/how-does-phone-tracking-work',    priority: 0.6, changefreq: 'monthly', perLang: false },
    { key: 'blogPost_gpsVsCellTower',  bare: '/blog/gps-tracking-vs-cell-tower',      priority: 0.6, changefreq: 'monthly', perLang: false },
    { key: 'blogPost_vsLife360',       bare: '/blog/tracify-vs-life360',              priority: 0.6, changefreq: 'monthly', perLang: false }
];

const templateCache = new Map();
const seoCache = new Map();
let sitemapCache = null;
let sitemapCachedAt = 0;
const SITEMAP_TTL_MS = 3600 * 1000;

/** HTML-escape a string for safe attribute/content insertion */
function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Load (and cache) HTML template from disk */
function loadTemplate(absPath) {
    if (templateCache.has(absPath)) return templateCache.get(absPath);
    try {
        const html = fs.readFileSync(absPath, 'utf8');
        templateCache.set(absPath, html);
        return html;
    } catch (err) {
        console.error('[seo] failed to read template:', absPath, err.message);
        return null;
    }
}

/** Load (and cache) SEO translations for a language, fallback to English */
function loadSeoStrings(lang) {
    if (seoCache.has(lang)) return seoCache.get(lang);
    const file = path.join(SEO_DIR, `${lang}.json`);
    let data = null;
    try {
        if (fs.existsSync(file)) {
            data = JSON.parse(fs.readFileSync(file, 'utf8'));
        }
    } catch (err) {
        console.warn('[seo] failed to parse', file, err.message);
    }
    if (!data && lang !== 'en') {
        // Fall back to English
        return loadSeoStrings('en');
    }
    if (!data) {
        data = {};
    }
    seoCache.set(lang, data);
    return data;
}

/** Merge page-level SEO data with English fallback for missing keys */
function getPageSeo(lang, pageKey) {
    const locale = loadSeoStrings(lang) || {};
    const english = lang === 'en' ? locale : (loadSeoStrings('en') || {});
    const pageLocale = (locale.pages && locale.pages[pageKey]) || {};
    const pageEn = (english.pages && english.pages[pageKey]) || {};
    return {
        title:       pageLocale.title       || pageEn.title       || 'Tracify',
        description: pageLocale.description || pageEn.description || 'Tracify — phone tracker by number.',
        ogTitle:     pageLocale.ogTitle     || pageEn.ogTitle     || pageLocale.title || pageEn.title,
        ogDesc:      pageLocale.ogDesc      || pageEn.ogDesc      || pageLocale.description || pageEn.description,
        keywords:    pageLocale.keywords    || pageEn.keywords    || '',
        h1:          pageLocale.h1          || pageEn.h1          || '',
        image:       pageLocale.image       || pageEn.image       || `${SITE}/og/default.png`
    };
}

/** Build hreflang alternate <link> tags for a page across all languages */
function buildHreflangLinks(pagePath) {
    const tags = SUPPORTED_LANGUAGES.map(lang => {
        const href = `${SITE}/${lang}${pagePath === '/' ? '' : pagePath}`;
        return `    <link rel="alternate" hreflang="${HREFLANG_MAP[lang] || lang}" href="${href}">`;
    });
    // x-default → English
    const xDefault = `${SITE}/en${pagePath === '/' ? '' : pagePath}`;
    tags.push(`    <link rel="alternate" hreflang="x-default" href="${xDefault}">`);
    return tags.join('\n');
}

/** Safely render a JSON-LD <script> block */
function jsonLdBlock(obj) {
    try {
        // Escape </script> within JSON to avoid breaking out
        const json = JSON.stringify(obj).replace(/<\/script/gi, '<\\/script');
        return `    <script type="application/ld+json">${json}</script>`;
    } catch (err) {
        console.warn('[seo] JSON-LD serialization failed:', err.message);
        return '';
    }
}

/** Build the localized SEO <head> block for a page */
function buildSeoHead({ lang, pageKey, pagePath, schemasFor }) {
    const seo = getPageSeo(lang, pageKey);
    const canonical = `${SITE}/${lang}${pagePath === '/' ? '' : pagePath}`;
    const hreflang = buildHreflangLinks(pagePath);

    const title = escapeHtml(seo.title);
    const desc = escapeHtml(seo.description);
    const keywords = escapeHtml(seo.keywords);
    const ogTitle = escapeHtml(seo.ogTitle);
    const ogDesc = escapeHtml(seo.ogDesc);
    const image = escapeHtml(seo.image);

    const schemaBlocks = (schemasFor || []).map(jsonLdBlock).filter(Boolean).join('\n');

    return `<!-- SEO: server-rendered for ${escapeHtml(lang)}/${escapeHtml(pageKey)} -->
    <title>${title}</title>
    <meta name="description" content="${desc}">
    ${keywords ? `<meta name="keywords" content="${keywords}">` : ''}
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${canonical}">
${hreflang}
    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Tracify">
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${ogDesc}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${image}">
    <meta property="og:locale" content="${escapeHtml((HREFLANG_MAP[lang] || lang).replace('-', '_'))}">
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${ogTitle}">
    <meta name="twitter:description" content="${ogDesc}">
    <meta name="twitter:image" content="${image}">
    <!-- Schema.org JSON-LD -->
${schemaBlocks}`;
}

/** Build a minimal noindex <meta> injection */
function buildNoindexHead() {
    return `<meta name="robots" content="noindex, nofollow">
    <meta name="googlebot" content="noindex, nofollow">
    `;
}

/** Replace <html lang="en"> with the actual lang + dir attributes */
function replaceHtmlLang(html, lang) {
    const dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
    return html.replace(
        /<html\s+lang="[^"]*"[^>]*>/i,
        `<html lang="${escapeHtml(lang)}" dir="${dir}">`
    );
}

/**
 * Prefix bare internal navigation links with the current language.
 * Turns href="/contact" → href="/fr/contact" for lang="fr".
 * Only rewrites known page paths to avoid breaking /api/, /js/, /translations/ etc.
 */
function prefixInternalLinks(html, lang) {
    if (lang === 'en') {
        // For English, still prefix so links are /{lang}/... consistently
    }
    const knownPaths = ['/contact', '/privacy', '/terms', '/how-it-works', '/faq', '/blog'];
    for (const p of knownPaths) {
        // Match href="/contact" but NOT href="/fr/contact" (already prefixed)
        const bare = new RegExp(`href="${p.replace('/', '\\/')}"`, 'g');
        html = html.replace(bare, `href="/${lang}${p}"`);
    }
    // Also rewrite href="/" to href="/{lang}"
    html = html.replace(/href="\/"/g, `href="/${lang}"`);
    // Rewrite href="/#pricing" etc.
    html = html.replace(/href="\/(#[^"]+)"/g, `href="/${lang}/$1"`);
    return html;
}

/** Default schemas per page key */
function defaultSchemasFor(pageKey, lang) {
    const org = schemas.organization();
    const web = schemas.website(HREFLANG_MAP[lang] || lang);
    const breadcrumbHome = { name: 'Home', url: `${SITE}/${lang}` };

    switch (pageKey) {
        case 'home':
            return [org, web, schemas.softwareApplication()];
        case 'howItWorks':
            return [org, web, schemas.breadcrumbList([
                breadcrumbHome,
                { name: 'How It Works', url: `${SITE}/${lang}/how-it-works` }
            ])];
        case 'faq':
            // FAQPage schema will be added separately by the route handler (needs page text)
            return [org, web, schemas.breadcrumbList([
                breadcrumbHome,
                { name: 'FAQ', url: `${SITE}/${lang}/faq` }
            ])];
        case 'contact':
            return [org, web, schemas.breadcrumbList([
                breadcrumbHome,
                { name: 'Contact', url: `${SITE}/${lang}/contact` }
            ]), schemas.contactPage()];
        case 'privacy':
            return [org, schemas.breadcrumbList([
                breadcrumbHome,
                { name: 'Privacy Policy', url: `${SITE}/${lang}/privacy` }
            ])];
        case 'terms':
            return [org, schemas.breadcrumbList([
                breadcrumbHome,
                { name: 'Terms & Conditions', url: `${SITE}/${lang}/terms` }
            ])];
        case 'blog':
            return [org, web, schemas.breadcrumbList([
                breadcrumbHome,
                { name: 'Blog', url: `${SITE}/blog` }
            ]), schemas.collectionPage({
                name: 'Tracify Blog',
                url: `${SITE}/blog`,
                description: 'Guides, comparisons, and tips on phone tracking by number.'
            })];
        default:
            return [org, web];
    }
}

/** Render a localized page — primary entry for route handlers */
function renderLocalizedPage(res, options) {
    const {
        templateFile,
        pageKey,
        pagePath,
        lang = 'en',
        extraSchemas = []
    } = options;

    try {
        const absPath = path.join(PUBLIC_DIR, templateFile);
        const template = loadTemplate(absPath);
        if (!template) {
            return res.sendFile(absPath); // fallback — serve raw file
        }

        if (!template.includes(MARKER)) {
            console.warn(`[seo] marker missing in ${templateFile} — serving unchanged`);
            res.set('Content-Type', 'text/html; charset=utf-8');
            res.set('Cache-Control', 'public, max-age=300');
            return res.send(template);
        }

        const schemasFor = [...defaultSchemasFor(pageKey, lang), ...extraSchemas];
        const head = buildSeoHead({ lang, pageKey, pagePath, schemasFor });

        let html = template.replace(MARKER, head);
        html = replaceHtmlLang(html, lang);
        html = prefixInternalLinks(html, lang);

        res.set('Content-Type', 'text/html; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=300');
        return res.send(html);
    } catch (err) {
        console.error('[seo] renderLocalizedPage failed:', err.message);
        try {
            return res.sendFile(path.join(PUBLIC_DIR, templateFile));
        } catch (e) {
            return res.status(500).send('Server error');
        }
    }
}

/** Render a noindex page — only injects robots meta */
function renderNoindexPage(res, templateFile) {
    try {
        const absPath = path.join(PUBLIC_DIR, templateFile);
        const template = loadTemplate(absPath);
        if (!template) return res.sendFile(absPath);

        // Inject before </head> — works on any HTML file
        const html = template.replace(/<\/head>/i, `    ${buildNoindexHead()}\n</head>`);
        res.set('Content-Type', 'text/html; charset=utf-8');
        res.set('Cache-Control', 'private, max-age=0, no-cache');
        return res.send(html);
    } catch (err) {
        console.error('[seo] renderNoindexPage failed:', err.message);
        try {
            return res.sendFile(path.join(PUBLIC_DIR, templateFile));
        } catch (e) {
            return res.status(500).send('Server error');
        }
    }
}

/** Build an XML sitemap URL entry with hreflang alternates */
function sitemapEntry({ loc, priority, changefreq, alternates }) {
    let xml = `  <url>\n`;
    xml += `    <loc>${escapeHtml(loc)}</loc>\n`;
    if (changefreq) xml += `    <changefreq>${changefreq}</changefreq>\n`;
    if (priority != null) xml += `    <priority>${priority.toFixed(1)}</priority>\n`;
    if (alternates) {
        for (const alt of alternates) {
            xml += `    <xhtml:link rel="alternate" hreflang="${escapeHtml(alt.hreflang)}" href="${escapeHtml(alt.href)}"/>\n`;
        }
    }
    xml += `  </url>\n`;
    return xml;
}

/** Build the full sitemap.xml string (cached) */
function buildSitemap() {
    const now = Date.now();
    if (sitemapCache && (now - sitemapCachedAt) < SITEMAP_TTL_MS) {
        return sitemapCache;
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    for (const page of INDEXABLE_PAGES) {
        if (page.perLang) {
            // One entry per language with full hreflang alternates + x-default
            const alternates = SUPPORTED_LANGUAGES.map(l => ({
                hreflang: HREFLANG_MAP[l] || l,
                href: `${SITE}/${l}${page.suffix}`
            }));
            alternates.push({
                hreflang: 'x-default',
                href: `${SITE}/en${page.suffix}`
            });
            for (const lang of SUPPORTED_LANGUAGES) {
                xml += sitemapEntry({
                    loc: `${SITE}/${lang}${page.suffix}`,
                    priority: page.priority,
                    changefreq: page.changefreq,
                    alternates
                });
            }
        } else {
            xml += sitemapEntry({
                loc: `${SITE}${page.bare}`,
                priority: page.priority,
                changefreq: page.changefreq,
                alternates: null
            });
        }
    }

    xml += `</urlset>\n`;

    sitemapCache = xml;
    sitemapCachedAt = now;
    return xml;
}

/** robots.txt contents */
const ROBOTS_TXT = `User-agent: *
Disallow: /admin
Disallow: /admin/
Disallow: /dashboard
Disallow: /account
Disallow: /payment
Disallow: /payment-success
Disallow: /cancel
Disallow: /test-payment.html
Disallow: /blocked.html
Disallow: /*/dashboard
Disallow: /*/account
Disallow: /*/payment
Disallow: /*/payment-success
Disallow: /*/cancel

Sitemap: ${SITE}/sitemap.xml
`;

module.exports = {
    SUPPORTED_LANGUAGES,
    RTL_LANGUAGES,
    HREFLANG_MAP,
    INDEXABLE_PAGES,
    SITE,
    MARKER,
    escapeHtml,
    buildSeoHead,
    buildNoindexHead,
    buildSitemap,
    renderLocalizedPage,
    renderNoindexPage,
    ROBOTS_TXT,
    getPageSeo,
    loadSeoStrings,
    defaultSchemasFor,
    jsonLdBlock
};
