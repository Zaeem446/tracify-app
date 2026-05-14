/**
 * Tracify Pricing Configuration
 *
 * Centralized pricing for the entire application
 * Update prices here and they'll reflect everywhere
 */

const PRICING_CONFIG = {
    // Prices
    trial: {
        amount: 1.47,
        currency: 'USD',
        symbol: '$',
        duration: '24 hours',
        stripePriceId: 'price_1TIACqIggzd46qoM02MRB9xS', // $1.47 Trial
        name: '24-Hour Trial',
        description: 'Full access for 24 hours'
    },
    monthly: {
        amount: 30.00,
        currency: 'USD',
        symbol: '$',
        duration: 'per month',
        stripePriceId: 'price_1TIADCIggzd46qoMesRQlnq7', // $30 Monthly
        name: 'Monthly Subscription',
        description: 'Unlimited tracking'
    },

    // Format price with currency symbol
    formatPrice(amount) {
        return `$${amount.toFixed(2)}`;
    },

    // Get trial price display
    getTrialPrice() {
        return this.formatPrice(this.trial.amount);
    },

    // Get monthly price display
    getMonthlyPrice() {
        return this.formatPrice(this.monthly.amount);
    },

    // Get trial price ID for Stripe
    getTrialPriceId() {
        return this.trial.stripePriceId;
    },

    // Get monthly price ID for Stripe
    getMonthlyPriceId() {
        return this.monthly.stripePriceId;
    }
};

// Make available globally
window.PRICING_CONFIG = PRICING_CONFIG;
