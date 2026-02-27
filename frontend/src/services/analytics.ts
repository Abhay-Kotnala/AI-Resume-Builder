import ReactGA from 'react-ga4';

// ─── Initialisation ──────────────────────────────────────────────────────────

export const initAnalytics = () => {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (!measurementId) return; // Silently skip in local dev if key not set
    ReactGA.initialize(measurementId);
};

// ─── Page Tracking ───────────────────────────────────────────────────────────

export const trackPageView = (path: string, title?: string) => {
    ReactGA.send({ hitType: 'pageview', page: path, title });
};

// ─── Custom Events ───────────────────────────────────────────────────────────

/** User selects a file in the upload zone */
export const trackResumeUploadStarted = () => {
    ReactGA.event('resume_upload_started');
};

/** Analysis API returns successfully */
export const trackResumeAnalyzed = (atsScore: number, hasJobDescription: boolean) => {
    ReactGA.event('resume_analyzed', {
        ats_score: atsScore,
        has_job_description: hasJobDescription,
    });
};

/** User clicks the Download PDF button */
export const trackPdfExported = (template: string, font: string) => {
    ReactGA.event('pdf_exported', { template, font });
};

/** Magic Wand editor is opened for a bullet point rewrite */
export const trackAiRewriteUsed = () => {
    ReactGA.event('ai_rewrite_used');
};

/** Cover letter was generated successfully */
export const trackCoverLetterGenerated = () => {
    ReactGA.event('cover_letter_generated');
};

/**
 * User clicked any "Upgrade" or "Unlock" button.
 * @param source Where on the UI it was clicked, e.g. 'checklist', 'keywords', 'template_guard'
 */
export const trackUpgradeClicked = (source: string) => {
    ReactGA.event('upgrade_clicked', { source });
};

/** User clicks "Proceed to Payment" on the checkout page */
export const trackCheckoutStarted = () => {
    ReactGA.event('checkout_started');
};

/** Success page mounts — payment confirmed */
export const trackPurchaseCompleted = () => {
    ReactGA.event('purchase_completed');
};

/** Sign-in modal is opened */
export const trackLoginStarted = () => {
    ReactGA.event('login_started');
};

/** OAuth2 callback succeeds and JWT is received */
export const trackLoginCompleted = (provider: string) => {
    ReactGA.event('login_completed', { provider });
};
