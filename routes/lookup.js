const express = require('express');
const router = express.Router();

// Twilio Lookup — uses existing Twilio credentials
// $0.005 per lookup, returns real carrier name + type
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );
}

// Phone number lookup — returns carrier name via Twilio
router.get('/phone', async (req, res) => {
    try {
        const { number } = req.query;

        if (!number || number.replace(/\D/g, '').length < 7) {
            return res.status(400).json({ error: 'Valid phone number required' });
        }

        const cleanNumber = '+' + number.replace(/\D/g, '');

        if (!twilioClient) {
            return res.json({
                success: false,
                fallback: true,
                message: 'Twilio not configured'
            });
        }

        // Twilio Lookup v1 with carrier info
        const result = await twilioClient.lookups.v1
            .phoneNumbers(cleanNumber)
            .fetch({ type: ['carrier'] });

        const carrier = result.carrier;

        res.json({
            success: true,
            valid: true,
            carrier: carrier ? carrier.name : null,
            lineType: carrier ? carrier.type : null,
            country: result.countryCode || null,
            nationalFormat: result.nationalFormat || null
        });
    } catch (error) {
        console.error('Phone lookup error:', error.message);

        // Twilio returns 404 for invalid numbers
        if (error.status === 404) {
            return res.json({
                success: true,
                valid: false,
                carrier: null,
                error: 'Number not found'
            });
        }

        res.json({
            success: false,
            fallback: true,
            error: error.message
        });
    }
});

module.exports = router;
