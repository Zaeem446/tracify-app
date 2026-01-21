const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Cancel subscription from cancel page
// This checks if user has active subscription, if yes shows success (will be handled manually via admin/Zendesk)
// If no account or no active subscription, shows error
router.post('/cancel', (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if customer exists
        const customer = db.customers.findByEmail(email);

        if (!customer) {
            return res.status(404).json({
                error: "You don't have an account with us. Please check the email address and try again."
            });
        }

        // Check if customer has active subscription
        const hasActiveSub = db.customers.hasActiveSubscription(email);

        if (!hasActiveSub) {
            return res.status(404).json({
                error: "You don't have an active subscription. Your subscription may have already been cancelled or expired."
            });
        }

        // Has active subscription - return success
        // Actual cancellation will be done manually via admin panel after Zendesk ticket
        res.json({
            success: true,
            message: 'Your ticket has been submitted. Our customer representative will contact you on your email to process your cancellation request.'
        });

    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ error: 'Failed to process cancellation request. Please try again or contact support.' });
    }
});

// Cancel subscription from dashboard (customer self-service) - deletes account
router.post('/cancel-account', (req, res) => {
    try {
        const sessionToken = req.cookies.session_token;

        if (!sessionToken) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const session = db.sessions.findByToken(sessionToken);
        if (!session) {
            return res.status(401).json({ error: 'Session expired' });
        }

        // Delete the customer account completely
        db.customers.delete(session.customer_id);

        // Clear the session cookie
        res.clearCookie('session_token');

        res.json({
            success: true,
            message: 'Your account and subscription have been cancelled successfully.'
        });

    } catch (error) {
        console.error('Cancel account error:', error);
        res.status(500).json({ error: 'Failed to cancel account. Please try again or contact support.' });
    }
});

module.exports = router;
