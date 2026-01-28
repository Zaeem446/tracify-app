const express = require('express');
const db = require('../database/db');

const router = express.Router();

// In-memory cache
let cachedScript = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function invalidateCache() {
    cachedScript = null;
    cacheTimestamp = 0;
}

function generatePixelsScript(pixels) {
    if (!pixels || pixels.length === 0) {
        return '/* No active tracking tags */';
    }

    const googleTags = pixels.filter(p => p.tag_type === 'google_tag');
    const metaPixels = pixels.filter(p => p.tag_type === 'meta_pixel');
    const customScripts = pixels.filter(p => p.tag_type === 'custom_script');

    let script = '/* Tracify Dynamic Tags */\n';

    // Google Tags
    if (googleTags.length > 0) {
        const firstId = googleTags[0].pixel_id;
        script += `
if(!window.__tracify_gtag_loaded){
window.__tracify_gtag_loaded=true;
var s=document.createElement('script');
s.async=true;
s.src='https://www.googletagmanager.com/gtag/js?id=${firstId}';
document.head.appendChild(s);
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('js',new Date());
`;
        googleTags.forEach(tag => {
            script += `gtag('config','${tag.pixel_id}');\n`;
        });
        script += `}\n`;
    }

    // Meta Pixels
    if (metaPixels.length > 0) {
        script += `
if(!window.__tracify_fbq_loaded){
window.__tracify_fbq_loaded=true;
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
`;
        metaPixels.forEach(tag => {
            script += `fbq('init','${tag.pixel_id}');\n`;
        });
        script += `fbq('track','PageView');\n}\n`;
    }

    // Custom Scripts
    customScripts.forEach(tag => {
        script += `\ntry{${tag.custom_code}}catch(e){console.error('Tracify custom script error (${tag.name.replace(/'/g, "\\'")}):',e);}\n`;
    });

    return script;
}

// Public endpoint: serve active pixels as JavaScript
router.get('/active', async (req, res) => {
    try {
        const now = Date.now();
        if (cachedScript && (now - cacheTimestamp) < CACHE_TTL) {
            res.set('Content-Type', 'application/javascript');
            res.set('Cache-Control', 'public, max-age=300');
            return res.send(cachedScript);
        }

        const pixels = await db.pixels.getActive();
        const script = generatePixelsScript(pixels);

        cachedScript = script;
        cacheTimestamp = now;

        res.set('Content-Type', 'application/javascript');
        res.set('Cache-Control', 'public, max-age=300');
        res.send(script);
    } catch (error) {
        console.error('Pixels active endpoint error:', error);
        res.set('Content-Type', 'application/javascript');
        res.send('/* Error loading tracking tags */');
    }
});

module.exports = router;
module.exports.invalidateCache = invalidateCache;
