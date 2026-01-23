// Tracify - Main JavaScript

// Helper function to get current language for redirects
function getCurrentLanguage() {
    // Try i18n first
    if (window.TracifyI18n && window.TracifyI18n.getCurrentLang) {
        return window.TracifyI18n.getCurrentLang();
    }
    // Fallback: extract from URL
    const match = window.location.pathname.match(/^\/([a-z]{2,3}(?:_[A-Z]{2})?(?:-[A-Z]{2})?)\//);
    if (match) {
        return match[1];
    }
    // Check localStorage
    const saved = localStorage.getItem('tracify_lang');
    if (saved) {
        return saved;
    }
    return 'en';
}

// Helper function to build language-prefixed URL
function getLocalizedUrl(path) {
    const lang = getCurrentLanguage();
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `/${lang}/${cleanPath}`;
}

// Helper function to get translation (with fallback to key)
function t(key) {
    if (window.TracifyI18n && window.TracifyI18n.t) {
        return window.TracifyI18n.t(key);
    }
    // Fallback: return the last part of the key as readable text
    const parts = key.split('.');
    return parts[parts.length - 1];
}

// Function to update modal translations after i18n loads
function updateModalTranslations() {
    const emailModal = document.getElementById('emailModal');
    if (emailModal) {
        const h2 = emailModal.querySelector('h2');
        const subtitle = emailModal.querySelector('.email-modal-content > p');
        const emailInput = emailModal.querySelector('#emailInput');
        const agreeLabel = emailModal.querySelector('label[for="emailSubscription"]');
        const continueBtn = emailModal.querySelector('#continueBtn');
        const termsP = emailModal.querySelector('.modal-terms');
        const dividerSpan = emailModal.querySelector('.modal-divider span');
        const loginLinkP = emailModal.querySelector('.login-link');

        if (h2) h2.textContent = t('modal.signup.title');
        if (subtitle) subtitle.textContent = t('modal.signup.subtitle');
        if (emailInput) emailInput.placeholder = t('modal.signup.emailPlaceholder');
        if (agreeLabel) agreeLabel.innerHTML = `${t('modal.signup.agreeText')} <span style="color: #f44336;">${t('modal.signup.agreeRequired')}</span>`;
        if (continueBtn && !continueBtn.disabled) continueBtn.textContent = t('modal.signup.continueBtn');
        if (termsP) termsP.innerHTML = `${t('modal.signup.termsText')} <a href="${getLocalizedUrl('terms')}">${t('modal.signup.termsLink')}</a> ${t('modal.signup.and')} <a href="${getLocalizedUrl('privacy')}">${t('modal.signup.privacyLink')}</a>.`;
        if (dividerSpan) dividerSpan.textContent = t('modal.signup.or');
        if (loginLinkP) loginLinkP.innerHTML = `${t('modal.signup.hasAccount')} <a href="#" onclick="showLoginModal(); return false;">${t('modal.signup.loginLink')}</a>`;
    }

    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        const h2 = loginModal.querySelector('h2');
        const subtitle = loginModal.querySelector('.email-modal-content > p');
        const emailInput = loginModal.querySelector('#loginEmail');
        const passwordInput = loginModal.querySelector('#loginPassword');
        const loginBtn = loginModal.querySelector('#loginBtn');
        const dividerSpan = loginModal.querySelector('.modal-divider span');
        const signupLinkP = loginModal.querySelector('.login-link');

        if (h2) h2.textContent = t('modal.login.title');
        if (subtitle) subtitle.textContent = t('modal.login.subtitle');
        if (emailInput) emailInput.placeholder = t('modal.login.emailPlaceholder');
        if (passwordInput) passwordInput.placeholder = t('modal.login.passwordPlaceholder');
        if (loginBtn && !loginBtn.disabled) loginBtn.textContent = t('modal.login.loginBtn');
        if (dividerSpan) dividerSpan.textContent = t('modal.login.or');
        if (signupLinkP) signupLinkP.innerHTML = `${t('modal.login.noAccount')} <a href="#" onclick="closeLoginModal(); showEmailModal(); return false;">${t('modal.login.signupLink')}</a>`;
    }
}

document.addEventListener('DOMContentLoaded', function() {

    // Check if user is already logged in
    checkExistingSession();

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', function() {
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            item.classList.toggle('active');
        });
    });

    // FAQ Tab Switching
    const faqTabs = document.querySelectorAll('.faq-tab');

    faqTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            faqTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Phone Number Locate Button - NEW SIGNUP FLOW
    const locateBtn = document.getElementById('locateBtn');
    const phoneInput = document.getElementById('phoneNumber');
    const countryCode = document.getElementById('countryCode');

    if (locateBtn) {
        locateBtn.addEventListener('click', function() {
            const phone = phoneInput.value.trim();
            const code = countryCode.value;

            if (!phone) {
                showNotification('Please enter a phone number', 'error');
                phoneInput.focus();
                return;
            }

            if (!/^[\d\s-]{7,15}$/.test(phone)) {
                showNotification('Please enter a valid phone number', 'error');
                return;
            }

            // Store phone number and show email modal
            sessionStorage.setItem('phoneToTrack', phone);
            sessionStorage.setItem('countryCode', code);
            showEmailModal();
        });
    }

    // Create Email Modal
    function createEmailModal() {
        const modal = document.createElement('div');
        modal.id = 'emailModal';
        modal.className = 'email-modal';
        modal.innerHTML = `
            <div class="email-modal-content">
                <button class="modal-close-btn" onclick="closeEmailModal()">&times;</button>
                <div class="modal-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                </div>
                <h2 data-i18n="modal.signup.title">${t('modal.signup.title')}</h2>
                <p data-i18n="modal.signup.subtitle">${t('modal.signup.subtitle')}</p>

                <div id="modalMessage"></div>

                <form id="emailForm">
                    <input type="email" id="emailInput" data-i18n-placeholder="modal.signup.emailPlaceholder" placeholder="${t('modal.signup.emailPlaceholder')}" required>

                    <div style="margin: 15px 0; display: flex; align-items: start; gap: 10px;">
                        <input type="checkbox" id="emailSubscription" required style="width: 18px; height: 18px; margin-top: 2px; cursor: pointer;">
                        <label for="emailSubscription" style="font-size: 0.9rem; color: #333; cursor: pointer; line-height: 1.4;" data-i18n="modal.signup.agreeText">
                            ${t('modal.signup.agreeText')} <span style="color: #f44336;">${t('modal.signup.agreeRequired')}</span>
                        </label>
                    </div>

                    <button type="submit" id="continueBtn" data-i18n="modal.signup.continueBtn">${t('modal.signup.continueBtn')}</button>
                </form>

                <p class="modal-terms">${t('modal.signup.termsText')} <a href="${getLocalizedUrl('terms')}">${t('modal.signup.termsLink')}</a> ${t('modal.signup.and')} <a href="${getLocalizedUrl('privacy')}">${t('modal.signup.privacyLink')}</a>.</p>

                <div class="modal-divider"><span data-i18n="modal.signup.or">${t('modal.signup.or')}</span></div>

                <p class="login-link">${t('modal.signup.hasAccount')} <a href="#" onclick="showLoginModal(); return false;">${t('modal.signup.loginLink')}</a></p>
            </div>
        `;
        document.body.appendChild(modal);

        // Add modal styles
        const modalStyles = document.createElement('style');
        modalStyles.id = 'email-modal-styles';
        modalStyles.textContent = `
            .email-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                z-index: 10000;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .email-modal.active {
                display: flex;
            }
            .email-modal-content {
                background: white;
                border-radius: 20px;
                padding: 40px;
                max-width: 420px;
                width: 100%;
                text-align: center;
                position: relative;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: modalSlideIn 0.3s ease;
            }
            @keyframes modalSlideIn {
                from { transform: translateY(-30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .modal-close-btn {
                position: absolute;
                top: 15px;
                right: 20px;
                background: none;
                border: none;
                font-size: 1.8rem;
                cursor: pointer;
                color: #999;
            }
            .modal-icon {
                width: 70px;
                height: 70px;
                background: linear-gradient(135deg, #4CAF50, #2E7D32);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
            }
            .modal-icon svg {
                width: 35px;
                height: 35px;
                color: white;
            }
            .email-modal-content h2 {
                color: #333;
                margin-bottom: 10px;
                font-size: 1.5rem;
            }
            .email-modal-content > p {
                color: #666;
                margin-bottom: 25px;
                font-size: 0.95rem;
            }
            #emailForm {
                margin-bottom: 20px;
            }
            #emailForm input {
                width: 100%;
                padding: 16px;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                font-size: 1rem;
                margin-bottom: 15px;
                transition: border-color 0.3s;
            }
            #emailForm input:focus {
                outline: none;
                border-color: #4CAF50;
            }
            #emailForm button {
                width: 100%;
                padding: 16px;
                background: linear-gradient(135deg, #4CAF50, #2E7D32);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }
            #emailForm button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
            }
            #emailForm button:disabled {
                opacity: 0.7;
                cursor: not-allowed;
                transform: none;
            }
            .modal-terms {
                font-size: 0.8rem;
                color: #999;
            }
            .modal-terms a {
                color: #4CAF50;
            }
            .modal-divider {
                display: flex;
                align-items: center;
                margin: 20px 0;
            }
            .modal-divider::before, .modal-divider::after {
                content: '';
                flex: 1;
                height: 1px;
                background: #e0e0e0;
            }
            .modal-divider span {
                padding: 0 15px;
                color: #999;
                font-size: 0.85rem;
            }
            .login-link {
                font-size: 0.95rem;
                color: #666;
            }
            .login-link a {
                color: #4CAF50;
                font-weight: 600;
                text-decoration: none;
            }
            #modalMessage {
                margin-bottom: 15px;
            }
            .msg-error {
                background: #ffebee;
                color: #c62828;
                padding: 12px;
                border-radius: 8px;
                font-size: 0.9rem;
            }
            .msg-success {
                background: #e8f5e9;
                color: #2e7d32;
                padding: 12px;
                border-radius: 8px;
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(modalStyles);

        // Email form submission
        document.getElementById('emailForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('emailInput').value.trim();
            const btn = document.getElementById('continueBtn');
            const msgDiv = document.getElementById('modalMessage');

            btn.disabled = true;
            btn.textContent = t('modal.signup.creatingAccount');
            msgDiv.innerHTML = '';

            try {
                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', // Required to receive and store session cookie
                    body: JSON.stringify({
                        email,
                        phoneToTrack: sessionStorage.getItem('phoneToTrack'),
                        countryCode: sessionStorage.getItem('countryCode')
                    })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    // Show password for testing and redirect
                    msgDiv.innerHTML = `
                        <div class="msg-success">
                            <strong>${t('modal.signup.accountCreated')}</strong><br>
                            ${t('modal.signup.yourPassword')} <code style="background:#fff;padding:2px 8px;border-radius:4px;font-weight:bold;">${data.password}</code><br>
                            <small>${t('modal.signup.savePassword')}</small>
                        </div>
                    `;
                    setTimeout(() => {
                        window.location.href = getLocalizedUrl('payment');
                    }, 3000);
                } else {
                    msgDiv.innerHTML = `<div class="msg-error">${data.error || t('modal.errors.accountCreationFailed')}</div>`;
                    btn.disabled = false;
                    btn.textContent = t('modal.signup.continueBtn');
                }
            } catch (error) {
                msgDiv.innerHTML = `<div class="msg-error">${t('modal.errors.connectionError')}</div>`;
                btn.disabled = false;
                btn.textContent = t('modal.signup.continueBtn');
            }
        });
    }

    // Create Login Modal
    function createLoginModal() {
        const modal = document.createElement('div');
        modal.id = 'loginModal';
        modal.className = 'email-modal';
        modal.innerHTML = `
            <div class="email-modal-content">
                <button class="modal-close-btn" onclick="closeLoginModal()">&times;</button>
                <div class="modal-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                        <polyline points="10 17 15 12 10 7"/>
                        <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                </div>
                <h2 data-i18n="modal.login.title">${t('modal.login.title')}</h2>
                <p data-i18n="modal.login.subtitle">${t('modal.login.subtitle')}</p>

                <div id="loginModalMessage"></div>

                <form id="loginForm">
                    <input type="email" id="loginEmail" data-i18n-placeholder="modal.login.emailPlaceholder" placeholder="${t('modal.login.emailPlaceholder')}" required>
                    <input type="password" id="loginPassword" data-i18n-placeholder="modal.login.passwordPlaceholder" placeholder="${t('modal.login.passwordPlaceholder')}" required>
                    <button type="submit" id="loginBtn" data-i18n="modal.login.loginBtn">${t('modal.login.loginBtn')}</button>
                </form>

                <div class="modal-divider"><span data-i18n="modal.login.or">${t('modal.login.or')}</span></div>

                <p class="login-link">${t('modal.login.noAccount')} <a href="#" onclick="closeLoginModal(); showEmailModal(); return false;">${t('modal.login.signupLink')}</a></p>
            </div>
        `;
        document.body.appendChild(modal);

        // Login form submission
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const btn = document.getElementById('loginBtn');
            const msgDiv = document.getElementById('loginModalMessage');

            btn.disabled = true;
            btn.textContent = t('modal.login.loggingIn');
            msgDiv.innerHTML = '';

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', // Required to receive and store session cookie
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    msgDiv.innerHTML = `<div class="msg-success">${t('modal.login.loginSuccess')}</div>`;
                    setTimeout(() => {
                        window.location.href = getLocalizedUrl('dashboard');
                    }, 1000);
                } else {
                    msgDiv.innerHTML = `<div class="msg-error">${data.error || t('modal.errors.loginFailed')}</div>`;
                    btn.disabled = false;
                    btn.textContent = t('modal.login.loginBtn');
                }
            } catch (error) {
                msgDiv.innerHTML = `<div class="msg-error">${t('modal.errors.connectionError')}</div>`;
                btn.disabled = false;
                btn.textContent = t('modal.login.loginBtn');
            }
        });
    }

    // Initialize modals
    createEmailModal();
    createLoginModal();

    // Update translations after a short delay (allow i18n to load)
    setTimeout(updateModalTranslations, 500);

    // Also update when i18n is ready (if it loads later)
    if (window.TracifyI18n) {
        updateModalTranslations();
    }

    // Show/hide modal functions
    window.showEmailModal = function() {
        updateModalTranslations(); // Ensure fresh translations
        document.getElementById('emailModal').classList.add('active');
    };

    window.closeEmailModal = function() {
        document.getElementById('emailModal').classList.remove('active');
        document.getElementById('emailInput').value = '';
        document.getElementById('modalMessage').innerHTML = '';
        // Reset button text
        const btn = document.getElementById('continueBtn');
        if (btn) {
            btn.disabled = false;
            btn.textContent = t('modal.signup.continueBtn');
        }
    };

    window.showLoginModal = function() {
        closeEmailModal();
        updateModalTranslations(); // Ensure fresh translations
        document.getElementById('loginModal').classList.add('active');
    };

    window.closeLoginModal = function() {
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginModalMessage').innerHTML = '';
        // Reset button text
        const btn = document.getElementById('loginBtn');
        if (btn) {
            btn.disabled = false;
            btn.textContent = t('modal.login.loginBtn');
        }
    };

    // Check existing session - don't change login button, keep it as Login
    async function checkExistingSession() {
        // Session check disabled - Login button always shows login modal
    }

    // Notification System
    window.showNotification = function(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;

        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    line-height: 1;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        });

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    };

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#login') {
                e.preventDefault();
                showLoginModal();
                return;
            }

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
                }
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        }
    });

    // Pricing card hover effects
    const pricingCards = document.querySelectorAll('.pricing-card');

    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Pricing button handlers - show signup modal
    const trialBtn = document.querySelector('.pricing-card.trial .btn');
    const subscribeBtn = document.querySelector('.pricing-card.subscription .btn');

    if (trialBtn) {
        trialBtn.addEventListener('click', function() {
            showEmailModal();
        });
    }

    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', function() {
            showEmailModal();
        });
    }

    // Locate Phone button in features section
    const locatePhoneBtn = document.querySelector('.cta-button .btn');

    if (locatePhoneBtn) {
        locatePhoneBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            setTimeout(() => {
                if (phoneInput) phoneInput.focus();
            }, 500);
        });
    }

    // Input validation visual feedback
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            const value = this.value.replace(/\D/g, '');
            if (value.length > 0 && value.length < 7) {
                this.style.borderColor = '#f44336';
            } else if (value.length >= 7) {
                this.style.borderColor = '#4CAF50';
            } else {
                this.style.borderColor = 'transparent';
            }
        });
    }

    // Add CSS for mobile menu
    const mobileStyles = document.createElement('style');
    mobileStyles.textContent = `
        @media (max-width: 768px) {
            .nav-links.active {
                display: flex;
                flex-direction: column;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                padding: 20px;
                box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                gap: 15px;
            }

            .mobile-menu-btn.active span:nth-child(1) {
                transform: rotate(45deg) translate(6px, 6px);
            }

            .mobile-menu-btn.active span:nth-child(2) {
                opacity: 0;
            }

            .mobile-menu-btn.active span:nth-child(3) {
                transform: rotate(-45deg) translate(6px, -6px);
            }
        }
    `;
    document.head.appendChild(mobileStyles);

    console.log('Tracify initialized successfully!');
});
