const nodemailer = require('nodemailer');
const { sendSMS } = require('./sms');

let transporter = null;
let testAccount = null;

async function getTransporter() {
    if (transporter) return transporter;

    // Check if real SMTP credentials are configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log('Using configured SMTP server');
        return transporter;
    }

    // In production without SMTP, return null (will log instead of sending)
    console.log('SMTP not configured - emails will be logged only');
    return null;
}

async function sendPasswordEmail(email, password) {
    const transport = await getTransporter();

    const mailOptions = {
        from: process.env.SMTP_FROM || '"Tracify" <noreply@tracify.com>',
        to: email,
        subject: 'Welcome to Tracify - Your Account Password',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .password-box { background: white; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                    .password { font-size: 28px; font-weight: bold; color: #2E7D32; letter-spacing: 3px; }
                    .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Tracify!</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>Your Tracify account has been created successfully. Here is your password to access your account:</p>

                        <div class="password-box">
                            <p style="margin: 0 0 10px 0; color: #666;">Your Password</p>
                            <div class="password">${password}</div>
                        </div>

                        <p><strong>Important:</strong> Please save this password in a secure place. You'll need it to log in to your account in the future.</p>

                        <p>You can now complete your subscription and start tracking phone locations with consent.</p>

                        <center>
                            <a href="${process.env.APP_URL || 'http://localhost:3000'}/login" class="button">Login to Tracify</a>
                        </center>

                        <div class="footer">
                            <p>If you didn't create this account, please ignore this email.</p>
                            <p>&copy; ${new Date().getFullYear()} Tracify. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Welcome to Tracify!

Your account has been created successfully.

Your Password: ${password}

Please save this password in a secure place. You'll need it to log in to your account in the future.

Login at: ${process.env.APP_URL || 'http://localhost:3000'}/login

If you didn't create this account, please ignore this email.

© ${new Date().getFullYear()} Tracify. All rights reserved.
        `
    };

    const info = await transport.sendMail(mailOptions);

    // If using Ethereal, log the preview URL
    if (testAccount) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('\n📧 EMAIL SENT!');
        console.log('To:', email);
        console.log('Password:', password);
        console.log('Preview URL:', previewUrl);
        console.log('(Open this URL to view the email)\n');
    }

    return info;
}

async function sendResetPasswordEmail(email, password) {
    const transport = await getTransporter();

    const mailOptions = {
        from: process.env.SMTP_FROM || '"Tracify" <noreply@tracify.com>',
        to: email,
        subject: 'Tracify - Your Password Has Been Reset',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .password-box { background: white; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                    .password { font-size: 28px; font-weight: bold; color: #2E7D32; letter-spacing: 3px; }
                    .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>Your password has been reset. Here is your new password:</p>

                        <div class="password-box">
                            <p style="margin: 0 0 10px 0; color: #666;">Your New Password</p>
                            <div class="password">${password}</div>
                        </div>

                        <p><strong>Important:</strong> Please save this password in a secure place. You'll need it to log in to your account.</p>

                        <center>
                            <a href="${process.env.APP_URL || 'http://localhost:3000'}/login" class="button">Login to Tracify</a>
                        </center>

                        <div class="footer">
                            <p>If you didn't request this reset, please contact support.</p>
                            <p>&copy; ${new Date().getFullYear()} Tracify. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Password Reset

Your password has been reset.

Your New Password: ${password}

Please save this password in a secure place. You'll need it to log in to your account.

Login at: ${process.env.APP_URL || 'http://localhost:3000'}/login

If you didn't request this reset, please contact support.

© ${new Date().getFullYear()} Tracify. All rights reserved.
        `
    };

    const info = await transport.sendMail(mailOptions);

    if (testAccount) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('\n📧 PASSWORD RESET EMAIL SENT!');
        console.log('To:', email);
        console.log('New Password:', password);
        console.log('Preview URL:', previewUrl);
        console.log('(Open this URL to view the email)\n');
    }

    return info;
}

async function sendTrackingConsentRequest(recipientPhone, senderEmail, customMessage, trackingId, countryCode) {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const consentLink = `${appUrl}/api/tracking/consent/${trackingId}`;

    // Build SMS message with tracking link
    const smsMessage = `${customMessage || 'Someone wants to know your location.'}\n\nClick here to respond: ${consentLink}`;

    console.log('\n========== SMS TRACKING REQUEST ==========');
    console.log('To Phone:', recipientPhone);
    console.log('Requested by:', senderEmail);
    console.log('Link:', consentLink);
    console.log('==========================================\n');

    // Send actual SMS via Twilio
    // Send SMS — routed to Twilio (US/CA) or Routee (international)
    const result = await sendSMS(recipientPhone, smsMessage, countryCode);
    return result;
}

async function sendContactForm(formData) {
    const transport = await getTransporter();
    const { name, email, subject, message } = formData;

    const subjectMap = {
        'technical': 'Technical Support',
        'billing': 'Billing Question',
        'feature': 'Feature Request',
        'feedback': 'General Feedback',
        'other': 'Other'
    };

    // If SMTP not configured, just log and return success
    if (!transport) {
        console.log('\n📧 CONTACT FORM RECEIVED (SMTP not configured - logged only):');
        console.log('From:', name, `<${email}>`);
        console.log('Subject:', subjectMap[subject] || subject);
        console.log('Message:', message);
        console.log('Time:', new Date().toLocaleString());
        return { logged: true };
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || '"Tracify Contact Form" <noreply@tracify-geo.com>',
        to: 'support@tracify-geo.com',
        replyTo: email,
        subject: `[${subjectMap[subject] || subject}] New Contact Form Submission from ${name}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; border-left: 4px solid #4CAF50; padding: 15px; margin: 15px 0; }
                    .label { font-weight: bold; color: #2E7D32; }
                    .message-box { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #ddd; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>📧 New Contact Form Submission</h2>
                    </div>
                    <div class="content">
                        <div class="info-box">
                            <p><span class="label">From:</span> ${name}</p>
                            <p><span class="label">Email:</span> <a href="mailto:${email}">${email}</a></p>
                            <p><span class="label">Subject:</span> ${subjectMap[subject] || subject}</p>
                            <p><span class="label">Time:</span> ${new Date().toLocaleString()}</p>
                        </div>

                        <div class="message-box">
                            <p class="label">Message:</p>
                            <p style="white-space: pre-wrap;">${message}</p>
                        </div>

                        <p style="margin-top: 20px; color: #666; font-size: 0.9rem;">
                            Reply directly to this email to respond to ${name}.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
New Contact Form Submission

From: ${name}
Email: ${email}
Subject: ${subjectMap[subject] || subject}
Time: ${new Date().toLocaleString()}

Message:
${message}

---
Reply to this email to respond to ${name}.
        `
    };

    const info = await transport.sendMail(mailOptions);

    // If using Ethereal, log the preview URL
    if (testAccount) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('\n📧 CONTACT FORM EMAIL SENT!');
        console.log('From:', name, `<${email}>`);
        console.log('Subject:', subjectMap[subject] || subject);
        console.log('Preview URL:', previewUrl);
        console.log('(Open this URL to view the email)\n');
    }

    return info;
}

module.exports = {
    sendPasswordEmail,
    sendResetPasswordEmail,
    sendTrackingConsentRequest,
    sendContactForm
};
