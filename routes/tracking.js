const express = require('express');
const db = require('../database/db');
const { sendTrackingConsentRequest } = require('../utils/email');

const router = express.Router();

// Middleware to check customer authentication and subscription
async function requireActiveSubscription(req, res, next) {
    const sessionToken = req.cookies.session_token;

    if (!sessionToken) {
        return res.status(401).json({ error: 'Please login to continue' });
    }

    const session = await db.sessions.findByToken(sessionToken);
    if (!session) {
        return res.status(401).json({ error: 'Session expired. Please login again.' });
    }

    const subscription = await db.subscriptions.findActiveByCustomerId(session.customer_id);
    if (!subscription) {
        return res.status(403).json({ error: 'Active subscription required', redirectTo: '/payment' });
    }

    req.customerId = session.customer_id;
    req.customerEmail = session.email;
    req.subscription = subscription;
    next();
}

// Request location tracking (send SMS to target)
router.post('/request', requireActiveSubscription, async (req, res) => {
    try {
        const { phoneNumber, countryCode, customMessage } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        if (!/^[\d\s-]{7,15}$/.test(phoneNumber)) {
            return res.status(400).json({ error: 'Please enter a valid phone number (7-15 digits)' });
        }

        // Rate limit check: 1 SMS per 3 hours
        const lastRequestTime = await db.tracking.getLastRequestTime(req.customerId);
        if (lastRequestTime) {
            const hoursSinceLastRequest = (Date.now() - new Date(lastRequestTime).getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastRequest < 3) {
                const minutesRemaining = Math.ceil((3 - hoursSinceLastRequest) * 60);
                return res.status(429).json({
                    error: `Due to security and privacy reasons, you can only send a message once every 3 hours. Please wait ${minutesRemaining} minutes.`
                });
            }
        }

        // Create tracking request record
        const result = await db.tracking.create(
            req.customerId,
            phoneNumber,
            countryCode || '+92'
        );

        const trackingId = result.lastInsertRowid;
        const fullPhone = `${countryCode || '+92'}${phoneNumber}`;

        // Send SMS — routed to Twilio (US/CA) or Routee (international)
        await sendTrackingConsentRequest(fullPhone, req.customerEmail, customMessage, trackingId, countryCode || '+92');

        res.json({
            success: true,
            trackingId,
            message: `Location request SMS sent to ${fullPhone}`,
            status: 'pending'
        });

    } catch (error) {
        console.error('Tracking request error:', error);
        res.status(500).json({ error: 'Failed to send tracking request' });
    }
});

// Get customer's tracking history
router.get('/history', requireActiveSubscription, async (req, res) => {
    try {
        const requests = await db.tracking.getByCustomerId(req.customerId);
        res.json({ requests });
    } catch (error) {
        console.error('Tracking history error:', error);
        res.status(500).json({ error: 'Failed to fetch tracking history' });
    }
});

// Consent endpoint (called when target clicks consent link)
// This is a public endpoint that the SMS recipient clicks
router.get('/consent/:trackingId', async (req, res) => {
    try {
        const trackingId = req.params.trackingId;

        // Check if tracking request exists and its status
        const trackingRequest = await db.tracking.getById(trackingId);

        // If tracking request doesn't exist, show invalid link page
        if (!trackingRequest) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invalid Link - Tracify</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; }
                        .card { background: #f5f5f5; padding: 30px; border-radius: 10px; text-align: center; }
                        h1 { color: #f44336; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>❌ Invalid Link</h1>
                        <p>This link is invalid or has expired.</p>
                        <p>Please contact the person who sent you this link.</p>
                    </div>
                </body>
                </html>
            `);
        }

        // If location already shared, show expired link page
        if (trackingRequest.consent_given === 1) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Link Expired - Tracify</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; }
                        .card { background: #f5f5f5; padding: 30px; border-radius: 10px; text-align: center; }
                        h1 { color: #ff9800; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>⏰ Link Expired</h1>
                        <p>This location sharing link has already been used.</p>
                        <p>The location was shared successfully.</p>
                    </div>
                </body>
                </html>
            `);
        }

        // Show consent form (link is valid and not yet used)
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Location Sharing Consent - Tracify</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; }
                    .card { background: #f5f5f5; padding: 30px; border-radius: 10px; text-align: center; }
                    h1 { color: #4CAF50; }
                    .btn { display: inline-block; padding: 15px 30px; margin: 10px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
                    .btn-accept { background: #4CAF50; color: white; }
                    .btn-decline { background: #f44336; color: white; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>📍 Location Sharing Request</h1>
                    <p>Someone has requested to know your location using Tracify.</p>
                    <p>By clicking "Share Location", you consent to sharing your current GPS coordinates.</p>
                    <br>
                    <button class="btn btn-accept" onclick="shareLocation()">Share My Location</button>
                    <button class="btn btn-decline" onclick="decline()">Decline</button>
                </div>
                <script>
                    function shareLocation() {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                function(position) {
                                    fetch('/api/tracking/consent/${trackingId}', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            lat: position.coords.latitude,
                                            lng: position.coords.longitude
                                        })
                                    }).then(() => {
                                        document.body.innerHTML = '<div class="card"><h1>✅ Location Shared</h1><p>Your location has been shared successfully.</p></div>';
                                    });
                                },
                                function(error) {
                                    alert('Could not get your location. Please enable location services.');
                                }
                            );
                        } else {
                            alert('Geolocation is not supported by your browser.');
                        }
                    }
                    function decline() {
                        document.body.innerHTML = '<div class="card"><h1>Location Not Shared</h1><p>You declined to share your location.</p></div>';
                    }
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Consent page error:', error);
        res.status(500).send('Error loading consent page');
    }
});

// Process consent (when user shares location)
router.post('/consent/:trackingId', async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const trackingId = req.params.trackingId;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Location coordinates required' });
        }

        // Check if tracking request exists
        const trackingRequest = await db.tracking.getById(trackingId);

        if (!trackingRequest) {
            return res.status(404).json({ error: 'Invalid tracking request' });
        }

        // Check if location was already shared
        if (trackingRequest.consent_given === 1) {
            return res.status(400).json({ error: 'Location has already been shared for this request' });
        }

        await db.tracking.updateConsent(trackingId, lat, lng);

        res.json({
            success: true,
            message: 'Location shared successfully'
        });

    } catch (error) {
        console.error('Consent processing error:', error);
        res.status(500).json({ error: 'Failed to process consent' });
    }
});

// Get specific tracking request status
router.get('/status/:trackingId', requireActiveSubscription, async (req, res) => {
    try {
        const requests = await db.tracking.getByCustomerId(req.customerId);
        const request = requests.find(r => r.id === parseInt(req.params.trackingId));

        if (!request) {
            return res.status(404).json({ error: 'Tracking request not found' });
        }

        res.json({
            id: request.id,
            phoneNumber: request.phone_number,
            status: request.status,
            consentGiven: request.consent_given === 1,
            location: request.consent_given ? {
                lat: request.location_lat,
                lng: request.location_lng
            } : null,
            createdAt: request.created_at,
            consentAt: request.consent_at
        });

    } catch (error) {
        console.error('Tracking status error:', error);
        res.status(500).json({ error: 'Failed to fetch tracking status' });
    }
});

module.exports = router;
