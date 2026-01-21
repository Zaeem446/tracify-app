const express = require('express');
const router = express.Router();
const { sendContactForm } = require('../utils/email');

// Contact form submission
router.post('/send', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Send email to support@tracify-geo.com
        await sendContactForm({ name, email, subject, message });

        console.log('\n📧 NEW CONTACT MESSAGE SENT TO SUPPORT:');
        console.log('From:', name, `<${email}>`);
        console.log('Subject:', subject);
        console.log('Time:', new Date().toLocaleString());
        console.log('-----------------------------------\n');

        res.json({
            success: true,
            message: 'Message sent successfully! We will respond within 24 hours.'
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;
