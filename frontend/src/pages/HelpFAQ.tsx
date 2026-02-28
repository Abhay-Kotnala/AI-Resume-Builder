import React from 'react';
import { FAQSection } from '../components/FAQSection';
import { Link } from 'react-router-dom';

export const HelpFAQ: React.FC = () => (
    <div className="min-h-screen bg-white">
        {/* Hero */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white py-20 px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4">Help Center & FAQ</h1>
            <p className="text-indigo-100 text-lg max-w-xl mx-auto">
                Everything you need to know about ElevateAI. Can't find your answer? <Link to="/contact" className="underline underline-offset-2 hover:text-white">Contact support →</Link>
            </p>
        </div>

        {/* Quick links */}
        <div className="max-w-4xl mx-auto px-4 py-12 grid sm:grid-cols-3 gap-4">
            {[
                { icon: '🚀', label: 'Getting Started', desc: 'Upload your first resume and get a score in 30 seconds.' },
                { icon: '💳', label: 'Billing & Plans', desc: 'Free vs Pro, what\'s included, and how to upgrade.' },
                { icon: '📄', label: 'Resume Tips', desc: 'Best practices to maximise your ATS score.' },
            ].map(c => (
                <div key={c.label} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="text-3xl mb-2">{c.icon}</div>
                    <p className="font-bold text-slate-900 mb-1">{c.label}</p>
                    <p className="text-slate-500 text-sm">{c.desc}</p>
                </div>
            ))}
        </div>

        {/* Reuse the existing FAQ component */}
        <FAQSection />

        {/* Contact CTA */}
        <div className="bg-slate-50 border-t border-slate-100 py-16 px-4 text-center">
            <h2 className="text-2xl font-black text-slate-900 mb-3">Still need help?</h2>
            <p className="text-slate-500 mb-6">Our team typically responds within 24 hours.</p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                Contact Support →
            </Link>
        </div>
    </div>
);
