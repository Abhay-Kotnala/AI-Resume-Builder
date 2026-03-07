import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getSeoPageBySlug, getRelatedPages } from '../data/seoPages';
import { useSEO } from '../hooks/useSEO';

const ChevronIcon: React.FC<{ open: boolean }> = ({ open }) => (
    <svg
        className={`w-5 h-5 transition-transform duration-300 ${open ? 'rotate-180' : ''} text-emerald-500`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
);

const CATEGORY_COLORS: Record<string, string> = {
    Technology: 'bg-indigo-100 text-indigo-700',
    Healthcare: 'bg-rose-100 text-rose-700',
    Marketing: 'bg-amber-100 text-amber-700',
    Business: 'bg-blue-100 text-blue-700',
    Education: 'bg-emerald-100 text-emerald-700',
    Finance: 'bg-violet-100 text-violet-700',
};

export const SeoLandingPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const page = slug ? getSeoPageBySlug(slug) : undefined;

    useSEO({
        title: page?.title ?? 'Resume Tips | ElevateAI',
        description: page?.metaDescription ?? 'Expert resume tips from ElevateAI.',
        canonical: page ? `https://elevateai.app/resume-tips/${page.slug}` : undefined,
    });

    // 404 if slug not found in data
    if (!page) {
        return <Navigate to="/resume-tips" replace />;
    }

    const related = getRelatedPages(slug!);
    const categoryColor = CATEGORY_COLORS[page.category] ?? 'bg-slate-100 text-slate-700';

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen">
            {/* ── Hero ─────────────────────────────────────────────────────────── */}
            <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-28 overflow-hidden">
                {/* decorative blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 mb-6">
                        <Link
                            to="/resume-tips"
                            className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                        >
                            Resume Guides
                        </Link>
                        <span className="text-slate-600">/</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColor}`}>
                            {page.category}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
                        {page.h1}
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        {page.intro}
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/"
                            className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/30 text-base"
                        >
                            Check My Resume Free →
                        </Link>
                        <Link
                            to="/pricing"
                            className="px-8 py-3.5 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-semibold rounded-xl transition-all text-base border border-white/20"
                        >
                            View Pro Features
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Tips ─────────────────────────────────────────────────────────── */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-12 text-center">
                    5 ATS-Beating Resume Tips for {page.category === 'Technology' ? 'Tech Roles' : page.category}
                </h2>

                <div className="space-y-6">
                    {page.tips.map((tip, i) => (
                        <div
                            key={i}
                            className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200"
                        >
                            <div className="flex gap-5">
                                {/* Step number */}
                                <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                                    {i + 1}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                        {tip.heading}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {tip.body}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Mid CTA ──────────────────────────────────────────────────────── */}
            <section className="bg-emerald-50 dark:bg-emerald-900/10 border-y border-emerald-100 dark:border-emerald-900/30 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
                        See How Your Resume Scores Right Now
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-xl mx-auto">
                        Upload your resume and get an instant ATS score, keyword analysis, and personalised improvement suggestions — completely free.
                    </p>
                    <Link
                        to="/"
                        className="inline-block px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-base"
                    >
                        Scan My Resume — It's Free
                    </Link>
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────────────────────── */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-10 text-center">
                    Frequently Asked Questions
                </h2>

                <div className="space-y-4">
                    {page.faqItems.map((faq, i) => (
                        <div
                            key={i}
                            className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                aria-expanded={openFaq === i}
                            >
                                <span className="font-bold text-slate-900 dark:text-white pr-4">{faq.question}</span>
                                <ChevronIcon open={openFaq === i} />
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="px-6 pb-6 pt-2 bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Related Guides ───────────────────────────────────────────────── */}
            {related.length > 0 && (
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-8">
                        Related Resume Guides
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {related.map((r) => (
                            <Link
                                key={r.slug}
                                to={`/resume-tips/${r.slug}`}
                                className="group block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all"
                            >
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${CATEGORY_COLORS[r.category] ?? 'bg-slate-100 text-slate-700'}`}>
                                    {r.category}
                                </span>
                                <p className="mt-3 font-bold text-slate-900 dark:text-white text-sm leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {r.h1}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
