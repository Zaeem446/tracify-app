/**
 * Tracify Stripe Integration
 *
 * Handles Stripe Checkout for trial and subscription payments
 */

// Stripe Configuration
const STRIPE_CONFIG = {
    publishableKey: 'pk_live_51T2LP7RevHepjMisKvokLqqfGpqv7LSm2t1TZqxxN4pJ4RJiGRhtFpFh80OnvJ8xHtNm6aCkwjW1XrfiMGI5xmaU00cZAhX9iA', // LIVE KEY - Real payments!
    successUrl: window.location.origin + '/dashboard.html?session_id={CHECKOUT_SESSION_ID}',
    cancelUrl: window.location.origin + '/payment.html?cancelled=true'
};

// Initialize Stripe
let stripe;

/**
 * Initialize Stripe when DOM is ready
 */
function initializeStripe() {
    if (typeof Stripe === 'undefined') {
        console.error('Stripe.js not loaded');
        return false;
    }

    try {
        stripe = Stripe(STRIPE_CONFIG.publishableKey);
        console.log('✅ Stripe initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Stripe:', error);
        return false;
    }
}

/**
 * Create Stripe Checkout Session
 *
 * @param {string} priceId - Stripe Price ID
 * @param {string} mode - 'payment' for one-time or 'subscription' for recurring
 * @returns {Promise<void>}
 */
async function createCheckoutSession(priceId, mode = 'payment') {
    if (!stripe) {
        alert('Payment system is not ready. Please refresh the page.');
        return;
    }

    try {
        // Show loading state
        showLoadingState();

        // Call backend API to create checkout session
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                priceId: priceId,
                mode: mode,
                successUrl: STRIPE_CONFIG.successUrl,
                cancelUrl: STRIPE_CONFIG.cancelUrl
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }

        const { sessionId } = await response.json();

        // Redirect to Stripe Checkout
        const { error } = await stripe.redirectToCheckout({
            sessionId: sessionId
        });

        if (error) {
            throw error;
        }

    } catch (error) {
        console.error('Error creating checkout session:', error);
        hideLoadingState();
        alert('Payment failed. Please try again or contact support.');
    }
}

/**
 * Start Trial Payment (One-time $1.25)
 */
async function startTrialPayment() {
    const priceId = window.PRICING_CONFIG.getTrialPriceId();

    if (priceId === 'REPLACE_WITH_STRIPE_TRIAL_PRICE_ID') {
        alert('Payment system not configured. Please contact support.');
        return;
    }

    await createCheckoutSession(priceId, 'payment');
}

/**
 * Start Monthly Subscription Payment ($30/month)
 */
async function startMonthlyPayment() {
    const priceId = window.PRICING_CONFIG.getMonthlyPriceId();

    if (priceId === 'REPLACE_WITH_STRIPE_MONTHLY_PRICE_ID') {
        alert('Payment system not configured. Please contact support.');
        return;
    }

    await createCheckoutSession(priceId, 'subscription');
}

/**
 * Show loading state during checkout
 */
function showLoadingState() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'stripe-loading';
    loadingOverlay.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
        ">
            <div style="
                background: white;
                padding: 40px;
                border-radius: 12px;
                text-align: center;
                max-width: 300px;
            ">
                <div style="
                    border: 4px solid #4CAF50;
                    border-top: 4px solid transparent;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <h3 style="margin: 0 0 10px; color: #333;">Processing...</h3>
                <p style="margin: 0; color: #666; font-size: 14px;">
                    Redirecting to secure payment
                </p>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(loadingOverlay);
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    const loading = document.getElementById('stripe-loading');
    if (loading) {
        loading.remove();
    }
}

/**
 * Connect payment buttons on page load
 */
function connectPaymentButtons() {
    // Trial buttons
    const trialButtons = document.querySelectorAll('[data-payment="trial"], .btn-trial, .start-trial-btn');
    trialButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            startTrialPayment();
        });
    });

    // Monthly subscription buttons
    const monthlyButtons = document.querySelectorAll('[data-payment="monthly"], .btn-monthly, .subscribe-btn');
    monthlyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            startMonthlyPayment();
        });
    });

    // Generic "Start Trial" and "Subscribe Now" buttons
    document.querySelectorAll('.btn-primary').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('trial') || text.includes('start')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                startTrialPayment();
            });
        }
    });

    document.querySelectorAll('.btn-secondary').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('subscribe') || text.includes('monthly')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                startMonthlyPayment();
            });
        }
    });

    console.log('✅ Payment buttons connected');
}

/**
 * Check payment status on page load (for success/cancel redirects)
 */
function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const cancelled = urlParams.get('cancelled');

    if (sessionId) {
        // Payment successful
        console.log('Payment successful! Session ID:', sessionId);
        // You can verify the session on backend here
        showSuccessMessage();
    } else if (cancelled === 'true') {
        // Payment cancelled
        console.log('Payment cancelled by user');
        showCancelMessage();
    }
}

/**
 * Show success message
 */
function showSuccessMessage() {
    // This will be shown on dashboard after successful payment
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
        <strong>✓ Payment Successful!</strong><br>
        <span style="font-size: 14px;">Welcome to Tracify!</span>
    `;
    document.body.appendChild(message);

    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 5000);
}

/**
 * Show cancel message
 */
function showCancelMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #FF9800;
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
    `;
    message.innerHTML = `
        <strong>Payment Cancelled</strong><br>
        <span style="font-size: 14px;">You can try again anytime.</span>
    `;
    document.body.appendChild(message);

    setTimeout(() => message.remove(), 4000);

    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeStripe();
        connectPaymentButtons();
        checkPaymentStatus();
    });
} else {
    initializeStripe();
    connectPaymentButtons();
    checkPaymentStatus();
}

// Export functions for global use
window.TracifyPayment = {
    startTrialPayment,
    startMonthlyPayment,
    initializeStripe,
    connectPaymentButtons
};
