/**
 * Injects the `seoIntro` key into each language's translation file.
 * - Reads the translation bucket at scripts/translation-buckets/seo-intro-all.js
 * - For each of the 44 non-English language files in public/translations,
 *   reads the JSON, inserts `seoIntro` immediately after the `hero` key,
 *   and writes back with 2-space indent.
 * - Falls back to English (en.json) `seoIntro` block if a translation is missing.
 *
 * Run: node scripts/add-seo-intro.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TRANS_DIR = path.join(ROOT, 'public', 'translations');
const BUCKET = require('./translation-buckets/seo-intro-all.js');
const EN = JSON.parse(fs.readFileSync(path.join(TRANS_DIR, 'en.json'), 'utf8'));
const EN_SEO_INTRO = EN.seoIntro;

const LANGS = [
    'ar','bg','bn','bs','cs','da','de','el','es','et',
    'fi','fil','fr','he','hi','hr','hu','id','it','ja',
    'ko','lt','lv','ms','nl','no','pl','pt','pt_BR','ro',
    'ru','sk','sl','sr','sv','th','tk','tr','uk','vi',
    'zh','zh-TW','zh_HK','zu'
];

/**
 * Re-build a plain object inserting `seoIntro` right after `hero`,
 * preserving the order of all other keys exactly as-is.
 */
function injectSeoIntro(obj, seoIntro) {
    const out = {};
    const keys = Object.keys(obj);
    for (const k of keys) {
        if (k === 'seoIntro') continue; // drop stale copy if one existed
        out[k] = obj[k];
        if (k === 'hero') {
            out.seoIntro = seoIntro;
        }
    }
    // Safety: if there was no `hero` key (unlikely), append at the end.
    if (!('seoIntro' in out)) {
        out.seoIntro = seoIntro;
    }
    return out;
}

function mergeWithFallback(bucketEntry) {
    // Bucket entry shape: { seoIntro: { title, lede, body, linkHow, linkFaq, linkGuide } }
    const provided = (bucketEntry && bucketEntry.seoIntro) || {};
    const merged = {};
    for (const key of Object.keys(EN_SEO_INTRO)) {
        merged[key] = (provided[key] !== undefined && provided[key] !== null && provided[key] !== '')
            ? provided[key]
            : EN_SEO_INTRO[key];
    }
    return merged;
}

const fallbacks = [];
let processed = 0;

for (const lang of LANGS) {
    const file = path.join(TRANS_DIR, `${lang}.json`);
    if (!fs.existsSync(file)) {
        console.warn(`[skip] missing file: ${file}`);
        continue;
    }

    const raw = fs.readFileSync(file, 'utf8');
    let data;
    try {
        data = JSON.parse(raw);
    } catch (err) {
        console.error(`[error] invalid JSON in ${file}: ${err.message}`);
        continue;
    }

    const bucketEntry = BUCKET[lang];
    const seoIntro = mergeWithFallback(bucketEntry);

    // Track fallbacks: if ANY field fell back to English, record which.
    const providedKeys = (bucketEntry && bucketEntry.seoIntro) ? Object.keys(bucketEntry.seoIntro) : [];
    const missingKeys = Object.keys(EN_SEO_INTRO).filter(k => !providedKeys.includes(k)
        || bucketEntry.seoIntro[k] === '' || bucketEntry.seoIntro[k] == null);
    if (!bucketEntry) {
        fallbacks.push({ lang, reason: 'no bucket entry' });
    } else if (missingKeys.length > 0) {
        fallbacks.push({ lang, missing: missingKeys });
    }

    const updated = injectSeoIntro(data, seoIntro);
    const json = JSON.stringify(updated, null, 2) + '\n';
    fs.writeFileSync(file, json, 'utf8');
    processed++;
}

console.log(`Processed ${processed} files.`);
if (fallbacks.length === 0) {
    console.log('No fallbacks — every language has a native translation for all 6 keys.');
} else {
    console.log('Fallbacks to English:');
    for (const f of fallbacks) console.log('  -', JSON.stringify(f));
}
