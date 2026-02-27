import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from '../hooks/useInView';

const FREE_FEATURES = [
    '3 resume scans per month',
    'Basic ATS score',
    'Keyword matching overview',
    'ATS formatting check',
];

const PRO_FEATURES = [
    'Unlimited resume scans',
    'Full keyword gap analysis',
    'AI bullet point rewriter',
    'Cover letter generator',
    'Premium export templates',
    'Priority analysis queue',
];

const COMPARISON = [
    { feature: 'Resume scans', free: '3 / month', pro: 'Unlimited' },
    { feature: 'ATS score', free: '✓', pro: '✓' },
    { feature: 'Keyword matching', free: 'Basic', pro: 'Full gap analysis' },
    { feature: 'AI bullet rewriter', free: '—', pro: '✓' },
    { feature: 'Cover letter generator', free: '—', pro: '✓' },
    { feature: 'Premium templates', free: '—', pro: '✓' },
    { feature: 'Priority queue', free: '—', pro: '✓' },
];

const FAQS = [
    { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your Stripe billing portal at any time — no questions asked.' },
    { q: 'Is my payment secure?', a: 'Payments are handled by Stripe. We never store your card details.' },
    { q: 'Do you offer a refund?', a: 'We offer a 7-day money-back guarantee. Just reach out and we\'ll sort it out.' },
];

export const Pricing: React.FC = () => {
    const [annual, setAnnual] = useState(false);
    const heroRef = useInView();
    const tableRef = useInView();
    const faqRef = useInView();

    const monthlyPrice = 19;
    const annualPrice = 15;
    const displayPrice = annual ? annualPrice : monthlyPrice;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

            {/* ── Stats Bar ─────────────────────────────────────────────── */}
            <div className="bg-emerald-500 text-white py-2.5 text-sm font-semibold overflow-hidden">
                <div className="flex gap-16 animate-marquee whitespace-nowrap">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex gap-16 shrink-0">
                            <span>🎉 10,000+ resumes analysed</span>
                            <span>⭐ 4.9 / 5 average rating</span>
                            <span>⚡ Results in under 2 minutes</span>
                            <span>🔒 7-day money-back guarantee</span>
                            <span>🚀 Used by candidates at Google, Meta & Stripe</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

                {/* ── Heading ────────────────────────────────────────────── */}
                <div ref={heroRef} className="section-hidden text-center max-w-3xl mx-auto mb-14">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-5 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        Simple pricing
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-5">
                        Invest in your career,<br />not in resume writers.
                    </h1>
                    <p className="text-xl text-slate-500">
                        Start free. Upgrade when you're ready for the full AI suite.
                    </p>

                    {/* Billing Toggle */}
                    <div className="mt-8 inline-flex items-center gap-3 bg-slate-100 rounded-full p-1 border border-slate-200">
                        <button
                            onClick={() => setAnnual(false)}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${!annual ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setAnnual(true)}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${annual ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
                        >
                            Annual
                            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Save 21%</span>
                        </button>
                    </div>
                </div>

                {/* ── Pricing Cards ──────────────────────────────────────── */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">

                    {/* Free Plan */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
                        <h3 className="text-2xl font-bold text-slate-900 mb-1">Basic Checker</h3>
                        <p className="text-slate-500 mb-6">Perfect for a quick resume review.</p>
                        <div className="mb-8 flex items-end gap-2">
                            <span className="text-5xl font-extrabold text-slate-900">$0</span>
                            <span className="text-slate-500 mb-1">/forever</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            {FREE_FEATURES.map((f, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700">
                                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <Link to="/" className="w-full py-4 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors text-center">
                            Get Started Free
                        </Link>
                    </div>

                    {/* Pro Plan */}
                    <div className="relative bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col md:-translate-y-4">
                        <div className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                            Most Popular
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">ElevateAI Premium</h3>
                        <p className="text-slate-400 mb-6">For serious job seekers.</p>
                        <div className="mb-1 flex items-end gap-2">
                            <span className="text-5xl font-extrabold text-white">${displayPrice}</span>
                            <span className="text-slate-400 mb-1">/month</span>
                        </div>
                        {annual && (
                            <p className="text-emerald-400 text-sm font-semibold mb-6">Billed as ${annualPrice * 12}/year — save $48</p>
                        )}
                        {!annual && <div className="mb-6" />}
                        <ul className="space-y-3 flex-1">
                            {PRO_FEATURES.map((f, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300">
                                    <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <Link to="/checkout" className="mt-8 w-full py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30 text-center hover:-translate-y-0.5 inline-block">
                            Upgrade to Pro →
                        </Link>

                        {/* Money-back badge */}
                        <p className="text-center text-slate-500 text-xs mt-4 flex items-center justify-center gap-1.5">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            7-day money-back guarantee
                        </p>
                    </div>
                </div>

                {/* ── Feature Comparison Table ───────────────────────────── */}
                <div ref={tableRef} className="section-hidden mb-16">
                    <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">Full feature comparison</h2>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="text-left p-5 font-bold text-slate-600">Feature</th>
                                    <th className="p-5 font-bold text-slate-600 text-center">Free</th>
                                    <th className="p-5 font-bold text-emerald-600 text-center">Pro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARISON.map((row, i) => (
                                    <tr key={i} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                                        <td className="p-5 text-slate-700 font-medium">{row.feature}</td>
                                        <td className="p-5 text-center text-slate-400">{row.free}</td>
                                        <td className="p-5 text-center text-emerald-600 font-semibold">{row.pro}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── FAQ Strip ─────────────────────────────────────────── */}
                <div ref={faqRef} className="section-hidden">
                    <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">Common questions</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {FAQS.map((faq, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <p className="font-bold text-slate-800 mb-2">{faq.q}</p>
                                <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
