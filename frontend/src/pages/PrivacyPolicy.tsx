import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h2>
        <div className="text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">{children}</div>
    </section>
);

export const PrivacyPolicy: React.FC = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="max-w-3xl mx-auto">
            <div className="mb-10">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Legal</p>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3">Privacy Policy</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Last updated: 28 February 2026</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 md:p-12">
                <Section title="1. Information We Collect">
                    <p>When you use ElevateAI, we collect:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Account data</strong> — your name, email address, and profile picture provided via Google or LinkedIn OAuth sign-in.</li>
                        <li><strong>Resume content</strong> — the text extracted from PDFs you upload for analysis. This is stored only to generate your analysis and preview.</li>
                        <li><strong>Usage data</strong> — number of scans performed and subscription status, used to enforce plan limits and personalise your experience.</li>
                        <li><strong>Analytics data</strong> — anonymous page-view and event data via Google Analytics (GA4) to understand how the product is used.</li>
                    </ul>
                </Section>
                <Section title="2. How We Use Your Data">
                    <p>We use your data to provide and improve the ElevateAI service, authenticate your account, manage your subscription, and send important transactional emails. We do <strong>not</strong> sell your personal data or use your resume content to train AI models.</p>
                </Section>
                <Section title="3. Data Storage & Security">
                    <p>Your data is stored on Railway-hosted databases in secure data centres. We use industry-standard encryption (TLS 1.2+) for all data in transit and at rest.</p>
                </Section>
                <Section title="4. Third-Party Services">
                    <p>We use Google OAuth, LinkedIn OAuth, Stripe (payments), Google Gemini API (AI processing), and Google Analytics (anonymous usage analytics).</p>
                </Section>
                <Section title="5. Data Retention">
                    <p>We retain your account and resume data for as long as your account is active. You can request deletion at any time by contacting <a href="mailto:privacy@elevateai.app" className="text-indigo-500 hover:underline">privacy@elevateai.app</a>.</p>
                </Section>
                <Section title="6. Your Rights">
                    <p>You have the right to access, correct, or delete your personal data at any time. Contact us at the email above to exercise these rights.</p>
                </Section>
                <Section title="7. Cookies">
                    <p>We use only essential cookies (for authentication state) and first-party analytics cookies (Google Analytics with IP anonymisation enabled). No advertising or tracking cookies.</p>
                </Section>
                <Section title="8. Contact">
                    <p>For privacy-related questions, contact us at: <a href="mailto:privacy@elevateai.app" className="text-indigo-500 hover:underline">privacy@elevateai.app</a></p>
                </Section>
            </div>
        </div>
    </div>
);
