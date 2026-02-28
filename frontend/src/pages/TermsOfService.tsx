import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h2>
        <div className="text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">{children}</div>
    </section>
);

export const TermsOfService: React.FC = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="max-w-3xl mx-auto">
            <div className="mb-10">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Legal</p>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3">Terms of Service</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Last updated: 28 February 2026</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 md:p-12">
                <Section title="1. Acceptance of Terms">
                    <p>By accessing or using ElevateAI ("Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
                </Section>
                <Section title="2. Description of Service">
                    <p>ElevateAI provides AI-powered resume analysis, cover letter generation, interview preparation, and related career tools. Features are subject to change without notice.</p>
                </Section>
                <Section title="3. User Accounts">
                    <ul className="list-disc pl-5 space-y-1">
                        <li>You must sign in via Google or LinkedIn OAuth to use certain features.</li>
                        <li>Free accounts are limited to 2 AI resume scans. Additional usage requires a Pro subscription.</li>
                    </ul>
                </Section>
                <Section title="4. Subscriptions & Payments">
                    <ul className="list-disc pl-5 space-y-1">
                        <li>ElevateAI Pro is a paid subscription billed via Stripe, renewing automatically unless cancelled.</li>
                        <li>Refunds are offered within 7 days of purchase. Contact <a href="mailto:support@elevateai.app" className="text-indigo-500 hover:underline">support@elevateai.app</a>.</li>
                    </ul>
                </Section>
                <Section title="5. Acceptable Use">
                    <p>You agree not to submit false or illegal content, use the Service to harm others, or attempt to reverse-engineer or scrape our APIs.</p>
                </Section>
                <Section title="6. Intellectual Property">
                    <p>All ElevateAI content and technology are our exclusive property. Your resume content remains yours — we claim no ownership over it.</p>
                </Section>
                <Section title="7. Disclaimer of Warranties">
                    <p>The Service is provided "as is". AI-generated content should be reviewed by you — we do not guarantee job offers or interviews as a result.</p>
                </Section>
                <Section title="8. Governing Law">
                    <p>These Terms are governed by the laws of India. Disputes must be resolved in Indian courts.</p>
                </Section>
                <Section title="9. Contact">
                    <p>Questions? Email us at <a href="mailto:legal@elevateai.app" className="text-indigo-500 hover:underline">legal@elevateai.app</a>.</p>
                </Section>
            </div>
        </div>
    </div>
);
