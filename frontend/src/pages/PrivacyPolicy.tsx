import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
        <div className="text-slate-600 leading-relaxed space-y-3">{children}</div>
    </section>
);

export const PrivacyPolicy: React.FC = () => (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
            <div className="mb-10">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Legal</p>
                <h1 className="text-4xl font-black text-slate-900 mb-3">Privacy Policy</h1>
                <p className="text-slate-500 text-sm">Last updated: 28 February 2026</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12">
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
                    <p>We use your data to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Provide and improve the ElevateAI service.</li>
                        <li>Authenticate your account and manage your subscription.</li>
                        <li>Send important transactional emails (e.g., payment receipts).</li>
                    </ul>
                    <p>We do <strong>not</strong> sell your personal data to third parties. We do <strong>not</strong> use your resume content to train AI models.</p>
                </Section>

                <Section title="3. Data Storage & Security">
                    <p>Your data is stored on Railway-hosted databases in secure data centres. We use industry-standard encryption (TLS 1.2+) for all data in transit and at rest. JWTs are used for authentication with short expiry periods.</p>
                </Section>

                <Section title="4. Third-Party Services">
                    <p>We use the following third-party services:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Google OAuth</strong> / <strong>LinkedIn OAuth</strong> — for authentication.</li>
                        <li><strong>Stripe</strong> — for payment processing. We never store your card details.</li>
                        <li><strong>Google Gemini API</strong> — for AI analysis. Resume text is sent to Gemini for processing; see Google's Privacy Policy for how they handle this.</li>
                        <li><strong>Google Analytics</strong> — for anonymous usage analytics.</li>
                    </ul>
                </Section>

                <Section title="5. Data Retention">
                    <p>We retain your account and resume data for as long as your account is active. You can request deletion of your account and all associated data at any time by contacting us at <a href="mailto:privacy@elevateai.app" className="text-indigo-500 hover:underline">privacy@elevateai.app</a>.</p>
                </Section>

                <Section title="6. Your Rights">
                    <p>You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at the email above.</p>
                </Section>

                <Section title="7. Cookies">
                    <p>We use only essential cookies (for authentication state) and first-party analytics cookies (Google Analytics with IP anonymisation enabled). We do not use advertising or tracking cookies.</p>
                </Section>

                <Section title="8. Changes to This Policy">
                    <p>We may update this policy from time to time. We will notify you of significant changes by email or via an in-app notification. Your continued use of ElevateAI after changes constitutes your acceptance of the updated policy.</p>
                </Section>

                <Section title="9. Contact">
                    <p>For any privacy-related questions, contact us at: <a href="mailto:privacy@elevateai.app" className="text-indigo-500 hover:underline">privacy@elevateai.app</a></p>
                </Section>
            </div>
        </div>
    </div>
);
