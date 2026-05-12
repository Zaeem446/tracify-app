const twilio = require('twilio');

let twilioClient = null;

// Routee OAuth2 token cache
let routeeTokenCache = { token: null, expiresAt: 0 };

// Caribbean +1 area codes that are NOT US/CA — route to Routee
const CARIBBEAN_PLUS1_CODES = [
    '242','246','264','268','284','340','345',
    '441','473','649','664','721','758','767',
    '784','787','809','829','849','868','869',
    '876','939'
];

function getTwilioClient() {
    if (twilioClient) return twilioClient;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
        console.log('Twilio not configured - SMS will be logged only');
        return null;
    }

    twilioClient = twilio(accountSid, authToken);
    return twilioClient;
}

/**
 * Determine if a +1 number is truly US/CA or a Caribbean territory.
 * Caribbean +1 numbers have specific 3-digit area codes after +1.
 */
function isUSorCA(countryCode, phoneNumber) {
    if (countryCode !== '+1') return false;

    // Check if the phone number starts with a Caribbean area code
    const areaCode = (phoneNumber || '').replace(/\D/g, '').substring(0, 3);
    if (CARIBBEAN_PLUS1_CODES.includes(areaCode)) {
        return false; // Caribbean — use Routee
    }

    return true; // Genuine US/CA
}

/**
 * Get an OAuth2 access token from Routee, with caching.
 * Tokens are cached until 5 minutes before expiry.
 */
async function getRouteeToken() {
    // Return cached token if still valid (with 5-min safety margin)
    if (routeeTokenCache.token && Date.now() < routeeTokenCache.expiresAt) {
        return routeeTokenCache.token;
    }

    const appId = process.env.ROUTEE_APP_ID;
    const appSecret = process.env.ROUTEE_APP_SECRET;

    if (!appId || !appSecret) {
        return null;
    }

    const credentials = Buffer.from(`${appId}:${appSecret}`).toString('base64');

    const response = await fetch('https://auth.routee.net/oauth/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Routee auth failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    routeeTokenCache.token = data.access_token;
    // Cache until 5 minutes before expiry
    routeeTokenCache.expiresAt = Date.now() + (data.expires_in - 300) * 1000;

    return data.access_token;
}

/**
 * Send SMS via Routee REST API with alphanumeric sender "Tracify".
 */
async function sendSMSViaRoutee(to, message) {
    const token = await getRouteeToken();

    if (!token) {
        // Fallback: log to console when Routee not configured
        console.log('\n========== SMS (Routee not configured) ==========');
        console.log('To:', to);
        console.log('Message:', message);
        console.log('==================================================\n');
        return { success: true, trackingId: 'mock-routee-' + Date.now(), logged: true };
    }

    const response = await fetch('https://connect.routee.net/sms', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            body: message,
            to: to,
            from: 'Tracify'
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Routee SMS failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('SMS sent via Routee. Tracking ID:', data.trackingId);
    return { success: true, trackingId: data.trackingId };
}

/**
 * Send SMS routed by country code:
 *   +1 (US/CA) → Twilio
 *   Everything else (including Caribbean +1 codes) → Routee
 */
async function sendSMS(to, message, countryCode) {
    // Route +1 US/CA to Twilio, everything else to Routee
    if (isUSorCA(countryCode, to.replace(countryCode || '', ''))) {
        return sendSMSViaTwilio(to, message);
    }
    return sendSMSViaRoutee(to, message);
}

/**
 * Send SMS via Twilio (US/CA only).
 */
async function sendSMSViaTwilio(to, message) {
    const client = getTwilioClient();
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!client || !from) {
        // Fallback: log to console when Twilio not configured
        console.log('\n========== SMS (Twilio not configured) ==========');
        console.log('To:', to);
        console.log('Message:', message);
        console.log('=================================================\n');
        return { success: true, sid: 'mock-' + Date.now(), logged: true };
    }

    try {
        const result = await client.messages.create({
            body: message,
            from: from,
            to: to
        });
        console.log('SMS sent via Twilio. SID:', result.sid);
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error('Twilio SMS Error:', error.message);
        throw error;
    }
}

module.exports = { sendSMS };
