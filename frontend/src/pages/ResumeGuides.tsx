import React from 'react';
import { Link } from 'react-router-dom';
import { SEO_PAGES } from '../data/seoPages';
import { useSEO } from '../hooks/useSEO';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    Technology: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-100 dark:border-indigo-800' },
    Healthcare: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-100 dark:border-rose-800' },
    Marketing: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-100 dark:border-amber-800' },
    Business: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-100 dark:border-blue-800' },
    Education: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-100 dark:border-emerald-800' },
    Finance: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-100 dark:border-violet-800' },
};

const CATEGORIES = [...new Set(SEO_PAGES.map((p) => p.category))];

const ArrowRight: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

export const ResumeGuides: React.FC = () => {
    useSEO({
        title: 'Free Resume Guides by Role | ATS Tips 2026 — ElevateAI',
        description:
            'Browse expert, ATS-optimized resume guides for every role and industry. Software engineers, nurses, teachers, marketers — find your guide and land more interviews.',
        canonical: 'https://elevateai.app/resume-tips',
    });

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen">
            {/* ── Hero ───────────────────────────────────────────────────────────── */}
            <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-28 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold mb-6">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Free ATS Resume Guides
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                        Resume Guides for Every Role
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
                        Data-backed, ATS-optimized resume advice tailored to your specific job title. Stop guessing — start optimizing.
                    </p>
                    <Link
                        to="/"
                        className="inline-block px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/30 text-base"
                    >
                        Check My Resume Free →
                    </Link>
                </div>
            </section>

            {/* ── Guides by Category ─────────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">
                {CATEGORIES.map((category) => {
                    const pages = SEO_PAGES.filter((p) => p.category === category);
                    const colors = CATEGORY_COLORS[category] ?? { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100' };

                    return (
                        <section key={category}>
                            {/* Category heading */}
                            <div className="flex items-center gap-3 mb-8">
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                                    {category}
                                </span>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                            </div>

                            {/* Guide cards */}
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {pages.map((page) => (
                                    <Link
                                        key={page.slug}
                                        to={`/resume-tips/${page.slug}`}
                                        className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        {/* Tips count badge */}
                                        <div className="absolute top-4 right-4 text-xs font-bold text-slate-400 dark:text-slate-600">
                                            {page.tips.length} tips · {page.faqItems.length} FAQs
                                        </div>

                                        <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-3 pr-16 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {page.h1}
                                        </h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5 line-clamp-2">
                                            {page.metaDescription}
                                        </p>

                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold group-hover:gap-3 transition-all">
                                            Read Guide <ArrowRight />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* ── Bottom CTA ─────────────────────────────────────────────────────── */}
            <section className="bg-slate-900 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-extrabold text-white mb-4">
                        Ready to See Your Real ATS Score?
                    </h2>
                    <p className="text-slate-400 mb-8 max-w-xl mx-auto text-lg">
                        Apply everything you've learned. Upload your resume and get an instant, personalised analysis — free.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/"
                            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/30 text-base"
                        >
                            Scan My Resume — It's Free
                        </Link>
                        <Link
                            to="/pricing"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all text-base"
                        >
                            View Pro Features
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};
