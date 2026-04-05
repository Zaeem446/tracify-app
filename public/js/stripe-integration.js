/**
 * Tracify Stripe Integration
 *
 * Minimal utility — Stripe Checkout is now handled server-side.
 * This file only handles the dashboard success toast on redirect.
 */

/**
 * Check payment status on page load (for dashboard success toast)
 */
function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
        console.log('Payment successful! Session ID:', sessionId);
        showSuccessMessage();
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

/**
 * Show success message toast on dashboard
 */
function showSuccessMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    message.innerHTML = `
        <strong>Payment Successful!</strong><br>
        <span style="font-size: 14px;">Welcome to Tracify!</span>
    `;
    document.body.appendChild(message);

    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 5000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkPaymentStatus);
} else {
    checkPaymentStatus();
}

// Export for global use
window.TracifyPayment = {
    checkPaymentStatus
};
