import React from 'react';
import { Link } from 'react-router-dom';

export const Pricing: React.FC = () => {
    return (
        <div className="py-24 bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-xl text-slate-600">
                        Start optimizing your resume for free. Upgrade to Pro for unlimited AI rewrites and cover letter generation.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative flex flex-col">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Basic Checker</h3>
                        <p className="text-slate-500 mb-6">Perfect for a quick resume review.</p>
                        <div className="mb-8">
                            <span className="text-5xl font-extrabold text-slate-900">$0</span>
                            <span className="text-slate-500">/forever</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-slate-700">
                                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                3 Resume Scans per month
                            </li>
                            <li className="flex items-center gap-3 text-slate-700">
                                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Basic Keyword Matching
                            </li>
                            <li className="flex items-center gap-3 text-slate-700">
                                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                ATS Formatting Check
                            </li>
                        </ul>
                        <div className="mt-8 flex-grow flex flex-col justify-end">
                            <Link to="/checkout" className="w-full py-4 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors text-center inline-block">
                                Get Started Free
                            </Link>
                        </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl relative flex flex-col transform md:-translate-y-4">
                        <div className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Most Popular
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">ElevateAI Premium</h3>
                        <p className="text-slate-400 mb-6">For serious job seekers.</p>
                        <div className="mb-8">
                            <span className="text-5xl font-extrabold text-white">$19</span>
                            <span className="text-slate-400">/month</span>
                        </div>
                        <ul className="space-y-4 flex-1">
                            <li className="flex items-center gap-3 text-slate-300">
                                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Unlimited Resume Scans
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                AI Bullet Point Rewriter
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Cover Letter Generator
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Premium Templates
                            </li>
                        </ul>
                        <div className="mt-8 flex-grow flex flex-col justify-end">
                            <Link to="/checkout" className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 text-center inline-block">
                                Upgrade to Pro
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
