const twilio = require('twilio');

let twilioClient = null;

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

async function sendSMS(to, message) {
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
        console.log('SMS sent successfully. SID:', result.sid);
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error('Twilio SMS Error:', error.message);
        throw error;
    }
}

module.exports = { sendSMS };
