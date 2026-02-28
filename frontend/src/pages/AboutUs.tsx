import React from 'react';
import { Link } from 'react-router-dom';

export const AboutUs: React.FC = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white py-24 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-full mb-6">
                    Our Story
                </span>
                <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                    We're on a mission to <span className="text-emerald-400">level the playing field</span>
                </h1>
                <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
                    ElevateAI was built because the job market is unfair. 75% of resumes are rejected before a human ever sees them — not because the candidate is unqualified, but because their resume wasn't optimised for ATS software. We're fixing that.
                </p>
            </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-20 space-y-16">
            <section>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Our Mission</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    We believe every job seeker — regardless of background or resources — deserves a fair shot. ElevateAI uses state-of-the-art NLP and Gemini AI to give everyone access to the same quality of resume feedback that used to cost hundreds of dollars from professional resume writers.
                </p>
            </section>

            <section className="grid md:grid-cols-3 gap-6">
                {[
                    { icon: '🎯', title: 'ATS Score Analysis', desc: 'Instant scoring across 4 dimensions so you know exactly where to improve.' },
                    { icon: '✍️', title: 'AI Bullet Rewriter', desc: 'Our AI rewrites weak bullet points using the XYZ impact formula.' },
                    { icon: '✉️', title: 'Cover Letter AI', desc: 'Generates tailored, compelling cover letters in seconds.' },
                ].map(item => (
                    <div key={item.title} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                        <div className="text-4xl mb-3">{item.icon}</div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </section>

            <section>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Our Values</h2>
                <div className="space-y-4">
                    {[
                        { v: 'Transparency', d: "We tell you exactly why your resume scores the way it does — no black boxes." },
                        { v: 'Accessibility', d: "Core features are always free. Premium tools are priced fairly to be accessible to everyone." },
                        { v: 'Privacy-first', d: "We never sell your data. Your resume is yours, always." },
                    ].map(({ v, d }) => (
                        <div key={v} className="flex gap-4 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <span className="text-emerald-500 font-black text-lg mt-0.5">→</span>
                            <div><p className="font-bold text-slate-900 dark:text-white">{v}</p><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{d}</p></div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="flex gap-4">
                <Link to="/" className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors">Try ElevateAI Free</Link>
                <Link to="/contact" className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Contact Us</Link>
            </div>
        </div>
    </div>
);
