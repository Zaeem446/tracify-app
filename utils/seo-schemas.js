/**
 * JSON-LD Schema Builders for Tracify
 *
 * Pure functions that return schema.org objects for server-side injection.
 * If a builder fails, the caller should log and skip that block — never crash the page.
 */

'use strict';

const SITE = 'https://tracify-geo.com';
const BRAND = 'Tracify';
const LOGO = `${SITE}/tracify-logo.svg`;

function organization() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: BRAND,
        url: SITE,
        logo: LOGO,
        description: 'Tracify is a privacy-first phone tracker that locates any mobile phone number worldwide with the recipient\'s explicit consent.',
        sameAs: []
    };
}

function website(langCode) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: SITE,
        name: BRAND,
        publisher: { '@id': `${SITE}/#organization` },
        inLanguage: langCode || 'en',
        potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
        }
    };
}

function softwareApplication() {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: BRAND,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web, iOS, Android',
        description: 'Phone tracker by number. Locate any phone\'s GPS location worldwide via SMS-consent — works on iOS, Android, and all mobile networks.',
        offers: [
            {
                '@type': 'Offer',
                name: '24-Hour Trial',
                price: '1.47',
                priceCurrency: 'USD',
                description: '24-hour full-access trial'
            },
            {
                '@type': 'Offer',
                name: 'Monthly Subscription',
                price: '30.00',
                priceCurrency: 'USD',
                description: 'Full access, cancel anytime'
            }
        ],
        url: SITE,
        image: LOGO,
        publisher: { '@id': `${SITE}/#organization` }
    };
}

function breadcrumbList(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: item.name,
            item: item.url
        }))
    };
}

function faqPage(qaPairs) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: qaPairs.map(pair => ({
            '@type': 'Question',
            name: pair.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: pair.a
            }
        }))
    };
}

function howTo({ name, description, steps, totalTime, image }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name,
        description,
        totalTime: totalTime || 'PT2M',
        image: image || LOGO,
        step: steps.map((s, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            name: s.name,
            text: s.text,
            url: s.url
        }))
    };
}

function article({ headline, description, url, datePublished, dateModified, image, author }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline,
        description,
        mainEntityOfPage: url,
        datePublished,
        dateModified: dateModified || datePublished,
        image: image || LOGO,
        author: {
            '@type': 'Organization',
            name: author || BRAND,
            url: SITE
        },
        publisher: { '@id': `${SITE}/#organization` }
    };
}

function contactPage() {
    return {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact Tracify',
        url: `${SITE}/contact`,
        publisher: { '@id': `${SITE}/#organization` }
    };
}

function collectionPage({ name, url, description }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name,
        url,
        description,
        publisher: { '@id': `${SITE}/#organization` }
    };
}

module.exports = {
    organization,
    website,
    softwareApplication,
    breadcrumbList,
    faqPage,
    howTo,
    article,
    contactPage,
    collectionPage,
    SITE,
    BRAND,
    LOGO
};
