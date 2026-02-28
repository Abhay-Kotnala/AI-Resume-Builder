import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
        <div className="text-slate-600 leading-relaxed space-y-3">{children}</div>
    </section>
);

export const TermsOfService: React.FC = () => (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
            <div className="mb-10">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Legal</p>
                <h1 className="text-4xl font-black text-slate-900 mb-3">Terms of Service</h1>
                <p className="text-slate-500 text-sm">Last updated: 28 February 2026</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12">
                <Section title="1. Acceptance of Terms">
                    <p>By accessing or using ElevateAI ("Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
                </Section>

                <Section title="2. Description of Service">
                    <p>ElevateAI provides AI-powered resume analysis, cover letter generation, interview preparation, and related career tools. Features are subject to change without notice.</p>
                </Section>

                <Section title="3. User Accounts">
                    <ul className="list-disc pl-5 space-y-1">
                        <li>You must sign in via Google or LinkedIn OAuth to use certain features.</li>
                        <li>You are responsible for maintaining the security of your account.</li>
                        <li>Free accounts are limited to 2 AI resume scans. Additional usage requires a Pro subscription.</li>
                    </ul>
                </Section>

                <Section title="4. Subscriptions & Payments">
                    <ul className="list-disc pl-5 space-y-1">
                        <li>ElevateAI Pro is a paid subscription billed via Stripe.</li>
                        <li>Subscriptions renew automatically unless cancelled.</li>
                        <li>Refunds are offered within 7 days of purchase if you are not satisfied. Contact us at <a href="mailto:support@elevateai.app" className="text-indigo-500 hover:underline">support@elevateai.app</a>.</li>
                        <li>We reserve the right to change pricing with 30 days' notice to existing subscribers.</li>
                    </ul>
                </Section>

                <Section title="5. Acceptable Use">
                    <p>You agree not to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Submit false, misleading, or illegal content.</li>
                        <li>Use the Service to harm, harass, or discriminate against others.</li>
                        <li>Attempt to reverse-engineer, scrape, or abuse the Service's APIs.</li>
                        <li>Use the Service for any unlawful purpose.</li>
                    </ul>
                </Section>

                <Section title="6. Intellectual Property">
                    <p>All content, trademarks, and technology belonging to ElevateAI are our exclusive property. Your resume content remains yours — we claim no ownership over it.</p>
                </Section>

                <Section title="7. Disclaimer of Warranties">
                    <p>The Service is provided "as is" without warranty of any kind. We do not guarantee that the AI-generated content (resume analysis, cover letters, interview questions) will result in job offers or interviews. AI output should be reviewed and verified by you.</p>
                </Section>

                <Section title="8. Limitation of Liability">
                    <p>To the maximum extent permitted by law, ElevateAI shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
                </Section>

                <Section title="9. Termination">
                    <p>We reserve the right to suspend or terminate accounts that violate these Terms at our sole discretion. Upon termination, your data will be deleted within 30 days.</p>
                </Section>

                <Section title="10. Governing Law">
                    <p>These Terms are governed by the laws of India. Any disputes must be resolved in the courts of India.</p>
                </Section>

                <Section title="11. Contact">
                    <p>Questions about these Terms? Email us at <a href="mailto:legal@elevateai.app" className="text-indigo-500 hover:underline">legal@elevateai.app</a>.</p>
                </Section>
            </div>
        </div>
    </div>
);
